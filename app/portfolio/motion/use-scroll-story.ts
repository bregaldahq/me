'use client';

import { useEffect, type RefObject } from 'react';
import type { StoryStateRef } from './story-types';
import type { SceneLayout } from '../orbit/scene-types';
import { getStoryState } from '../orbit/orbit-timeline';
import { storyProgressAt } from './scroll-position';
import { journeyProgressAt, journeyState } from '../orbit/journey-state';

export function useScrollStory(
  storyRef: StoryStateRef,
  layoutRef: RefObject<SceneLayout>,
  enabled: boolean,
  onFailure: () => void,
) {
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let dispose = () => {};
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const story = document.querySelector<HTMLElement>('[data-orbit-story]');
        const visual = document.querySelector<HTMLElement>(
          '[data-orbit-visual]',
        );
        const hero = document.querySelector<HTMLElement>('[data-orbit-stage]');
        if (!story || !visual || !hero) return;
        const chapters = Array.from(
          story.querySelectorAll<HTMLElement>('[data-project-cycle]'),
        );
        let starts: number[] = [];
        let journeyAnchors: number[] = [];
        let end = 0;
        const measure = () => {
          const rect = visual.getBoundingClientRect();
          layoutRef.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + window.scrollY + rect.height / 2,
            span: Math.min(rect.width, rect.height * 1.15),
            scroll: window.scrollY,
            journeyProgress: layoutRef.current.journeyProgress,
            heroHeight: hero.offsetHeight,
            chapterTops: chapters.map(
              (chapter) => chapter.getBoundingClientRect().top + window.scrollY,
            ),
            chapterCopyTops: chapters.map(
              (chapter) =>
                (chapter.firstElementChild ?? chapter).getBoundingClientRect()
                  .top + window.scrollY,
            ),
            navHeight:
              parseFloat(
                getComputedStyle(document.documentElement).getPropertyValue(
                  '--nav-height',
                ),
              ) || 64,
          };
          starts = chapters.map(
            (chapter) =>
              chapter.getBoundingClientRect().top +
              window.scrollY -
              window.innerHeight * 0.65,
          );
          end =
            chapters[chapters.length - 1].getBoundingClientRect().bottom +
            window.scrollY -
            window.innerHeight * 0.65;
          const studio = document.getElementById('studio');
          const contact = document.getElementById('contact');
          const top = (node: HTMLElement | null) =>
            node ? node.getBoundingClientRect().top + window.scrollY : end;
          // Stage timing follows actual content. No pinned sections or artificial scroll length.
          const viewportLead = Math.min(window.innerHeight * 0.38, 360);
          journeyAnchors = [
            0,
            ...chapters.map((chapter) =>
              Math.max(1, top(chapter) - viewportLead),
            ),
            Math.max(end + 1, top(studio) - viewportLead),
            Math.max(
              end + 2,
              top(contact) - Math.min(window.innerHeight * 0.15, 120),
            ),
          ];
          const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight;
          journeyAnchors[6] = maxScroll;
          // Tall viewports can show the studio and contact together; keep the ending reachable.
          for (let i = 5; i > 0; i--)
            journeyAnchors[i] = Math.min(
              journeyAnchors[i],
              journeyAnchors[i + 1] - 1,
            );
        };
        const update = () => {
          layoutRef.current.scroll = window.scrollY;
          const journey = journeyProgressAt(window.scrollY, journeyAnchors);
          layoutRef.current.journeyProgress = journey;
          // One clock for the whole opening: the same easing the planets use
          // now also moves the copy, the monogram and the poster.
          const departure = journeyState(journey).departure;
          // The scene dims as one layer. Per-planet alpha turned overlapping
          // planets into glass, and it is the layer that has to sit behind text.
          const settled = window.innerWidth < 1024 ? 0.34 : 0.5;
          story.style.setProperty(
            '--scene-opacity',
            String(1 - departure * (1 - settled)),
          );
          story.dataset.journeyChapter = journeyState(journey).chapter;
          story.style.setProperty('--journey-progress', String(journey / 6));
          const state = getStoryState(
            storyProgressAt(window.scrollY, starts, end),
            chapters.length,
          );
          storyRef.current = state;
          story.dataset.storyPhase = state.phase;
          hero.style.setProperty('--hero-departure', String(departure));
          document.documentElement.dataset.activeProject =
            chapters[state.projectIndex]?.dataset.projectId ?? '';
          chapters.forEach((chapter, index) => {
            const local =
              index < state.projectIndex
                ? 1
                : index > state.projectIndex
                  ? 0
                  : state.localProgress;
            // Product reading is independent of the continuous scene behind it.
            const reveal = gsap.utils.clamp(0, 1, (local - 0.18) / 0.24);
            const artifact = reveal * reveal * (3 - 2 * reveal);
            const evidence = gsap.utils.clamp(0, 1, (local - 0.48) / 0.25);
            chapter.style.setProperty('--project-progress', String(local));
            chapter.style.setProperty('--artifact-progress', String(artifact));
            chapter.style.setProperty('--evidence-progress', String(evidence));
          });
        };
        const trigger = ScrollTrigger.create({
          trigger: story,
          start: 'top top',
          end: 'bottom top',
          onRefresh: () => {
            measure();
            update();
          },
          onUpdate: update,
          invalidateOnRefresh: true,
        });
        measure();
        update();
        const reveals = gsap.context(() => {
          document
            .querySelectorAll<HTMLElement>('[data-scroll-reveal]')
            .forEach((element) => {
              gsap.from(element, {
                y: window.innerWidth < 768 ? 28 : 65,
                opacity: 0.25,
                duration: 1.05,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: element,
                  start: 'top 92%',
                  once: true,
                },
                clearProps: 'transform,opacity',
              });
            });
        });
        let refreshTimer: ReturnType<typeof setTimeout>;
        const refresh = () => {
          clearTimeout(refreshTimer);
          refreshTimer = setTimeout(() => {
            if (!cancelled) ScrollTrigger.refresh();
          }, 120);
        };
        const observer = new ResizeObserver(refresh);
        observer.observe(hero);
        chapters.forEach((chapter) => observer.observe(chapter));
        observer.observe(story);
        window.addEventListener('orientationchange', refresh);
        void document.fonts?.ready.then(() => {
          if (!cancelled) refresh();
        });
        dispose = () => {
          trigger.kill();
          reveals.revert();
          observer.disconnect();
          clearTimeout(refreshTimer);
          window.removeEventListener('orientationchange', refresh);
          delete document.documentElement.dataset.activeProject;
          delete story.dataset.storyPhase;
          delete story.dataset.journeyChapter;
          story.style.removeProperty('--journey-progress');
          story.style.removeProperty('--scene-opacity');
          hero.style.removeProperty('--hero-departure');
          chapters.forEach((chapter) =>
            [
              '--project-progress',
              '--artifact-progress',
              '--evidence-progress',
            ].forEach((key) => chapter.style.removeProperty(key)),
          );
        };
      })
      .catch(() => {
        if (!cancelled) {
          dispose();
          onFailure();
        }
      });
    return () => {
      cancelled = true;
      dispose();
    };
  }, [enabled, layoutRef, onFailure, storyRef]);
}
