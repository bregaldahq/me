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
/**
 * Drawing-buffer pixels a tier may spend. A ratio cap alone punishes phones for
 * their density — a 390x780 viewport at 2x is a third of the work a 1440x824
 * desktop asks for at 1.5x — and that is what left the planets jagged.
 */
export const PIXEL_BUDGETS: Record<RenderTier, number> = {
  static: 0,
  low: 1_500_000,
  medium: 2_200_000,
  high: 2_900_000,
};
/** Never below the viewport's own pixels, never above 2x: past that nobody sees the difference. */
export function sceneDpr(
  tier: RenderTier,
  width: number,
  height: number,
  devicePixelRatio: number,
): number {
  const area = Math.max(1, width * height);
  const affordable = Math.sqrt(PIXEL_BUDGETS[tier] / area);
  return Math.max(1, Math.min(devicePixelRatio, affordable, 2));
}
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
/** The lowest tier has no tier left to drop to, so it gives up resolution instead. */
export function downgradeScale(
  tier: RenderTier,
  scale: number,
  consecutiveSlowFrames: number,
): number {
  if (consecutiveSlowFrames < 45 || tier !== 'low') return scale;
  return Math.max(0.7, scale - 0.15);
}
