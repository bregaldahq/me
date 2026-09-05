'use client';

import { createRoot, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { WebGLRenderer } from 'three';
import { DPR_CAPS, downgradeTier, type AnimatedTier } from '../performance';
import type { OrbitSceneProps } from './scene-types';
import { JourneyWorld } from './journey-world';

function RendererLifecycle({
  onReady,
  onFailure,
  layoutRef,
  tier,
  lowerTier,
}: Pick<OrbitSceneProps, 'onReady' | 'onFailure' | 'layoutRef'> & {
  tier: AnimatedTier;
  lowerTier: (tier: AnimatedTier) => void;
}) {
  const { gl, setFrameloop, invalidate, setDpr } = useThree();
  const first = useRef(true);
  const slow = useRef(0);
  const readyFrame = useRef(0);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    canvas.addEventListener('webglcontextlost', lost);
    let inStory = true;
    const updateActivity = () => {
      const active = inStory && !document.hidden;
      setFrameloop(active ? 'always' : 'never');
      canvas.setAttribute('data-active', String(active));
      slow.current = 0;
      if (active) invalidate();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inStory = entry.isIntersecting;
        updateActivity();
      },
      { rootMargin: '25% 0px' },
    );
    const story = document.querySelector('[data-orbit-story]');
    if (story) observer.observe(story);
    document.addEventListener('visibilitychange', updateActivity);
    updateActivity();
    return () => {
      cancelAnimationFrame(readyFrame.current);
      canvas.removeEventListener('webglcontextlost', lost);
      document.removeEventListener('visibilitychange', updateActivity);
      observer.disconnect();
    };
  }, [gl, invalidate, onFailure, setFrameloop]);
  useEffect(() => {
    setDpr(Math.min(window.devicePixelRatio, DPR_CAPS[tier]));
  }, [setDpr, tier]);
  useFrame((_, delta) => {
    if (first.current && layoutRef.current.span > 0) {
      first.current = false;
      readyFrame.current = requestAnimationFrame(onReady);
    }
    slow.current = delta > 0.032 ? slow.current + 1 : 0;
    const next = downgradeTier(tier, slow.current);
    if (next !== tier && next !== 'static') {
      slow.current = 0;
      lowerTier(next);
    }
  });
  return null;
}

function SceneContent(props: OrbitSceneProps) {
  const [tier, setTier] = useState<AnimatedTier>(props.tier);
  return (
    <>
      <RendererLifecycle
        onReady={props.onReady}
        onFailure={props.onFailure}
        layoutRef={props.layoutRef}
        tier={tier}
        lowerTier={setTier}
      />
      <JourneyWorld layoutRef={props.layoutRef} tier={tier} />
    </>
  );
}

class WorldBoundary extends Component<
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

export function OrbitScene({
  tier,
  storyRef,
  layoutRef,
  onReady,
  onFailure,
}: OrbitSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // R3F teardown is deferred. A fresh canvas isolates effect replay from the old root.
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    });
    container.appendChild(canvas);
    let cancelled = false;
    let root: ReturnType<typeof createRoot> | undefined;
    let renderer: WebGLRenderer | undefined;
    let observer: ResizeObserver | undefined;
    const size = () => {
      const rect = container.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      };
    };
    // Own initialization: Canvas's asynchronous configure rejection bypasses React boundaries.
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: tier !== 'low',
        powerPreference: 'low-power',
      });
      renderer.debug.onShaderError = () => {
        if (!cancelled) onFailure();
      };
      root = createRoot(canvas);
      void root
        .configure({
          gl: renderer,
          orthographic: true,
          camera: { position: [0, 0, 1000], zoom: 1, near: 0.1, far: 2000 },
          dpr: Math.min(DPR_CAPS[tier], window.devicePixelRatio),
          size: size(),
        })
        .then(() => {
          if (cancelled) return;
          const store = root!.render(
            <WorldBoundary onFailure={onFailure}>
              <SceneContent
                tier={tier}
                storyRef={storyRef}
                layoutRef={layoutRef}
                onReady={onReady}
                onFailure={onFailure}
              />
            </WorldBoundary>,
          );
          observer = new ResizeObserver(() => {
            if (cancelled) return;
            const { width, height, top, left } = size();
            store.getState().setSize(width, height, top, left);
          });
          observer.observe(container);
        })
        .catch(() => {
          if (!cancelled) onFailure();
        });
    } catch {
      onFailure();
    }
    return () => {
      cancelled = true;
      observer?.disconnect();
      canvas.remove();
      if (root) root.unmount();
      else renderer?.dispose();
    };
  }, [layoutRef, onFailure, onReady, storyRef, tier]);
  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}
