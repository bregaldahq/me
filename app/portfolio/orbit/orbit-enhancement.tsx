'use client';

import {
  Component,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { selectRenderTier, type RenderTier } from '../performance';
import { getStoryState } from './orbit-timeline';
import { useScrollStory } from '../motion/use-scroll-story';
import type { OrbitSceneProps, SceneLayout } from './scene-types';
import styles from './orbit-scene.module.css';

class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function OrbitEnhancement() {
  const [tier, setTier] = useState<RenderTier>('static');
  const [Scene, setScene] = useState<ComponentType<OrbitSceneProps> | null>(
    null,
  );
  const [ready, setReady] = useState(false);
  const failed = useRef(false);
  const userNavigated = useRef(false);
  const enhanced = useRef(false);
  const storyRef = useRef(getStoryState(0));
  const layoutRef = useRef<SceneLayout>({
    x: 0,
    y: 0,
    span: 0,
    scroll: 0,
    journeyProgress: 0,
    heroHeight: 1,
    navHeight: 64,
    chapterTops: [],
    chapterCopyTops: [],
  });
  const onFailure = useCallback(() => {
    failed.current = true;
    setTier('static');
    setReady(false);
  }, []);
  const onReady = useCallback(() => {
    if (!failed.current) setReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const markNavigation = () => {
      userNavigated.current = true;
    };
    window.addEventListener('wheel', markNavigation, { passive: true });
    window.addEventListener('touchstart', markNavigation, { passive: true });
    window.addEventListener('keydown', markNavigation);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const data = window.matchMedia('(prefers-reduced-data: reduce)');
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;
    const preferenceChanged = () => {
      if (motion.matches || data.matches || connection?.saveData) onFailure();
    };
    motion.addEventListener('change', preferenceChanged);
    data.addEventListener('change', preferenceChanged);
    connection?.addEventListener('change', preferenceChanged);
    if (!motion.matches && !data.matches && !connection?.saveData) {
      // Three r185 requires WebGL2. Probe only after accessibility/data preferences.
      const probe = document.createElement('canvas');
      let supported = false;
      try {
        const gl = probe.getContext('webgl2');
        supported = Boolean(gl);
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
      } catch {
        supported = false;
      }
      const selected = selectRenderTier({
        reducedMotion: false,
        reducedData: false,
        webgl: supported,
        deviceMemory: (navigator as Navigator & { deviceMemory?: number })
          .deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency || 4,
        coarsePointer: window.matchMedia('(pointer: coarse)').matches,
        viewportWidth: window.innerWidth,
        devicePixelRatio: window.devicePixelRatio,
      });
      if (selected !== 'static') {
        void import('./orbit-scene')
          .then((module) => {
            if (!cancelled && !failed.current) {
              setScene(() => module.OrbitScene);
              setTier(selected);
            }
          })
          .catch(onFailure);
      }
    }
    return () => {
      cancelled = true;
      motion.removeEventListener('change', preferenceChanged);
      data.removeEventListener('change', preferenceChanged);
      connection?.removeEventListener('change', preferenceChanged);
      window.removeEventListener('wheel', markNavigation);
      window.removeEventListener('touchstart', markNavigation);
      window.removeEventListener('keydown', markNavigation);
    };
  }, [onFailure]);

  useLayoutEffect(() => {
    const story = document.querySelector<HTMLElement>('[data-orbit-story]');
    if (story)
      story.dataset.motion = ready
        ? 'ready'
        : tier === 'static'
          ? 'static'
          : 'loading';
    if (tier !== 'static' && !enhanced.current) {
      enhanced.current = true;
      const target = document.getElementById(location.hash.slice(1));
      if (!userNavigated.current && target?.matches('[data-project-cycle]'))
        target.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    return () => {
      if (story) delete story.dataset.motion;
    };
  }, [ready, tier]);
  useScrollStory(storyRef, layoutRef, tier !== 'static', onFailure);

  if (!Scene || tier === 'static') return null;
  return (
    <div className={styles.track} aria-hidden="true">
      <div className={styles.viewport} data-orbit-canvas>
        <SceneBoundary onFailure={onFailure}>
          <Scene
            tier={tier}
            storyRef={storyRef}
            layoutRef={layoutRef}
            onReady={onReady}
            onFailure={onFailure}
          />
        </SceneBoundary>
      </div>
      <div className={styles.progress}>
        <span />
      </div>
    </div>
  );
}
