// Linear typing: one opening beat, then every character shares a single interval.
export const taglineText = 'the new way to experience fashion.';
const taglineLead = 90;
const taglineInterval = 40;
export const taglineTimes = Array.from(taglineText, (_, index) => taglineLead + (index + 1) * taglineInterval);
// The user extended the montage by 50% and requested a slower ease-out into the identity.
export const timing = { opening: 120, shot: 120, loading: 3000, hold: 80, spawn: 700, shift: 600, write: 900, tagline: taglineTimes.at(-1) + 125 };
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
