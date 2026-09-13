import { frameAt, timing, taglineText, taglineTimes } from './sequence.mjs';

const stage = document.querySelector('.experience');
const progress = document.querySelector('.progress');
const fill = document.querySelector('.progress-fill');
const loadingScene = document.querySelector('.loading-scene');
const identity = document.querySelector('.identity');
const replay = document.querySelector('.replay');
const skip = document.querySelector('.skip');
const status = document.querySelector('.status');
const wordmark = document.querySelector('.wordmark');
const tagline = document.querySelector('.tagline');
const shots = [...document.querySelectorAll('.shot')];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
// CSS and the replay timeline use the same entrance duration.
stage.style.setProperty('--spawn-duration', `${timing.spawn}ms`);
stage.style.setProperty('--shift-duration', `${timing.shift}ms`);
wordmark.replaceChildren(...Array.from(wordmark.textContent, (letter, index) => {
  const span = document.createElement('span');
  span.textContent = letter;
  // Increasing gaps let the wordmark settle more slowly toward its last letters.
  span.style.setProperty('--letter-delay', `${timing.write * (1 - Math.sqrt(1 - (index + 1) / wordmark.textContent.length))}ms`);
  return span;
}));
tagline.replaceChildren(...Array.from(taglineText, (letter, index) => {
  const span = document.createElement('span');
  span.textContent = letter;
  span.style.setProperty('--letter-delay', `${taglineTimes[index]}ms`);
  return span;
}));
let waitingForImages = true;
let request = 0;
let started = 0;
let pausedAt = 0;
let currentShot = -1;
let currentPercent = -1;
let order = shots;

function paint(elapsed) {
  const frame = frameAt(elapsed, order.length);
  stage.dataset.phase = frame.phase;
  loadingScene.style.opacity = frame.montageOpacity;
  fill.style.clipPath = `inset(0 ${(1 - frame.progress) * 100}% 0 0)`;
  // Only whole percents reach the accessibility tree; every frame would invalidate it 60x a second.
  const percent = Math.round(frame.progress * 100);
  if (currentPercent !== percent) {
    progress.setAttribute('aria-valuenow', String(percent));
    currentPercent = percent;
  }
  if (currentShot !== frame.shot) {
    order.forEach((shot, index) => shot.classList.toggle('is-active', index === frame.shot));
    currentShot = frame.shot;
  }
  identity.inert = frame.phase !== 'rest';
  if (frame.phase === 'rest') {
    status.textContent = `dressyou. ${taglineText}`;
    if (document.activeElement === skip) replay.focus({ preventScroll: true });
  }
  return frame.phase;
}

function tick(now) {
  request = 0;
  if (paint(now - started) !== 'rest') request = requestAnimationFrame(tick);
}

function finish() {
  waitingForImages = false;
  cancelAnimationFrame(request);
  request = 0;
  paint(timing.total);
}

function play() {
  waitingForImages = false;
  cancelAnimationFrame(request);
  pausedAt = 0;
  status.textContent = '';
  currentShot = -1;
  currentPercent = -1;
  order = shots.filter((shot) => shot.querySelector('img').naturalWidth > 0);
  // Fisher–Yates avoids the biased ordering of a random sort comparator.
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  shots.forEach((shot) => shot.classList.remove('is-active'));
  if (motion.matches) return finish();
  paint(0);
  started = performance.now();
  if (document.activeElement === replay) skip.focus({ preventScroll: true });
  if (document.hidden) pausedAt = started;
  else request = requestAnimationFrame(tick);
}

replay.addEventListener('click', play);
skip.addEventListener('click', finish);
motion.addEventListener('change', () => { if (motion.matches) finish(); });
document.addEventListener('visibilitychange', () => {
  stage.dataset.paused = String(document.hidden);
  if (document.hidden && request) {
    cancelAnimationFrame(request);
    request = 0;
    pausedAt = performance.now();
  } else if (!document.hidden && pausedAt && stage.dataset.phase !== 'rest') {
    started += performance.now() - pausedAt;
    pausedAt = 0;
    request = requestAnimationFrame(tick);
  }
});

// The skip button stays usable during decoding, and a late image cannot restart a skipped intro.
if (motion.matches) finish();
await Promise.allSettled([document.fonts.ready, ...[...document.images].map((image) => image.decode())]);
if (waitingForImages) play();
