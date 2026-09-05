import { describe, expect, it } from 'vitest';
import { journeyProgressAt, journeyState } from './journey-state';

describe('the planets follow one reversible journey', () => {
  it('transitions from the opening into a persistent background until contact', () => {
    expect(journeyState(0).departure).toBe(0);
    expect(journeyState(0.45).departure).toBeCloseTo(0.5);
    expect(journeyState(1).departure).toBe(1);
    expect(journeyState(4).departure).toBe(1);
    expect(journeyState(4).arrival).toBe(0);
    expect(journeyState(6).arrival).toBe(1);
  });
  it('keeps every pose continuous through chapter changes and reversible', () => {
    for (const boundary of [1, 2, 3, 4, 5]) {
      const before = journeyState(boundary - 0.00001);
      const after = journeyState(boundary + 0.00001);
      for (const key of ['departure', 'arrival'] as const)
        expect(Math.abs(before[key] - after[key])).toBeLessThan(0.001);
      journeyState(6);
      expect(journeyState(boundary - 0.00001)).toEqual(before);
    }
  });
  it('maps unequal content sections without inserting scrolling space', () => {
    expect(journeyProgressAt(0, [0, 600, 1700, 2600])).toBe(0);
    expect(journeyProgressAt(1150, [0, 600, 1700, 2600])).toBe(1.5);
    expect(journeyProgressAt(2150, [0, 600, 1700, 2600])).toBe(2.5);
    expect(journeyProgressAt(9000, [0, 600, 1700, 2600])).toBe(3);
  });
});
