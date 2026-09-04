# Bregalda Portfolio Motion and Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Progressively enhance the complete static portfolio with one persistent, tactile Three.js orbital scene, native-scroll GSAP choreography, deterministic fallbacks, multibrowser accessibility tests, performance budgets, and verified production delivery.

**Architecture:** Pure timeline and capability modules decide what the experience should display without touching the DOM. One client enhancement owns a mutable story-state ref, registers native-scroll observers, and lazily imports a single React Three Fiber scene; the scene reads the ref inside its frame loop while semantic HTML remains authoritative underneath it. CI verifies unit, component, browser, accessibility, visual, bundle, and Lighthouse gates before the existing Cloudflare production workflow can deploy `main`.

**Tech Stack:** Three.js 0.185.1, React Three Fiber 9.7.0, GSAP 3.15.0 with ScrollTrigger, Vitest 4.1.11, Playwright 1.62.1, Axe for Playwright 4.13.0, Lighthouse CI 0.15.1, React 19.2.6, TypeScript 5.9.3, Vite 8.0.13, Cloudflare Workers.

**Spec:** `docs/superpowers/specs/2026-09-02-bregalda-portfolio-design.md`

**Prerequisite:** Complete `docs/superpowers/plans/2026-09-02-bregalda-portfolio-foundation.md` and confirm its full verification passes.

## Global Constraints

- Native scrolling remains in control: no smooth-scroll library, wheel interception, touch interception, drag requirement, or artificial scroll distance after visual work finishes.
- Mount exactly one lazy Three.js canvas for the entire four-project sequence; do not remount it per chapter.
- React/HTML owns every word, link, product artifact, and accessible interaction; WebGL owns only planets, atmosphere, lighting, and camera.
- The first animated frame starts with all four planets visible around the real Bregalda monogram.
- Each project follows orbit → emphasis → approach → artifact → evidence → return → reorganized orbit.
- `prefers-reduced-motion`, `prefers-reduced-data`, unavailable/lost WebGL, and renderer errors select the static experience before motion initializes.
- Reduced-motion opacity transitions are at most 150 milliseconds.
- Device-pixel-ratio caps are exactly 1.0 low, 1.25 medium, and 1.5 high.
- Initial route JavaScript before the orbital import is at most 180 KB gzip; lazy WebGL JavaScript is at most 250 KB gzip.
- Lighthouse mobile LCP is at most 2.5 seconds, CLS is below 0.1, and tested interaction latency is at most 200 milliseconds.
- Required responsive widths are 320, 360, 390, 768, 1024, 1440, 1920, and 2560 CSS pixels; no page-level horizontal overflow is allowed.
- Use only the five approved brand colors and embedded source-SVG colors.
- Never print or commit Cloudflare/GitHub credentials.

## File Structure

- `app/portfolio/orbit/orbit-timeline.ts` — pure normalized progress mapping.
- `app/portfolio/performance.ts` — pure render-tier selection, DPR caps, and adaptive downgrade rules.
- `app/portfolio/motion/story-types.ts` — shared `StoryState` and mutable-ref contracts.
- `app/portfolio/motion/use-scroll-story.ts` — ScrollTrigger setup, DOM variables, refresh, and teardown.
- `app/portfolio/orbit/orbit-enhancement.tsx` — capability gate, one story ref, lazy scene boundary, and static fallback state.
- `app/portfolio/orbit/orbit-error-boundary.tsx` — one-way renderer failure fallback.
- `app/portfolio/orbit/orbit-scene.tsx` — Canvas lifecycle, camera, lights, particles, visibility pausing, and context loss.
- `app/portfolio/orbit/planet.tsx` — reusable procedural sphere, atmosphere, ring, and per-tier geometry.
- `app/portfolio/orbit/procedural-noise.ts` — deterministic GLSL helpers and seeded CPU values.
- `app/portfolio/orbit/orbit-scene.module.css` — canvas layering and ready/fallback transitions.
- `e2e/*.spec.ts` — flow, accessibility, resilience, performance, and visual tests.
- `playwright.config.ts` — Chromium, Firefox, and WebKit projects plus local server.
- `scripts/check-client-budget.mjs` — Vite-manifest gzip budget enforcement.
- `lighthouserc.cjs` — mobile performance collection and assertions.
- `.github/workflows/ci.yml` — complete quality, browser, and performance gates.
- `.github/workflows/deploy-cloudflare.yml` — build-SHA injection into the deployed artifact.

---

### Task 1: Define the Deterministic Scroll-to-Story Timeline

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `app/portfolio/motion/story-types.ts`
- Create: `app/portfolio/orbit/orbit-timeline.test.ts`
- Create: `app/portfolio/orbit/orbit-timeline.ts`

**Interfaces:**

- `StoryPhase = 'orbit' | 'emphasis' | 'approach' | 'artifact' | 'evidence' | 'return'`.
- `getStoryState(progress: number, projectCount?: number): StoryState` is pure, clamps inputs, and defaults to four projects.
- `StoryStateRef = React.MutableRefObject<StoryState>` is consumed by ScrollTrigger and the frame loop without React rerenders.

- [ ] **Step 1: Install exact motion dependencies**

```bash
npm install three@0.185.1 @react-three/fiber@9.7.0 gsap@3.15.0
npm install --save-dev @types/three@0.185.4
```

- [ ] **Step 2: Define the shared story contract**

Create `app/portfolio/motion/story-types.ts`:

```ts
import type { MutableRefObject } from 'react';

export type StoryPhase = 'orbit' | 'emphasis' | 'approach' | 'artifact' | 'evidence' | 'return';

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

export type StoryStateRef = MutableRefObject<StoryState>;
```

- [ ] **Step 3: Write failing interpolation tests**

Create `app/portfolio/orbit/orbit-timeline.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getStoryState } from './orbit-timeline';

describe('getStoryState', () => {
  it('clamps progress and keeps all four projects in deterministic order', () => {
    expect(getStoryState(-1)).toMatchObject({ projectIndex: 0, localProgress: 0, phase: 'orbit' });
    expect(getStoryState(0.25)).toMatchObject({ projectIndex: 1, localProgress: 0, phase: 'orbit' });
    expect(getStoryState(0.5)).toMatchObject({ projectIndex: 2, localProgress: 0, phase: 'orbit' });
    expect(getStoryState(1)).toMatchObject({ projectIndex: 3, localProgress: 1, phase: 'return' });
  });

  it.each([
    [0.02, 'orbit'],
    [0.16, 'emphasis'],
    [0.36, 'approach'],
    [0.56, 'artifact'],
    [0.76, 'evidence'],
    [0.92, 'return'],
  ] as const)('maps local progress %s to %s', (localProgress, phase) => {
    expect(getStoryState(localProgress / 4).phase).toBe(phase);
  });

  it('approaches and returns without discontinuities', () => {
    const close = getStoryState(0.2);
    const returned = getStoryState(0.249999);
    expect(close.approach).toBeGreaterThan(0.9);
    expect(close.cameraZ).toBeLessThan(4);
    expect(returned.approach).toBeLessThan(0.01);
    expect(returned.orbitOpacity).toBeGreaterThan(0.99);
  });
});
```

- [ ] **Step 4: Run the test and verify the missing function failure**

Run `npm test -- app/portfolio/orbit/orbit-timeline.test.ts`.

Expected: FAIL because `./orbit-timeline` does not exist.

- [ ] **Step 5: Implement the clamped phase mapping**

Create `app/portfolio/orbit/orbit-timeline.ts`:

```ts
import type { StoryPhase, StoryState } from '../motion/story-types';

const clamp01 = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
const range = (value: number, start: number, end: number) => clamp01((value - start) / (end - start));

function phaseAt(local: number): StoryPhase {
  if (local < 0.12) return 'orbit';
  if (local < 0.28) return 'emphasis';
  if (local < 0.48) return 'approach';
  if (local < 0.72) return 'artifact';
  if (local < 0.86) return 'evidence';
  return 'return';
}

export function getStoryState(progress: number, projectCount = 4): StoryState {
  const count = Math.max(1, Math.floor(projectCount));
  const clamped = clamp01(progress);
  const scaled = clamped === 1 ? count : clamped * count;
  const projectIndex = Math.min(count - 1, Math.floor(scaled));
  const localProgress = clamped === 1 ? 1 : scaled - projectIndex;
  const returning = range(localProgress, 0.86, 1);
  const emphasis = localProgress < 0.86 ? range(localProgress, 0.08, 0.24) : 1 - returning;
  const approach = localProgress < 0.86 ? range(localProgress, 0.22, 0.48) : 1 - returning;
  const artifact = localProgress < 0.86 ? range(localProgress, 0.44, 0.68) : 1 - returning;
  const evidence = localProgress < 0.86 ? range(localProgress, 0.62, 0.78) : 1 - returning;

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
    orbitRotation: (projectIndex + returning) * (Math.PI / 2),
    cameraZ: 8 - approach * 4.5,
  };
}
```

- [ ] **Step 6: Run tests and commit the deterministic model**

```bash
npm test -- app/portfolio/orbit/orbit-timeline.test.ts
npm run typecheck
git add package.json package-lock.json app/portfolio/motion/story-types.ts app/portfolio/orbit/orbit-timeline.ts app/portfolio/orbit/orbit-timeline.test.ts
git commit -m "feat: model the orbital scroll timeline"
```

---

### Task 2: Select Rendering Tiers Before Effects Initialize

**Files:**

- Create: `app/portfolio/performance.test.ts`
- Create: `app/portfolio/performance.ts`

**Interfaces:**

- `RenderTier = 'static' | 'low' | 'medium' | 'high'`.
- `selectRenderTier(capabilities: CapabilitySnapshot): RenderTier` is pure.
- `detectCapabilities(): CapabilitySnapshot` is client-only and catches context-creation errors.
- `DPR_CAPS` maps low `1`, medium `1.25`, high `1.5`, static `1`.
- `downgradeTier(tier, consecutiveSlowFrames)` lowers one level after 45 consecutive frames over 32 ms.

- [ ] **Step 1: Write failing tier-selection tests**

```ts
import { describe, expect, it } from 'vitest';
import { DPR_CAPS, downgradeTier, selectRenderTier, type CapabilitySnapshot } from './performance';

const capable: CapabilitySnapshot = {
  reducedMotion: false, reducedData: false, webgl: true,
  deviceMemory: 16, hardwareConcurrency: 8, coarsePointer: false,
  viewportWidth: 1440, devicePixelRatio: 2,
};

describe('selectRenderTier', () => {
  it.each([
    [{ reducedMotion: true }, 'static'],
    [{ reducedData: true }, 'static'],
    [{ webgl: false }, 'static'],
    [{ viewportWidth: 390, coarsePointer: true }, 'low'],
    [{ deviceMemory: 4 }, 'low'],
    [{ viewportWidth: 1024 }, 'medium'],
    [{}, 'high'],
  ] as const)('maps %o to %s', (override, expected) => {
    expect(selectRenderTier({ ...capable, ...override })).toBe(expected);
  });

  it('uses the approved DPR caps and adaptive downgrade threshold', () => {
    expect(DPR_CAPS).toEqual({ static: 1, low: 1, medium: 1.25, high: 1.5 });
    expect(downgradeTier('high', 44)).toBe('high');
    expect(downgradeTier('high', 45)).toBe('medium');
    expect(downgradeTier('medium', 45)).toBe('low');
    expect(downgradeTier('low', 45)).toBe('low');
  });
});
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run `npm test -- app/portfolio/performance.test.ts`.

Expected: FAIL because `./performance` does not exist.

- [ ] **Step 3: Implement the pure tier rules and safe browser detection**

Use this exact contract:

```ts
export type RenderTier = 'static' | 'low' | 'medium' | 'high';
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
export const DPR_CAPS: Record<RenderTier, number> = { static: 1, low: 1, medium: 1.25, high: 1.5 };

export function selectRenderTier(c: CapabilitySnapshot): RenderTier {
  if (c.reducedMotion || c.reducedData || !c.webgl) return 'static';
  if (c.viewportWidth < 480 || (c.deviceMemory ?? 16) <= 4 || c.hardwareConcurrency <= 4 || (c.coarsePointer && c.viewportWidth < 1024)) return 'low';
  if (c.viewportWidth < 1280 || (c.deviceMemory ?? 16) <= 8) return 'medium';
  return 'high';
}

export function downgradeTier(tier: RenderTier, consecutiveSlowFrames: number): RenderTier {
  if (consecutiveSlowFrames < 45) return tier;
  return tier === 'high' ? 'medium' : tier === 'medium' ? 'low' : tier;
}
```

Selection order is static for reduced motion/data or failed WebGL; low for width below 480, memory at most 4 GB, at most 4 logical cores, or coarse pointer plus width below 1024; medium for width below 1280 or memory at most 8 GB; high otherwise. WebGL detection creates a temporary canvas, tries `webgl2` then `webgl`, catches errors, removes references, and never logs raw exceptions.

- [ ] **Step 4: Verify and commit capability selection**

```bash
npm test -- app/portfolio/performance.test.ts
npm run check
git add app/portfolio/performance.ts app/portfolio/performance.test.ts
git commit -m "feat: select safe orbital rendering tiers"
```

---

### Task 3: Mount One Lazy Procedural Orbit Scene with a One-Way Fallback

**Files:**

- Create: `app/portfolio/orbit/orbit-error-boundary.tsx`
- Create: `app/portfolio/orbit/orbit-enhancement.test.tsx`
- Create: `app/portfolio/orbit/orbit-enhancement.tsx`
- Create: `app/portfolio/orbit/orbit-scene.tsx`
- Create: `app/portfolio/orbit/planet.tsx`
- Create: `app/portfolio/orbit/procedural-noise.ts`
- Create: `app/portfolio/orbit/orbit-scene.module.css`
- Modify: `app/portfolio/orbit/orbit-stage.tsx`

**Interfaces:**

- `OrbitEnhancement({ projects }: { projects: readonly PortfolioProject[] })` owns one `StoryStateRef` initialized with `getStoryState(0)`.
- `OrbitScene({ projects, storyRef, tier, onReady, onFailure })` mounts one R3F `Canvas`.
- `Planet({ project, index, storyRef, tier })` reads state inside `useFrame` and renders no text.
- The error boundary calls `onFailure()` once and returns `null`; the server-rendered poster/content remains visible.

- [ ] **Step 1: Write failing static-mode and lazy-load tests**

Mock `detectCapabilities` and the dynamic scene module. Test that static capabilities render no canvas root state, high capabilities request exactly one scene import, and a rejected scene import leaves `[data-orbit-fallback]` visible without removing project content.

Use assertions shaped as:

```tsx
expect(screen.queryByTestId('orbit-canvas')).not.toBeInTheDocument();
expect(document.querySelector('[data-orbit-stage]')).toHaveAttribute('data-render-tier', 'static');
expect(document.querySelectorAll('[data-orbit-project]')).toHaveLength(4);
```

Run `npm test -- app/portfolio/orbit/orbit-enhancement.test.tsx` and expect a missing-component failure.

- [ ] **Step 2: Implement a one-way error boundary and capability-gated lazy import**

`OrbitEnhancement` is a client component. In its first effect, call `detectCapabilities`, set `data-render-tier`, and return without importing Three.js for `static`. Otherwise import `./orbit-scene` once, render it inside `OrbitErrorBoundary`, and keep the fallback visible until `onReady`. A failure permanently returns to `static` for that page lifetime; do not retry in a loop.

- [ ] **Step 3: Implement deterministic procedural planet materials**

`procedural-noise.ts` exports seeded scalar noise helpers and GLSL chunks used by `planet.tsx`. The shader combines the project's `base` and `signal` colors through low-frequency FBM, roughness, a cream rim, and a restrained atmosphere. It contains no image texture request and no hue outside the approved palette.

Geometry detail by tier:

```ts
const PLANET_DETAIL = { low: 2, medium: 3, high: 4 } as const;
const PARTICLE_COUNT = { low: 80, medium: 180, high: 320 } as const;
```

Each planet disposes its geometry/material on unmount. Rings and orbital guides fade with `storyRef.current.orbitOpacity` and disappear during close approach.

- [ ] **Step 4: Implement the persistent scene and camera**

The R3F scene contains:

- one transparent canvas over the static stage;
- four `Planet` instances derived only from `PROJECTS`;
- one ambient light, one cream rim light, and one project-signal light;
- one low-count procedural particle field;
- a camera rig that reads `cameraZ`, `orbitRotation`, and `projectIndex` from `storyRef` in `useFrame`;
- restrained pointer parallax only when `matchMedia('(pointer: fine)')` matches;
- `frameloop="always"` while active and invalidation/pausing logic added in Task 5.

The opening frame places every planet inside the camera frustum. The selected planet moves toward the visual product stage while non-selected planets recede; the scene never contains DOM text or clickable WebGL objects.

- [ ] **Step 5: Integrate the enhancement without replacing fallback content**

Add `<OrbitEnhancement projects={projects} />` to the existing `[data-orbit-canvas-root]`. CSS keeps the poster opaque until `[data-orbit-ready="true"]`, then transitions only the decorative image while monogram, labels, and semantic copy stay in HTML.

- [ ] **Step 6: Verify loader behavior, build splitting, and commit**

```bash
npm test -- app/portfolio/orbit/orbit-enhancement.test.tsx app/portfolio/performance.test.ts
npm run check
npx --yes --package node@22.13.0 --call 'npm run build'
git add package.json package-lock.json app/portfolio/orbit app/portfolio/performance.ts
git commit -m "feat: add the lazy procedural orbit scene"
```

Inspect the Vite build output and confirm Three.js/R3F are emitted behind a dynamic import rather than in the initial page entry.

---

### Task 4: Connect Native Scroll to Scene and DOM Reveals

**Files:**

- Create: `app/portfolio/motion/use-scroll-story.test.tsx`
- Create: `app/portfolio/motion/use-scroll-story.ts`
- Modify: `app/portfolio/orbit/orbit-enhancement.tsx`
- Modify: `app/portfolio/projects/project-cycle.tsx`
- Modify: `app/portfolio/portfolio-page.module.css`
- Modify: `app/portfolio/projects/artifacts/artifacts.module.css`

**Interfaces:**

- `useScrollStory(storyRef: StoryStateRef, projectCount: number, enabled: boolean): void` always runs as a hook, but dynamically imports GSAP/ScrollTrigger only inside the enabled effect.
- Each update calls `getStoryState((index + self.progress) / projectCount, projectCount)`.
- CSS variables `--project-progress`, `--artifact-progress`, and `--evidence-progress` are written only on the active chapter.
- `document.documentElement.dataset.activeProject` contains the active project ID and is removed during cleanup.

- [ ] **Step 1: Write the failing lifecycle test with mocked ScrollTrigger**

Mock `gsap.registerPlugin` and `ScrollTrigger.create`. Render a harness containing four `[data-project-cycle]` elements, call the captured `onUpdate` for project two at progress `0.5`, and assert the ref maps to global progress `0.375`. Unmount and assert every returned trigger's `kill()` executes once.

Run `npm test -- app/portfolio/motion/use-scroll-story.test.tsx` and expect a missing-hook failure.

- [ ] **Step 2: Implement ScrollTrigger registration and cleanup**

Inside one client effect, return immediately when `enabled` is false. Otherwise dynamically import `gsap` and `gsap/ScrollTrigger`, check a cancellation flag after the await, and register the plugin. Only the active chapter may write the shared story ref; overlapping triggers must not fight for ownership:

```ts
const chapters = Array.from(document.querySelectorAll<HTMLElement>('[data-project-cycle]'));
const triggers = chapters.map((chapter, index) => ScrollTrigger.create({
  trigger: chapter,
  start: 'top bottom',
  end: 'bottom top',
  scrub: true,
  invalidateOnRefresh: true,
  onUpdate(self) {
    const next = getStoryState((index + self.progress) / projectCount, projectCount);
    storyRef.current = next;
    chapter.style.setProperty('--project-progress', String(next.localProgress));
    chapter.style.setProperty('--artifact-progress', String(next.artifact));
    chapter.style.setProperty('--evidence-progress', String(next.evidence));
    document.documentElement.dataset.activeProject = chapter.dataset.projectId ?? '';
  },
}));
```

Call `ScrollTrigger.refresh()` after fonts finish loading and on orientation changes through a debounced listener. Cleanup removes listeners, kills every trigger, clears inline variables, and deletes `data-active-project`. Do not import or configure `ScrollSmoother`.

- [ ] **Step 3: Add meaningful sticky ranges and reveal variables**

Only animated layouts at 1024 pixels and above may use sticky product stages. Each chapter's extra scroll height must end when its scene return reaches 1. Mobile/tablet remain normal-flow sections with shorter CSS-variable opacity/transform interpolation. DOM artifact text remains readable when variables are unsupported or JavaScript is disabled.

- [ ] **Step 4: Connect the story ref to the scene without React frame rerenders**

Call `useScrollStory(storyRef, projects.length, tier !== 'static')` once inside `OrbitEnhancement`. `OrbitScene` and each `Planet` read `storyRef.current` inside `useFrame`; do not call `setState` on every scroll or animation frame.

- [ ] **Step 5: Verify and commit native-scroll choreography**

```bash
npm test -- app/portfolio/motion/use-scroll-story.test.tsx app/portfolio/orbit/orbit-timeline.test.ts
npm run check
git add app/portfolio/motion app/portfolio/orbit/orbit-enhancement.tsx app/portfolio/projects/project-cycle.tsx app/portfolio/portfolio-page.module.css app/portfolio/projects/artifacts/artifacts.module.css
git commit -m "feat: choreograph projects with native scroll"
```

---

### Task 5: Add Renderer Resilience, Visibility Pausing, and Adaptive Quality

**Files:**

- Create: `app/portfolio/orbit/orbit-lifecycle.test.tsx`
- Modify: `app/portfolio/orbit/orbit-scene.tsx`
- Modify: `app/portfolio/orbit/planet.tsx`
- Modify: `app/portfolio/orbit/orbit-enhancement.tsx`
- Modify: `app/portfolio/performance.ts`
- Modify: `app/portfolio/orbit/orbit-scene.module.css`

**Interfaces:**

- `useOrbitActivity(stage: HTMLElement | null): { documentVisible: boolean; stageVisible: boolean }` listens to `visibilitychange` and one `IntersectionObserver`.
- `onFailure` is idempotent and switches to static once for module, renderer, and context-loss failures.
- Adaptive quality counts consecutive frame durations above 32 ms and calls `downgradeTier` at 45.

- [ ] **Step 1: Write failing lifecycle tests**

Test these exact cases with mocked observers and canvas events:

- hidden document pauses frame work and visible document resumes it;
- stage outside the active story range pauses frame work;
- `webglcontextlost` calls `preventDefault`, switches to static, and does not construct a second renderer;
- 45 consecutive slow frames lower high → medium and medium → low;
- orientation change schedules one ScrollTrigger refresh rather than one refresh per native event.

- [ ] **Step 2: Implement activity observation and context-loss fallback**

Observe a `[data-orbit-story]` wrapper containing the opening and all four chapters with a generous `rootMargin: '25% 0px'`; observing only the opening would incorrectly pause later chapters. Set R3F frameloop to `never` while inactive and invalidate once on resume. Add `webglcontextlost` directly to the renderer DOM element, call `preventDefault`, invoke the one-way failure handler, and remove the listener during cleanup. Do not attempt a renderer restart.

- [ ] **Step 3: Implement adaptive quality without input blocking**

Use `performance.now()` in the frame loop. Reset the slow-frame counter after a frame at or below 32 ms. At 45 consecutive slow frames, lower one tier, reset the counter, cap DPR with `DPR_CAPS[nextTier]`, reduce particles and planet detail on the next safe render boundary, and never promote quality during the same page visit.

- [ ] **Step 4: Finalize pointer, touch, resize, and orientation behavior**

Pointer parallax is capped at 0.12 radians and eases back to zero. Touch has no pointer tracking and relies on scroll depth plus CSS press feedback. Resize/orientation recalculates camera framing without reload; mobile portrait, tablet landscape, desktop, and ultrawide use bounded camera offsets rather than scaling orbit radii indefinitely.

- [ ] **Step 5: Verify and commit resilience**

```bash
npm test -- app/portfolio/orbit/orbit-lifecycle.test.tsx app/portfolio/performance.test.ts
npm run check
npx --yes --package node@22.13.0 --call 'npm run build'
git add app/portfolio/orbit app/portfolio/performance.ts
git commit -m "feat: harden orbital rendering and adaptive quality"
```

---

### Task 6: Add Multibrowser, Accessibility, Resilience, and Visual Tests

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `playwright.config.ts`
- Create: `e2e/portfolio.spec.ts`
- Create: `e2e/accessibility.spec.ts`
- Create: `e2e/resilience.spec.ts`
- Create: `e2e/visual.spec.ts`
- Create: `e2e/__snapshots__/*`

**Interfaces:**

- `npm run test:e2e` runs functional tests on Chromium, Firefox, and WebKit.
- `npm run test:a11y` runs Axe in representative desktop and mobile states.
- `npm run test:visual` compares committed opening, project, artifact, studio, and contact baselines.

- [ ] **Step 1: Install exact browser-test dependencies and scripts**

```bash
npm install --save-dev @playwright/test@1.62.1 @axe-core/playwright@4.13.0
```

Add:

```json
{
  "test:e2e": "playwright test --grep-invert @visual",
  "test:a11y": "playwright test e2e/accessibility.spec.ts",
  "test:visual": "playwright test e2e/visual.spec.ts"
}
```

- [ ] **Step 2: Configure all three browser engines and one retained server**

Create `playwright.config.ts` with `testDir: './e2e'`, `baseURL: 'http://127.0.0.1:4173'`, trace on first retry, screenshot only on failure, and projects `chromium`, `firefox`, and `webkit`. Configure:

```ts
webServer: {
  command: 'npm run dev -- --host 127.0.0.1 --port 4173',
  url: 'http://127.0.0.1:4173',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
}
```

- [ ] **Step 3: Write flow, navigation, overflow, and link tests**

`portfolio.spec.ts` must verify:

- first viewport shows four `[data-orbit-project]` labels and the Bregalda monogram;
- each chapter becomes active while scrolling and returns before the next one;
- keyboard-only Tab order reaches Work, Studio, Contact, every GitHub link, and LinkedIn with visible focus;
- every LinkedIn href exactly matches the approved profile and every GitHub href matches project data;
- widths 320, 360, 390, 768, 1024, 1440, 1920, and 2560 satisfy `document.documentElement.scrollWidth <= document.documentElement.clientWidth`;
- mobile menu controls have bounding boxes at least 44 by 44 pixels;
- collecting `page.on('console')` and `page.on('pageerror')` yields no errors.

- [ ] **Step 4: Write reduced, no-JavaScript, and forced-WebGL-failure tests**

`resilience.spec.ts` creates separate contexts for:

- `reducedMotion: 'reduce'`, asserting no Three.js canvas and all four articles visible;
- `javaScriptEnabled: false`, asserting brand, all project summaries/GitHub links, studio copy, and LinkedIn CTA;
- an init script that makes canvas `getContext('webgl2')` and `getContext('webgl')` return `null`, asserting fallback image/content remains;
- an init script defining `navigator.connection.saveData = true`, asserting static tier before scene import;
- resize from 390×844 to 844×390 and 768×1024 to 1024×768 during the second chapter without console errors or overflow.

- [ ] **Step 5: Write Axe checks**

Run Axe at 390×844 and 1440×900 after the page settles. Disable no rules. Assert zero violations, then explicitly assert one H1, logical H2 project headings, named landmarks, and descriptive external links.

- [ ] **Step 6: Write the visual matrix**

Tag visual tests `@visual`. Capture stable screenshots with reduced motion for:

- opening orbit at all eight required widths;
- each of the four product artifacts at 390×844 and 1440×900;
- studio and contact at 390×844 and 1440×900;
- animated selected-planet states at 1440×900 using deterministic seeds and disabled pointer parallax.

Mask timestamps only; no other dynamic content may exist. Commit the generated baselines only after inspecting every image for clipping, off-palette color, accidental generic-card repetition, and malformed generated text.

- [ ] **Step 7: Run browser suites and commit**

```bash
npx playwright install chromium firefox webkit
npx --yes --package node@22.13.0 --call 'npm run test:e2e'
npx --yes --package node@22.13.0 --call 'npm run test:a11y'
npx --yes --package node@22.13.0 --call 'npm run test:visual'
git add package.json package-lock.json playwright.config.ts e2e
git commit -m "test: cover portfolio across browsers and modes"
```

---

### Task 7: Enforce Bundle, Interaction, Lighthouse, Commit-SHA, and CI Gates

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `scripts/check-client-budget.mjs`
- Create: `lighthouserc.cjs`
- Create: `e2e/performance.spec.ts`
- Modify: `app/layout.tsx`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/deploy-cloudflare.yml`

**Interfaces:**

- `npm run check:bundle` exits nonzero above 180 KB gzip initial or 250 KB gzip orbital.
- `npm run lighthouse` runs three mobile collections against the production Worker build.
- The HTML exposes `<meta name="bregalda:commit" content="<VITE_BUILD_SHA>">`.
- Deploy builds receive the exact validated `workflow_run.head_sha` as `VITE_BUILD_SHA`.

- [ ] **Step 1: Install Lighthouse CI and add performance scripts**

```bash
npm install --save-dev @lhci/cli@0.15.1
```

Add:

```json
{
  "check:bundle": "node scripts/check-client-budget.mjs",
  "lighthouse": "lhci autorun",
  "test:performance": "playwright test e2e/performance.spec.ts --project=chromium"
}
```

- [ ] **Step 2: Write a failing bundle-budget checker fixture test, then implement the checker**

The checker locates the generated client Vite manifest, recursively follows synchronous `imports` from the route entry, and separately follows the dynamic entry whose source ends in `/orbit/orbit-scene.tsx`. Gzip each unique JavaScript file with `node:zlib.gzipSync`; fail above `180 * 1024` initial or `250 * 1024` orbital. Print only category, byte count, and limit—never file contents.

Its final decision must be equivalent to:

```js
if (initialBytes > 180 * 1024 || orbitBytes > 250 * 1024) process.exitCode = 1;
```

- [ ] **Step 3: Configure Lighthouse CI mobile budgets**

Create `lighthouserc.cjs`:

```js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start -- --ip 127.0.0.1 --port 4173',
      startServerReadyPattern: 'Ready on|Ready at|localhost:4173|127.0.0.1:4173',
      url: ['http://127.0.0.1:4173/'],
      numberOfRuns: 3,
      settings: { formFactor: 'mobile', throttlingMethod: 'simulate' },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      },
    },
    upload: { target: 'filesystem', outputDir: './reports/lighthouse' },
  },
};
```

- [ ] **Step 4: Add an interaction-latency browser gate**

`performance.spec.ts` loads 390×844 with the low tier, clicks the mobile menu trigger, records `performance.now()` before input and after the first animation frame where the dialog is visible, and asserts under 200 ms. Repeat for a project GitHub CTA focus/press without navigation. Treat this as an interaction-response regression gate; do not label it field INP telemetry.

- [ ] **Step 5: Expose and inject the validated source commit**

In `app/layout.tsx`, render:

```tsx
<meta name="bregalda:commit" content={import.meta.env.VITE_BUILD_SHA ?? 'development'} />
```

Set `VITE_BUILD_SHA: ${{ github.sha }}` on the CI build. In `deploy-cloudflare.yml`, set `VITE_BUILD_SHA: ${{ github.event.workflow_run.head_sha || github.sha }}` on `Build production worker`.

- [ ] **Step 6: Replace the CI quality job with complete dependent gates**

Keep `permissions: contents: read` and current concurrency. Add:

Ignore `reports/`, `test-results/`, `playwright-report/`, and `.lighthouseci/` in `.gitignore`. Reports remain local or private CI artifacts; do not publish them to temporary public storage.

1. `quality`: npm ci; format check; lint/typecheck; unit coverage; production build; bundle budget.
2. `browser`: needs `quality`; install Chromium, Firefox, WebKit with OS dependencies; run functional, accessibility, and visual suites.
3. `performance`: needs `quality`; install Chromium; build with the same SHA; run interaction and Lighthouse gates.

Increase workflow timeout only where browser installation needs it. Upload Playwright/Lighthouse reports only on failure. The existing deployment workflow remains triggered by the whole `CI` workflow and therefore runs only when all jobs conclude successfully.

- [ ] **Step 7: Run every local performance and quality command**

```bash
npm run format:check
npm run check
npm run test:coverage
npx --yes --package node@22.13.0 --call 'npm run build'
npm run check:bundle
npx --yes --package node@22.13.0 --call 'npm run test:performance'
npx --yes --package node@22.13.0 --call 'npm run lighthouse'
```

Expected: all commands exit zero and report budgets within their exact limits.

- [ ] **Step 8: Commit quality gates**

```bash
git add package.json package-lock.json scripts/check-client-budget.mjs lighthouserc.cjs e2e/performance.spec.ts app/layout.tsx .github/workflows/ci.yml .github/workflows/deploy-cloudflare.yml
git commit -m "ci: enforce portfolio quality and performance gates"
```

---

### Task 8: Review, Publish, and Verify Production

**Files:**

- Modify only files required by verified review findings.

**Interfaces:**

- The Sites preview and `https://bregalda.com` render the same reviewed source.
- The production HTML commit meta equals the deployed `main` commit SHA.

- [ ] **Step 1: Run the complete fresh local verification matrix**

```bash
npm ci
npm run format:check
npm run check
npm run test:coverage
npx --yes --package node@22.13.0 --call 'npm run build'
npm run check:bundle
npx --yes --package node@22.13.0 --call 'npm run test:e2e'
npx --yes --package node@22.13.0 --call 'npm run test:a11y'
npx --yes --package node@22.13.0 --call 'npm run test:visual'
npx --yes --package node@22.13.0 --call 'npm run test:performance'
npx --yes --package node@22.13.0 --call 'npm run lighthouse'
```

Read every exit code and failure count. Do not claim completion from an earlier run.

- [ ] **Step 2: Request two-stage code review**

Invoke `superpowers:requesting-code-review`. First review the implementation against both plan files and every acceptance criterion in the spec; then review code quality, cleanup, disposal, responsiveness, accessibility, and data accuracy. Fix only verified findings, rerun the affected focused test, then rerun the complete matrix.

- [ ] **Step 3: Record the physical-device boundary honestly**

Automated Chromium, Firefox, and WebKit plus all viewport tests are required. If physical iOS Safari and Android Chrome are not available, record that as an explicit remaining manual QA item; do not claim physical-device verification from emulation.

- [ ] **Step 4: Publish through the Sites lifecycle**

Invoke `sites-hosting`, save/publish the verified project, and open the returned Sites URL in the existing preview tab. Verify the exact version identifier returned by the hosting operation before proceeding.

- [ ] **Step 5: Integrate the reviewed branch**

Invoke `superpowers:finishing-a-development-branch`. Use its approved integration path, preserve the clean `main` history, and push only after the complete matrix and review pass.

- [ ] **Step 6: Wait for GitHub CI and Cloudflare deployment**

Watch the `CI` workflow for the pushed SHA, then the dependent `Deploy Cloudflare` workflow. Require success for quality, browser, performance, Worker deployment, and production-domain smoke-test steps.

- [ ] **Step 7: Verify the public domain and exact source SHA**

```bash
DEPLOYED_SHA=$(git rev-parse HEAD)
curl --fail --silent --show-error --location --max-time 20 https://bregalda.com/ > /tmp/bregalda-production.html
grep -F "name=\"bregalda:commit\"" /tmp/bregalda-production.html
grep -F "$DEPLOYED_SHA" /tmp/bregalda-production.html
curl --fail --silent --show-error --output /dev/null --write-out 'status=%{http_code} time=%{time_total}s\n' https://bregalda.com/
```

Expected: HTTP 200 and the production HTML contains the exact deployed SHA. Remove the temporary HTML after verification.

- [ ] **Step 8: Final acceptance audit**

Check all ten acceptance criteria in `docs/superpowers/specs/2026-09-02-bregalda-portfolio-design.md` against fresh evidence. Report any physical-device gap separately; otherwise provide the production URL, CI run, and reviewed commit SHA.

## Motion and Quality Completion Check

- One persistent canvas presents four tactile planets immediately and survives all four scroll cycles.
- Native scroll drives deterministic planet, camera, artifact, evidence, return, and orbit-reorganization states.
- Static, reduced-motion, reduced-data, no-JavaScript, WebGL-failure, and context-loss paths preserve every essential action.
- Multibrowser, keyboard, overflow, Axe, visual, interaction, bundle, Lighthouse, type, lint, format, unit, and build gates pass.
- Production `bregalda.com` serves the reviewed commit from `bregaldahq/me`.
