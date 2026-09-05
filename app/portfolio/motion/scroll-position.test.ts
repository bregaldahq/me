import { describe, expect, it } from 'vitest';
import { storyProgressAt } from './scroll-position';

describe('one scroll owner for the whole story', () => {
  const starts = [500, 2500, 4500, 6500];
  it('holds the opening before the first approach', () => {
    expect(storyProgressAt(0, starts, 8500)).toBe(0);
  });
  it('uses measured chapter boundaries, including unequal chapter heights', () => {
    expect(storyProgressAt(3500, starts, 8500)).toBe(0.375);
    expect(storyProgressAt(2000, [500, 1500, 3500, 6500], 8500)).toBe(0.3125);
  });
  it('has no competing progress values at a boundary or on reverse scroll', () => {
    expect(storyProgressAt(2500, starts, 8500)).toBe(0.25);
    expect(storyProgressAt(2499, starts, 8500)).toBeLessThan(0.25);
    expect(storyProgressAt(9000, starts, 8500)).toBe(1);
  });
  it('handles an unmounted or zero-height layout', () => {
    expect(storyProgressAt(0, [], 0)).toBe(0);
    expect(storyProgressAt(0, [0], 0)).toBe(0);
  });
});
