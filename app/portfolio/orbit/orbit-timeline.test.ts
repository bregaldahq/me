import { describe, expect, it } from 'vitest';
import { getStoryState } from './orbit-timeline';
describe('orbital choreography', () => {
  it.each([
    [0, 0, 0],
    [0.25, 1, 0],
    [0.5, 2, 0],
    [0.75, 3, 0],
    [1, 3, 1],
  ])(
    'maps progress %s to project %s',
    (progress, projectIndex, localProgress) => {
      expect(getStoryState(progress)).toMatchObject({
        projectIndex,
        localProgress,
      });
    },
  );
  it.each([
    [0.02, 'orbit'],
    [0.16, 'emphasis'],
    [0.36, 'approach'],
    [0.56, 'artifact'],
    [0.76, 'evidence'],
    [0.92, 'return'],
  ])('maps local %s to %s', (local, phase) => {
    expect(getStoryState(Number(local) / 4).phase).toBe(phase);
  });
  it('approaches, reveals, and returns to the next stable orbit', () => {
    expect(getStoryState(0.56 / 4).approach).toBe(1);
    expect(getStoryState(0.76 / 4).artifact).toBe(1);
    expect(getStoryState(1)).toMatchObject({ approach: 0, artifact: 0 });
    expect(getStoryState(-1).progress).toBe(0);
    expect(getStoryState(2).progress).toBe(1);
    expect(getStoryState(NaN).progress).toBe(0);
    expect(getStoryState(0.5, NaN).projectIndex).toBe(0);
  });
});
