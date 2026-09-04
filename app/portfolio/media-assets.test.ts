// @vitest-environment node
import { readFile, stat } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
// Vinext declares the optional bare "sharp" module as unknown; use the installed package's own types.
import sharp from 'sharp/lib/index.js';

describe('portfolio media budget', () => {
  it('delivers a complete lightweight orbital poster', async () => {
    const path = new URL(
      '../../public/media/orbit-fallback.webp',
      import.meta.url,
    );
    const [bytes, info] = await Promise.all([readFile(path), stat(path)]);
    expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
    expect(info.size).toBeLessThan(700 * 1024);
    const metadata = await sharp(bytes).metadata();
    expect([metadata.width, metadata.height]).toEqual([1600, 1000]);
  });
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
