import type { RefObject } from 'react';
import type { AnimatedTier } from '../performance';
import type { StoryStateRef } from '../motion/story-types';

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
  storyRef: StoryStateRef;
  layoutRef: RefObject<SceneLayout>;
  onReady: () => void;
  onFailure: () => void;
}
