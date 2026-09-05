import { describe, expect, it } from 'vitest';
import {
  selectRenderTier,
  downgradeTier,
  downgradeScale,
  sceneDpr,
  PIXEL_BUDGETS,
  type CapabilitySnapshot,
} from './performance';
const capable: CapabilitySnapshot = {
  reducedMotion: false,
  reducedData: false,
  webgl: true,
  deviceMemory: 16,
  hardwareConcurrency: 8,
  coarsePointer: false,
  viewportWidth: 1440,
  devicePixelRatio: 2,
};
describe('safe animation tiers', () => {
  it.each([
    [{ reducedMotion: true }, 'static'],
    [{ reducedData: true }, 'static'],
    [{ webgl: false }, 'static'],
    [{ viewportWidth: 390, coarsePointer: true }, 'low'],
    [{ deviceMemory: 4 }, 'low'],
    [{ hardwareConcurrency: 2 }, 'low'],
    [{ viewportWidth: 1024 }, 'medium'],
    [{ deviceMemory: 8 }, 'medium'],
    [{}, 'high'],
  ] as const)('selects %s', (override, want) => {
    expect(selectRenderTier({ ...capable, ...override })).toBe(want);
  });
  it.each([
    // A phone earns its own density back: 1x over a 3x panel is what jagged it.
    ['low', 390, 780, 3, 2],
    ['low', 390, 780, 2, 2],
    ['low', 820, 1104, 2, 1.29],
    ['medium', 1280, 800, 2, 1.47],
    ['high', 1440, 824, 2, 1.56],
    // Wide viewports spend the budget on area instead of density.
    ['high', 2560, 1350, 2, 1],
    ['high', 1440, 824, 1, 1],
  ] as const)(
    'fits %s at %ix%i on a %ix screen into the pixel budget',
    (tier, width, height, dpr, want) => {
      expect(sceneDpr(tier, width, height, dpr)).toBeCloseTo(want, 2);
      expect(
        width * height * sceneDpr(tier, width, height, dpr) ** 2,
      ).toBeLessThanOrEqual(Math.max(PIXEL_BUDGETS[tier], width * height) + 1);
    },
  );
  it('caps pixels and only lowers quality after sustained slow frames', () => {
    expect(downgradeTier('high', 44)).toBe('high');
    expect(downgradeTier('high', 45)).toBe('medium');
    expect(downgradeTier('medium', 45)).toBe('low');
    expect(downgradeTier('low', 45)).toBe('low');
    expect(downgradeTier('static', 45)).toBe('static');
    // The lowest tier trades resolution instead, down to a floor.
    expect(downgradeScale('low', 1, 44)).toBe(1);
    expect(downgradeScale('low', 1, 45)).toBeCloseTo(0.85, 2);
    expect(downgradeScale('low', 0.75, 45)).toBe(0.7);
    expect(downgradeScale('medium', 1, 45)).toBe(1);
  });
});
