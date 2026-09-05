// @vitest-environment node
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
// Vinext declares the optional bare "sharp" module as unknown; use the installed package's own types.
import sharp from 'sharp/lib/index.js';
import { PROJECT_IDS } from './project-data';

describe('portfolio media budget', () => {
  it.each([
    ['', 1536, 768, 1700],
    ['-sm', 768, 384, 560],
  ])(
    'ships a %s material map per planet at %ix%i, under %i KB in total',
    async (suffix, width, height, budget) => {
      const maps = await Promise.all(
        PROJECT_IDS.map(async (id) => {
          const bytes = await readFile(
            new URL(
              `../../public/media/planets/${id}${suffix}.webp`,
              import.meta.url,
            ),
          );
          return { id, bytes, metadata: await sharp(bytes).metadata() };
        }),
      );
      for (const { id, metadata } of maps) {
        // Equirectangular, so width is twice height, and the fourth channel
        // carries the accent mask alongside the normal and the tone.
        expect([id, metadata.width, metadata.height]).toEqual([
          id,
          width,
          height,
        ]);
        expect([id, metadata.hasAlpha]).toEqual([id, true]);
      }
      const total = maps.reduce((sum, { bytes }) => sum + bytes.length, 0);
      expect(total).toBeLessThan(budget * 1024);
    },
  );
  it('provides a correctly sized lightweight social preview', async () => {
    const bytes = await readFile(
      new URL('../../public/og.png', import.meta.url),
    );
    expect([...bytes.subarray(0, 8)]).toEqual([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([
      1200, 630,
    ]);
    expect(bytes.length).toBeLessThan(1024 * 1024);
  });
});
