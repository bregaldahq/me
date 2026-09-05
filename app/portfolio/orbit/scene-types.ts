import type { RefObject } from 'react';
import type { AnimatedTier } from '../performance';

export interface SceneLayout {
  x: number;
  y: number;
  span: number;
  scroll: number;
  journeyProgress: number;
  heroHeight: number;
  navHeight: number;
  chapterTops: number[];
  chapterCopyTops: number[];
}
export interface OrbitSceneProps {
  tier: AnimatedTier;
  layoutRef: RefObject<SceneLayout>;
  onReady: () => void;
  onFailure: () => void;
}
