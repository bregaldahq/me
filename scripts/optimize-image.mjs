import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
const [input, output, width, height] = process.argv.slice(2);
if (
  !input ||
  !output ||
  !Number.isInteger(Number(width)) ||
  !Number.isInteger(Number(height)) ||
  Number(width) < 1 ||
  Number(height) < 1
) {
  throw new Error(
    'Usage: node scripts/optimize-image.mjs input output width height',
  );
}
await mkdir(dirname(output), { recursive: true });
const resized = sharp(input).resize(Number(width), Number(height), {
  fit: 'cover',
  position: 'centre',
});
await (
  output.endsWith('.png')
    ? resized.png({ palette: true, quality: 90, effort: 10 })
    : resized.webp({ quality: 78, effort: 6 })
).toFile(output);
