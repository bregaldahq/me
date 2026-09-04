import type { RefObject } from 'react';
export type StoryPhase =
  | 'orbit'
  | 'emphasis'
  | 'approach'
  | 'artifact'
  | 'evidence'
  | 'return';
export interface StoryState {
  readonly progress: number;
  readonly projectIndex: number;
  readonly localProgress: number;
  readonly phase: StoryPhase;
  readonly emphasis: number;
  readonly approach: number;
  readonly artifact: number;
  readonly evidence: number;
  readonly orbitOpacity: number;
  readonly orbitRotation: number;
  readonly cameraZ: number;
}
export type StoryStateRef = RefObject<StoryState>;
