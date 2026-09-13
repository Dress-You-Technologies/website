import assert from 'node:assert/strict';

// Exercise the actual browser entrypoint with one available and one failed image.
const element = () => ({
  style: { setProperty() {} }, dataset: {}, textContent: '',
  setAttribute() {}, addEventListener() {}, focus() {}, replaceChildren() {},
});
const images = [
  { naturalWidth: 1122, decode: () => Promise.resolve() },
  { naturalWidth: 0, decode: () => Promise.reject(new Error('unavailable')) },
];
const active = [false, false];
const shots = images.map((image, i) => ({
  querySelector: () => image,
  classList: {
    remove() { active[i] = false; },
    toggle(_, value) { active[i] = value; },
  },
}));
const selectors = ['.experience', '.progress', '.progress-fill', '.loading-scene',
  '.identity', '.replay', '.skip', '.status', '.wordmark', '.tagline'];
const elements = Object.fromEntries(selectors.map(s => [s, element()]));
Object.assign(elements['.wordmark'], {
  textContent: 'dressyou', replaceChildren() {},
});
globalThis.document = {
  querySelector: s => elements[s], querySelectorAll: () => shots,
  createElement: element, images, fonts: { ready: Promise.resolve() },
  addEventListener() {}, hidden: false, activeElement: null,
};
globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
Object.defineProperty(globalThis, 'performance', { value: { now: () => 0 } });
let frame;
globalThis.requestAnimationFrame = callback => { frame = callback; return 1; };
globalThis.cancelAnimationFrame = () => {};
await import('../dist/app.mjs');
for (const elapsed of [120, 240]) {
  frame(elapsed);
  assert.equal(active[1], false, 'failed image must never become active');
  assert.equal(active[0], true, 'decoded image must remain available');
}

