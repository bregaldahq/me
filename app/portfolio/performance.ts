export type RenderTier = 'static' | 'low' | 'medium' | 'high';
export type AnimatedTier = Exclude<RenderTier, 'static'>;
export interface CapabilitySnapshot {
  reducedMotion: boolean;
  reducedData: boolean;
  webgl: boolean;
  deviceMemory?: number;
  hardwareConcurrency: number;
  coarsePointer: boolean;
  viewportWidth: number;
  devicePixelRatio: number;
}
export const DPR_CAPS: Record<RenderTier, number> = {
  static: 1,
  low: 1,
  medium: 1.25,
  high: 1.5,
};
export function selectRenderTier(c: CapabilitySnapshot): RenderTier {
  if (c.reducedMotion || c.reducedData || !c.webgl) return 'static';
  if (
    c.viewportWidth < 480 ||
    (c.deviceMemory ?? 16) <= 4 ||
    c.hardwareConcurrency <= 4 ||
    (c.coarsePointer && c.viewportWidth < 1024)
  )
    return 'low';
  if (c.viewportWidth < 1280 || (c.deviceMemory ?? 16) <= 8) return 'medium';
  return 'high';
}
export function downgradeTier(
  tier: RenderTier,
  consecutiveSlowFrames: number,
): RenderTier {
  if (consecutiveSlowFrames < 45) return tier;
  return tier === 'high' ? 'medium' : tier === 'medium' ? 'low' : tier;
}
