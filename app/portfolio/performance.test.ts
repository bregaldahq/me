import { describe, expect, it } from 'vitest';
import {
  selectRenderTier,
  downgradeTier,
  DPR_CAPS,
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
  it('caps pixels and only lowers quality after sustained slow frames', () => {
    expect(DPR_CAPS).toEqual({ static: 1, low: 1, medium: 1.25, high: 1.5 });
    expect(downgradeTier('high', 44)).toBe('high');
    expect(downgradeTier('high', 45)).toBe('medium');
    expect(downgradeTier('medium', 45)).toBe('low');
    expect(downgradeTier('low', 45)).toBe('low');
    expect(downgradeTier('static', 45)).toBe('static');
  });
});
