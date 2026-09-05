/** A single measured owner avoids overlapping chapters fighting over the camera. */
export function storyProgressAt(
  scroll: number,
  starts: readonly number[],
  end: number,
): number {
  if (!starts.length || end <= starts[0]) return 0;
  let index = 0;
  while (index < starts.length - 1 && scroll >= starts[index + 1]) index++;
  const finish = starts[index + 1] ?? end;
  const local = Math.min(
    1,
    Math.max(0, (scroll - starts[index]) / Math.max(1, finish - starts[index])),
  );
  return (index + local) / starts.length;
}
