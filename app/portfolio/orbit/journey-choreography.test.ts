import { describe, expect, it } from 'vitest';
import {
  planetPlacements,
  READING_COLUMN,
  type StageMetrics,
} from './journey-choreography';
import { PROJECTS } from '../project-data';

const RADII = PROJECTS.map((project) => project.planet.radius);
const VIEWPORTS = [
  [390, 600],
  [820, 1100],
  [1600, 900],
  [2560, 1350],
] as const;
const PROGRESSIONS = Array.from({ length: 25 }, (_, i) => i * 0.25);

function stage(width: number, height: number, progress: number): StageMetrics {
  // The hero visual sits right of centre on a wide screen, centred below that.
  const span = Math.min(width * 0.55, height * 0.5);
  return {
    width,
    height,
    span,
    heroX: width < 1024 ? 0 : width * 0.2,
    heroY: 0,
    progress,
  };
}

describe('journey choreography', () => {
  it.each(VIEWPORTS)('keeps every planet on a %ix%i stage', (width, height) => {
    for (const progress of PROGRESSIONS) {
      const placements = planetPlacements(
        stage(width, height, progress),
        RADII,
      );
      for (const [index, planet] of placements.entries()) {
        const onScreen =
          planet.x - planet.radius < width / 2 &&
          planet.x + planet.radius > -width / 2 &&
          planet.y - planet.radius < height / 2 &&
          planet.y + planet.radius > -height / 2;
        expect({ index, progress, onScreen }).toEqual({
          index,
          progress,
          onScreen: true,
        });
      }
    }
  });

  it.each(VIEWPORTS)(
    'never buries one planet inside another at %ix%i',
    (width, height) => {
      for (const progress of PROGRESSIONS) {
        const placements = planetPlacements(
          stage(width, height, progress),
          RADII,
        );
        for (let a = 0; a < placements.length; a++)
          for (let b = a + 1; b < placements.length; b++) {
            const first = placements[a];
            const second = placements[b];
            const distance = Math.hypot(first.x - second.x, first.y - second.y);
            // Overlap is fine as depth; swallowing a smaller planet whole is not.
            const swallowed =
              distance < Math.abs(first.radius - second.radius) * 0.85;
            expect({ a, b, progress, swallowed }).toEqual({
              a,
              b,
              progress,
              swallowed: false,
            });
          }
      }
    },
  );

  it('parks the sky clear of the reading column on a wide viewport', () => {
    const [width, height] = [1600, 900];
    // Once the departure is over: during it the cluster is still crossing.
    for (const progress of PROGRESSIONS.filter((value) => value >= 2)) {
      for (const planet of planetPlacements(
        stage(width, height, progress),
        RADII,
      )) {
        const leftEdge = planet.x - planet.radius + width / 2;
        expect({
          progress,
          clear: leftEdge > width * READING_COLUMN * 0.5,
        }).toEqual({ progress, clear: true });
      }
    }
  });

  it('holds planets to a sane size and hands each chapter its own', () => {
    const metrics = stage(1600, 900, 0);
    const opening = planetPlacements(metrics, RADII);
    for (const planet of opening) {
      expect(planet.departure).toBe(0);
      expect(planet.radius).toBeGreaterThan(30);
      expect(planet.radius).toBeLessThan(900 * 0.3);
    }
    // Each planet peaks in its own chapter, and the opening belongs to none.
    for (let i = 0; i < RADII.length; i++) {
      const own = planetPlacements(stage(1600, 900, i + 1), RADII)[i];
      const elsewhere = planetPlacements(stage(1600, 900, i + 3), RADII)[i];
      expect(own.focus).toBeCloseTo(1, 5);
      expect(elsewhere.focus).toBe(0);
      expect(own.radius).toBeGreaterThan(elsewhere.radius);
    }
  });
});
