import assert from 'node:assert/strict';
import test from 'node:test';
import { timing, frameAt } from '../dist/sequence.mjs';

test('hard cuts repeat the available images and reveal the identity at three seconds', () => {
  assert.equal(timing.loading, 3000);
  assert.deepEqual(frameAt(0, 4), { phase: 'loading', progress: 0, shot: -1, montageOpacity: 1 });
  const shots = Array.from({ length: 8 }, (_, i) =>
    frameAt(timing.opening + i * timing.shot, 4).shot);
  assert.deepEqual(shots, [0, 1, 2, 3, 0, 1, 2, 3]);
  assert.equal(frameAt(timing.loading - timing.hold - 1, 4).phase, 'loading');
  assert.equal(frameAt(timing.loading - timing.hold).phase, 'loading');
  assert.equal(frameAt(timing.loading - timing.hold).progress, 1);
  assert.equal(frameAt(timing.loading).progress, 1);
  assert.equal(frameAt(timing.loading).phase, 'spawn');
  assert.equal(frameAt(timing.loading + timing.spawn).phase, 'shift');
  assert.equal(frameAt(timing.loading + timing.spawn + timing.shift).phase, 'write');
  assert.equal(frameAt(timing.loading + timing.spawn + timing.shift + timing.write).phase, 'tagline');
  assert.equal(frameAt(timing.total).phase, 'rest');
  assert.equal(frameAt(timing.total + timing.write).phase, 'rest');
  assert.equal(frameAt(timing.opening, 0).shot, -1);
});

test('progress never retreats or exceeds completion; a replay begins cleanly', () => {
  let previous = 0;
  for (let elapsed = 0; elapsed <= timing.total; elapsed += 17) {
    const frame = frameAt(elapsed);
    assert.ok(frame.progress >= previous && frame.progress <= 1);
    previous = frame.progress;
  }
  assert.equal(frameAt(0).progress, 0);
  assert.equal(frameAt(0).shot, -1);
});

test('tagline types at one constant pace and completes before rest', async () => {
  const { taglineText, taglineTimes } = await import('../dist/sequence.mjs');
  assert.equal(taglineText, 'the new way to experience fashion.');
  assert.equal(taglineTimes.length, taglineText.length);
  const gaps = taglineTimes.map((time, i) => time - (taglineTimes[i - 1] ?? 0));
  assert.ok(gaps.every(gap => gap > 0));
  // Every character after the opening beat shares one interval: no per-word rhythm.
  const typing = gaps.slice(1);
  assert.equal(new Set(typing).size, 1, 'typing must be linear');
  assert.ok(gaps[0] >= typing[0], 'a single beat precedes the first character');
  assert.ok(taglineTimes.at(-1) <= timing.tagline);
  assert.ok(timing.tagline <= 1700, 'tagline should finish in about half the previous time');
  assert.ok(timing.spawn > 300 && timing.shift > 220 && timing.write > 640);
});


test('hard cuts keep playing as the identity fades them to black', () => {
  const fadeEnd = timing.loading + timing.spawn + timing.shift + timing.write;
  assert.equal(frameAt(timing.loading, 6).montageOpacity, 1);
  assert.notEqual(frameAt(timing.loading, 6).shot, -1);
  assert.notEqual(frameAt(timing.loading + timing.shot, 6).shot, frameAt(timing.loading, 6).shot);
  let previous = 1;
  for (let elapsed = timing.loading + 17; elapsed < fadeEnd; elapsed += 17) {
    const frame = frameAt(elapsed, 6);
    assert.ok(frame.montageOpacity > 0 && frame.montageOpacity < previous);
    assert.ok(frame.shot >= 0);
    previous = frame.montageOpacity;
  }
  assert.equal(frameAt(fadeEnd, 6).montageOpacity, 0);
  assert.equal(frameAt(fadeEnd, 6).shot, -1);
  assert.equal(frameAt(0, 6).montageOpacity, 1);
});
