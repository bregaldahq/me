/** One continuous planetary scene, timed by content rather than scroll spacers. */
export const JOURNEY_CHAPTERS = [
  'opening',
  'reconcileflow',
  'aeternis-log',
  'workshop-api',
  'chaossql',
  'studio',
  'contact',
] as const;
export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
export const easeRange = (value: number, start: number, end: number) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

export function journeyState(progress: number) {
  const p = clamp(Number.isFinite(progress) ? progress : 0, 0, 6);
  return {
    progress: p,
    chapter: JOURNEY_CHAPTERS[Math.min(6, Math.floor(p))],
    departure: easeRange(p, 0, 0.9),
    arrival: easeRange(p, 5, 6),
  };
}

/** Content positions own the timing, including arbitrary text heights and resized windows. */
export function journeyProgressAt(scroll: number, anchors: readonly number[]) {
  if (anchors.length < 2 || scroll <= anchors[0]) return 0;
  for (let i = 1; i < anchors.length; i++) {
    if (scroll < anchors[i])
      return (
        i -
        1 +
        clamp(
          (scroll - anchors[i - 1]) / Math.max(1, anchors[i] - anchors[i - 1]),
        )
      );
  }
  return anchors.length - 1;
}
