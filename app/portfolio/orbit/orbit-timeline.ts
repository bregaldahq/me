import type { StoryPhase, StoryState } from '../motion/story-types';
const clamp01 = (value: number) =>
  Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
const range = (value: number, start: number, end: number) =>
  clamp01((value - start) / (end - start));
function phaseAt(local: number): StoryPhase {
  if (local < 0.12) return 'orbit';
  if (local < 0.28) return 'emphasis';
  if (local < 0.48) return 'approach';
  if (local < 0.72) return 'artifact';
  if (local < 0.86) return 'evidence';
  return 'return';
}
export function getStoryState(progress: number, projectCount = 4): StoryState {
  const count = Number.isFinite(projectCount)
    ? Math.max(1, Math.floor(projectCount))
    : 1;
  const clamped = clamp01(progress);
  const scaled = clamped * count;
  const projectIndex = Math.min(count - 1, Math.floor(scaled));
  const localProgress = clamped === 1 ? 1 : scaled - projectIndex;
  const returning = range(localProgress, 0.86, 1);
  const emphasis =
    localProgress < 0.86 ? range(localProgress, 0.08, 0.24) : 1 - returning;
  const approach =
    localProgress < 0.86 ? range(localProgress, 0.22, 0.48) : 1 - returning;
  const artifact =
    localProgress < 0.86 ? range(localProgress, 0.44, 0.68) : 1 - returning;
  const evidence =
    localProgress < 0.86 ? range(localProgress, 0.62, 0.78) : 1 - returning;
  return {
    progress: clamped,
    projectIndex,
    localProgress,
    phase: phaseAt(localProgress),
    emphasis,
    approach,
    artifact,
    evidence,
    orbitOpacity: 1 - approach,
    orbitRotation: ((projectIndex + returning) * Math.PI) / 2,
    cameraZ: 8 - approach * 4.5,
  };
}
