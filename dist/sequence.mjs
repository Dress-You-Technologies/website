// Art-directed typing: text, letter interval and pause before each word, in milliseconds.
const words = [['the ', 32, 0], ['new ', 78, 150], ['way ', 48, 90], ['to ', 80, 120], ['experience ', 55, 160], ['fashion.', 85, 100]];
export const taglineText = words.map(([word]) => word).join('');
// Keep the irregular rhythm, but finish the tagline twice as quickly.
const taglinePace = .5;
let cursor = 180;
export const taglineTimes = words.flatMap(([word, interval, pause]) => {
  cursor += pause;
  return Array.from(word, (_, index) => cursor += interval + (index % 3 - 1) * 7);
}).map(time => time * taglinePace);
// The user extended the montage by 50% and requested a slower ease-out into the identity.
export const timing = { opening: 120, shot: 120, loading: 3000, hold: 80, spawn: 700, shift: 600, write: 900, tagline: (cursor + 250) * taglinePace };
timing.total = timing.loading + timing.spawn + timing.shift + timing.write + timing.tagline;

export function frameAt(elapsed, imageCount = 0) {
  const progress = Math.min(1, Math.max(0, elapsed / (timing.loading - timing.hold)));
  const fadeDuration = timing.spawn + timing.shift + timing.write;
  const fadeProgress = Math.min(1, Math.max(0, (elapsed - timing.loading) / fadeDuration));
  return {
    // Quadratic ease-out fades the hard cuts behind the entire identity reveal.
    montageOpacity: (1 - fadeProgress) ** 2,
    phase: elapsed < timing.loading ? 'loading'
      : elapsed < timing.loading + timing.spawn ? 'spawn'
      : elapsed < timing.loading + timing.spawn + timing.shift ? 'shift'
      : elapsed < timing.loading + timing.spawn + timing.shift + timing.write ? 'write'
      : elapsed < timing.total ? 'tagline' : 'rest',
    progress,
    shot: imageCount === 0 || elapsed < timing.opening || fadeProgress === 1
      ? -1 : Math.floor((elapsed - timing.opening) / timing.shot) % imageCount,
  };
}
