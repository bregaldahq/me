import { clamp, easeRange, journeyState } from './journey-state';

export interface StageMetrics {
  /** Viewport in CSS pixels. The world is centred on it: x runs -width/2..width/2. */
  readonly width: number;
  readonly height: number;
  /** The hero visual's short side, which sizes the opening cluster. */
  readonly span: number;
  /** Centre of the opening cluster, in world coordinates. */
  readonly heroX: number;
  readonly heroY: number;
  /** Journey progress: 0 at the opening, 6 at contact. */
  readonly progress: number;
}
export interface Placement {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  /** 0 while a planet waits its turn, 1 at the centre of its own chapter. */
  readonly focus: number;
  /** 0 in the opening cluster, 1 once parked in the sky. */
  readonly departure: number;
}

/** The opening cluster, read off the poster: a 0.31 x 0.25 ellipse of the span. */
const CLUSTER_X = 0.31;
const CLUSTER_Y = 0.25;
const CLUSTER_RADIUS = 0.132;
/** Parked size per planet, as a fraction of the viewport's short edge. */
const SIZES = [0.19, 0.115, 0.13, 0.1] as const;
/** How much a planet grows while its own chapter is being read. */
const FOCUS_GROWTH = 0.28;
/** Fraction of its room a planet actually uses, so nothing sits on the frame. */
const FILL = 0.82;
/** Nearer planets travel further per unit of scroll: depth, under an orthographic camera. */
const PARALLAX = [1, 0.82, 0.66, 0.52] as const;
/**
 * Fraction of the width the reading column holds on a wide viewport. The sky
 * parks clear of it rather than behind the text.
 */
export const READING_COLUMN = 0.45;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Where each planet sits for a given scroll position.
 *
 * Planets leave the opening cluster along their own ray, 90 degrees apart, so
 * no two paths can cross and no planet can be swallowed by a larger one — which
 * is what the previous layout did, interpolating each planet towards a fixed
 * point that happened to sit behind its neighbour. Distances are derived from
 * the room actually available, so the cast stays on screen at any proportion
 * instead of being parked past the right edge.
 *
 * Pure, so the whole stage can be checked without a renderer.
 */
export function planetPlacements(
  stage: StageMetrics,
  radii: readonly number[],
): Placement[] {
  const { width, height, span, heroX, heroY } = stage;
  const progress = clamp(stage.progress, 0, 6);
  const reach = Math.min(width, height);
  const compact = width < 1024;
  const arrival = journeyState(progress).arrival;
  // The band the sky may occupy, and the point it expands around once parked.
  const columnEdge = compact ? -width / 2 : -width / 2 + width * READING_COLUMN;
  const skyX = (columnEdge + width / 2) / 2;
  return radii.map((themeRadius, i) => {
    const parallax = PARALLAX[i % PARALLAX.length];
    // Staggered exits: the cluster leaves a planet at a time, where before all
    // four moved at once and crossed each other.
    const departure = easeRange(progress, i * 0.12, 0.9 + i * 0.12);
    // Every chapter promotes its own planet. Before, the whole choreography was
    // over inside the first 15% of the scroll and nothing followed it.
    const focus = 1 - clamp(Math.abs(progress - (i + 1)));
    const parkedRadius =
      SIZES[i % SIZES.length] *
      reach *
      (0.86 + focus * FOCUS_GROWTH) *
      (1 - arrival * 0.55);
    const radius = lerp(
      span * CLUSTER_RADIUS * themeRadius,
      parkedRadius,
      departure,
    );
    // A slow shared turn keeps the ring alive without ever closing the 90
    // degrees between neighbours.
    const angle = Math.PI / 2 - (i * Math.PI) / 2 + progress * 0.06 * parallax;
    const centreX = lerp(heroX, skyX, departure);
    const centreY = lerp(heroY, 0, departure);
    const room = Math.min(
      width / 2 - radius - skyX,
      skyX - columnEdge - radius,
      height / 2 - radius,
    );
    // Breathing along the ray, which cannot bring two planets together.
    const breath = 1 + Math.sin(progress + i) * 0.05 * parallax;
    const reachX = lerp(span * CLUSTER_X, Math.max(0, room) * FILL, departure);
    const reachY = lerp(span * CLUSTER_Y, Math.max(0, room) * FILL, departure);
    return {
      x: centreX + Math.cos(angle) * reachX * breath,
      y: centreY + Math.sin(angle) * reachY * breath,
      radius,
      focus,
      departure,
    };
  });
}
