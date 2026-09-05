/**
 * Bakes one material map per planet into public/media/planets/.
 *
 * The scene used to synthesise its stone per pixel, which meant every surface
 * detail was point-sampled: anything finer than a pixel turned into noise
 * rather than into rock. Offline there is no frame budget, so this script can
 * afford supersampling, deep octave counts, real craters and Worley crystal
 * cells — and the result ships as a mipmapped texture, which averages detail
 * correctly at every size the journey scales a planet to.
 *
 * Channel packing (RGBA, one file per planet):
 *   R, G  tangent-space normal x and y, 0.5 being flat
 *   B     albedo tone, the mineral's own light and dark
 *   A     accent mask, where the warm vein colour is laid in
 *
 * Colour never enters the file: it stays in PlanetTheme, so the brand palette
 * still drives the planets.
 *
 * Run with: npm run planet-maps
 */
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp/lib/index.js';

/**
 * A parked planet peaks around 580 device pixels across, and only its near
 * hemisphere is visible — half the map's width. 1536 leaves headroom above
 * that; more would ship bytes nobody can resolve.
 *
 * Octave counts are band-limited to roughly ten texels per cycle. Pushing them
 * to the texel is what produced blocking: a lossy codec cannot hold detail at
 * Nyquist, and blocking in a normal map reads as facets in the lighting.
 */
const WIDTH = 1536;
const HEIGHT = 768;
const SUPERSAMPLE = 4;
/**
 * A phone shows a planet at roughly 360 device pixels across, so it is served a
 * downscaled map instead: same stone, a fifth of the bytes. Averaging slopes is
 * exactly what a smaller normal map wants, so this is a resize, not a re-bake.
 */
const SMALL_WIDTH = 768;
const OUTPUT = new URL('../public/media/planets/', import.meta.url);

const fract = (x) => x - Math.floor(x);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, min = 0, max = 1) => Math.min(max, Math.max(min, x));
const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

function hash(x, y, z) {
  let px = fract(x * 0.3183099 + 0.13);
  let py = fract(y * 0.3183099 + 0.71);
  let pz = fract(z * 0.3183099 + 0.37);
  px *= 17;
  py *= 17;
  pz *= 17;
  return fract(px * py * pz * (px + py + pz));
}

/**
 * Perlin gradient noise, seeded.
 *
 * Value noise was cheaper but shows its lattice in the first derivative, and a
 * normal map is nothing but derivative: at this resolution the grid surfaced as
 * axis-aligned plateaus across every planet. Gradient noise with the quintic
 * fade is smooth to the second derivative, which is what keeps the lighting off
 * the grid.
 */
const GRADIENTS = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
];
function permutation(seed) {
  const table = new Uint8Array(512);
  const source = new Uint8Array(256);
  for (let i = 0; i < 256; i++) source[i] = i;
  let state = Math.abs(Math.floor(seed * 2654435761)) % 2147483647 || 1;
  for (let i = 255; i > 0; i--) {
    state = (state * 16807) % 2147483647;
    const j = state % (i + 1);
    const swap = source[i];
    source[i] = source[j];
    source[j] = swap;
  }
  for (let i = 0; i < 512; i++) table[i] = source[i & 255];
  return table;
}
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
function dot(gradient, x, y, z) {
  return gradient[0] * x + gradient[1] * y + gradient[2] * z;
}
function perlin(table, x, y, z) {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const zi = Math.floor(z) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const zf = z - Math.floor(z);
  const u = fade(xf);
  const v = fade(yf);
  const w = fade(zf);
  const at = (a, b, c) =>
    GRADIENTS[table[table[table[a] + b] + c] % GRADIENTS.length];
  const n000 = dot(at(xi, yi, zi), xf, yf, zf);
  const n100 = dot(at(xi + 1, yi, zi), xf - 1, yf, zf);
  const n010 = dot(at(xi, yi + 1, zi), xf, yf - 1, zf);
  const n110 = dot(at(xi + 1, yi + 1, zi), xf - 1, yf - 1, zf);
  const n001 = dot(at(xi, yi, zi + 1), xf, yf, zf - 1);
  const n101 = dot(at(xi + 1, yi, zi + 1), xf - 1, yf, zf - 1);
  const n011 = dot(at(xi, yi + 1, zi + 1), xf, yf - 1, zf - 1);
  const n111 = dot(at(xi + 1, yi + 1, zi + 1), xf - 1, yf - 1, zf - 1);
  return lerp(
    lerp(lerp(n000, n100, u), lerp(n010, n110, u), v),
    lerp(lerp(n001, n101, u), lerp(n011, n111, u), v),
    w,
  );
}
/** Perlin runs -1..1; the mineral recipes are written against 0..1. */
const TABLES = new Map();
function noise(x, y, z, seed = 0) {
  const key = Math.round(seed * 1000);
  let table = TABLES.get(key);
  if (!table) {
    table = permutation(seed + 1);
    TABLES.set(key, table);
  }
  return perlin(table, x, y, z) * 0.5 + 0.5;
}

function fbm(x, y, z, octaves, seed) {
  let value = 0;
  let amplitude = 0.5;
  let px = x + seed;
  let py = y + seed;
  let pz = z + seed;
  for (let i = 0; i < octaves; i++) {
    value += noise(px, py, pz, seed) * amplitude;
    px = px * 2.03 + 2.71;
    py = py * 2.03 + 2.71;
    pz = pz * 2.03 + 2.71;
    amplitude *= 0.5;
  }
  return value;
}

/** Ridged noise: the sharp creases a crack network needs, which fbm alone cannot make. */
function ridged(x, y, z, octaves, seed) {
  let value = 0;
  let amplitude = 0.5;
  let px = x + seed;
  let py = y + seed;
  let pz = z + seed;
  for (let i = 0; i < octaves; i++) {
    value += (1 - Math.abs(noise(px, py, pz, seed) * 2 - 1)) * amplitude;
    px = px * 2.17 + 1.31;
    py = py * 2.17 + 1.31;
    pz = pz * 2.17 + 1.31;
    amplitude *= 0.5;
  }
  return value;
}

/** Deterministic point set on the sphere, for craters and crystal seeds. */
function spherePoints(count, seed) {
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i + seed;
    const jx = hash(i * 0.37, seed, i * 1.7) - 0.5;
    const jy = hash(i * 1.13, seed * 2.1, i * 0.7) - 0.5;
    const jz = hash(i * 2.71, seed * 0.6, i * 3.3) - 0.5;
    const scatter = 0.14;
    const px = Math.cos(theta) * radius + jx * scatter;
    const py = y + jy * scatter;
    const pz = Math.sin(theta) * radius + jz * scatter;
    const length = Math.hypot(px, py, pz) || 1;
    points.push({
      x: px / length,
      y: py / length,
      z: pz / length,
      size: 0.05 + hash(i, seed * 1.3, 2.1) * 0.11,
      depth: 0.4 + hash(i, seed, 5.5) * 0.6,
    });
  }
  return points;
}

/**
 * A uniform grid over the unit cube. Both the craters and the crystal cells ask
 * "which seeds are near this direction", and answering that by scanning every
 * seed is what put a ceiling on resolution and seed count.
 */
function spatialIndex(points, reach) {
  const size = Math.max(reach, 0.05);
  const buckets = new Map();
  const key = (x, y, z) =>
    `${Math.floor(x / size)},${Math.floor(y / size)},${Math.floor(z / size)}`;
  for (const point of points) {
    const id = key(point.x, point.y, point.z);
    const bucket = buckets.get(id);
    if (bucket) bucket.push(point);
    else buckets.set(id, [point]);
  }
  return {
    near(dir) {
      const found = [];
      const cx = Math.floor(dir.x / size);
      const cy = Math.floor(dir.y / size);
      const cz = Math.floor(dir.z / size);
      for (let x = cx - 1; x <= cx + 1; x++)
        for (let y = cy - 1; y <= cy + 1; y++)
          for (let z = cz - 1; z <= cz + 1; z++) {
            const bucket = buckets.get(`${x},${y},${z}`);
            if (bucket) found.push(...bucket);
          }
      return found;
    },
  };
}

/** Craters with a raised rim and a flat floor — the profile that reads as impact. */
function craterField(dir, index) {
  let height = 0;
  let floor = 0;
  for (const point of index.near(dir)) {
    const dot = dir.x * point.x + dir.y * point.y + dir.z * point.z;
    if (dot < 0.9) continue;
    const distance = Math.acos(Math.min(1, dot)) / point.size;
    if (distance > 1.45) continue;
    if (distance < 0.82) {
      const bowl = 1 - (distance / 0.82) ** 2;
      height -= bowl * point.depth * 0.55;
      floor = Math.max(floor, bowl);
    } else {
      const rim = 1 - Math.abs((distance - 1.02) / 0.4);
      if (rim > 0) height += rim * rim * point.depth * 0.3;
    }
  }
  return { height, floor };
}

/** Worley F2 - F1: the chunky faceted cells of a geode. */
function crystalCells(dir, index) {
  let first = 10;
  let second = 10;
  for (const point of index.near(dir)) {
    const dx = dir.x - point.x;
    const dy = dir.y - point.y;
    const dz = dir.z - point.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (distance < first) {
      second = first;
      first = distance;
    } else if (distance < second) {
      second = distance;
    }
  }
  return { edge: second - first, cell: first };
}

const MINERALS = {
  // ReconcileFlow: veined marble, the poster's glossy cracked stone.
  marble: (dir, craters, cells) => {
    const body = fbm(dir.x * 2.4, dir.y * 2.4, dir.z * 2.4, 7, 11);
    const crack = ridged(dir.x * 3.1, dir.y * 3.1, dir.z * 3.1, 6, 3.7);
    const network = smoothstep(0.7, 0.97, crack);
    const hairline = smoothstep(
      0.86,
      0.99,
      ridged(dir.x * 7.4, dir.y * 7.4, dir.z * 7.4, 5, 9.1),
    );
    return {
      height: body * 0.22 - network * 1.7 - hairline * 0.34,
      // A hint of cavity only: the relief does the reading, and carrying it in
      // the albedo instead turns pits into flat black holes.
      tone: clamp(0.24 + body * 0.5 - network * 0.22 - hairline * 0.1),
      accent: clamp(network * 0.7 + hairline * 0.3),
    };
  },
  // Aeternis Log: dark cratered basalt.
  basalt: (dir, craters) => {
    const body = fbm(dir.x * 2.1, dir.y * 2.1, dir.z * 2.1, 7, 23);
    const grit = fbm(dir.x * 9.5, dir.y * 9.5, dir.z * 9.5, 4, 4.3);
    const { height, floor } = craters;
    return {
      height: height * 2.1 + body * 0.16 + grit * 0.035,
      tone: clamp(0.24 + body * 0.42 + grit * 0.06 - floor * 0.16),
      accent: clamp(smoothstep(0.72, 0.99, floor) * grit * 0.9),
    };
  },
  // Workshop API: a geode's crystal crust.
  geode: (dir, craters, cells) => {
    const { edge, cell } = cells;
    const facet = smoothstep(0.16, 0.0, edge);
    const body = fbm(dir.x * 2.6, dir.y * 2.6, dir.z * 2.6, 7, 37);
    const sparkle = fbm(dir.x * 11.0, dir.y * 11.0, dir.z * 11.0, 4, 6.1);
    return {
      height: facet * 0.8 - edge * 1.9 + body * 0.14 + sparkle * 0.03,
      tone: clamp(0.22 + facet * 0.4 + body * 0.3 - cell * 0.26),
      accent: clamp(smoothstep(0.015, 0.0, edge) * 0.55),
    };
  },
  // ChaosSQL: banded agate, its strata warped by the stone underneath.
  agate: (dir) => {
    const warp = fbm(dir.x * 1.6, dir.y * 1.6, dir.z * 1.6, 6, 47);
    const layer = dir.y * 11.5 + warp * 5.2;
    const bands = Math.sin(layer) * 0.5 + 0.5;
    const fine = Math.sin(layer * 5.3) * 0.5 + 0.5;
    const grit = fbm(dir.x * 8.0, dir.y * 8.0, dir.z * 8.0, 4, 2.9);
    return {
      height: bands * 1.1 + fine * 0.3 + grit * 0.035,
      tone: clamp(0.16 + bands * 0.46 + fine * 0.14 + grit * 0.05),
      accent: clamp(
        smoothstep(0.94, 1.0, fine) * 0.5 + smoothstep(0.97, 1.0, bands) * 0.4,
      ),
    };
  },
};

const PLANETS = [
  { file: 'reconcileflow', mineral: 'marble', relief: 1.5, seed: 11 },
  { file: 'aeternis-log', mineral: 'basalt', relief: 1.7, seed: 23 },
  { file: 'workshop-api', mineral: 'geode', relief: 1.5, seed: 37 },
  { file: 'chaossql', mineral: 'agate', relief: 1.4, seed: 47 },
];

/**
 * three's SphereGeometry parameterisation, so the map lands on the mesh's own
 * UVs instead of a projection computed in the shader — which would seam where
 * the longitude wraps.
 */
function direction(u, v) {
  // v runs down the image, and three flips textures on upload, so row 0 has to
  // be the north pole for the map to land the right way up on the sphere.
  const theta = v * Math.PI;
  const phi = u * Math.PI * 2;
  const sinTheta = Math.sin(theta);
  return {
    x: -Math.cos(phi) * sinTheta,
    y: Math.cos(theta),
    z: Math.sin(phi) * sinTheta,
  };
}

async function bake(planet) {
  const surface = MINERALS[planet.mineral];
  // The index caps the cost, so the fields can carry the detail the resolution
  // is able to hold: large craters with small ones inside them, fine crystals.
  const craterPoints = spatialIndex(spherePoints(1100, planet.seed), 0.22);
  const cellPoints = spatialIndex(spherePoints(2400, planet.seed * 1.7), 0.12);
  const height = new Float32Array(WIDTH * HEIGHT);
  const tone = new Float32Array(WIDTH * HEIGHT);
  const accent = new Float32Array(WIDTH * HEIGHT);
  const samples = SUPERSAMPLE * SUPERSAMPLE;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      let h = 0;
      let t = 0;
      let a = 0;
      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          const u = (x + (sx + 0.5) / SUPERSAMPLE) / WIDTH;
          const v = (y + (sy + 0.5) / SUPERSAMPLE) / HEIGHT;
          const dir = direction(u, v);
          const value = surface(
            dir,
            planet.mineral === 'basalt' ? craterField(dir, craterPoints) : null,
            planet.mineral === 'geode' ? crystalCells(dir, cellPoints) : null,
          );
          h += value.height;
          t += value.tone;
          a += value.accent;
        }
      }
      const index = y * WIDTH + x;
      height[index] = h / samples;
      tone[index] = t / samples;
      accent[index] = a / samples;
    }
    if (y % 64 === 0) process.stdout.write(`  ${planet.file} ${y}/${HEIGHT}\r`);
  }
  // Normals from the finished grid: filtered like the height it came from, and
  // corrected for the poles, where texels cover far less surface.
  const pixels = Buffer.alloc(WIDTH * HEIGHT * 4);
  for (let y = 0; y < HEIGHT; y++) {
    const latitude = ((y + 0.5) / HEIGHT) * Math.PI;
    const spacing = Math.max(0.08, Math.sin(latitude));
    for (let x = 0; x < WIDTH; x++) {
      const index = y * WIDTH + x;
      const left = height[y * WIDTH + ((x - 1 + WIDTH) % WIDTH)];
      const right = height[y * WIDTH + ((x + 1) % WIDTH)];
      const up = height[Math.max(0, y - 1) * WIDTH + x];
      const down = height[Math.min(HEIGHT - 1, y + 1) * WIDTH + x];
      // Slopes in UV space: d(height)/d(u) and d(height)/d(v). uv.y runs
      // opposite to the image's rows, hence the sign difference.
      // Compressed rather than clamped: a hard clamp flattened the steepest
      // slopes into plateaus, which is exactly where the stone reads sharpest.
      const nx =
        0.5 + 0.5 * Math.tanh(((right - left) * planet.relief) / (2 * spacing));
      const ny = 0.5 - 0.5 * Math.tanh(((down - up) * planet.relief) / 2);
      const offset = index * 4;
      pixels[offset] = Math.round(nx * 255);
      pixels[offset + 1] = Math.round(ny * 255);
      pixels[offset + 2] = Math.round(clamp(tone[index]) * 255);
      pixels[offset + 3] = Math.round(clamp(accent[index]) * 255);
    }
  }
  const raw = { raw: { width: WIDTH, height: HEIGHT, channels: 4 } };
  const full = await sharp(pixels, raw)
    .webp({ quality: 82, alphaQuality: 85, effort: 6 })
    .toFile(fileURLToPath(new URL(`${planet.file}.webp`, OUTPUT)));
  const small = await sharp(pixels, raw)
    .resize(SMALL_WIDTH, SMALL_WIDTH / 2, { kernel: 'lanczos3' })
    // A phone cannot resolve what the full map holds, so its copy is encoded
    // for weight rather than for detail it will never show.
    .webp({ quality: 66, alphaQuality: 70, effort: 6 })
    .toFile(fileURLToPath(new URL(`${planet.file}-sm.webp`, OUTPUT)));
  console.log(
    `  ${planet.file}  ${(full.size / 1024).toFixed(1)} KB  /  ${(
      small.size / 1024
    ).toFixed(1)} KB small`,
  );
}

const only = process.argv
  .find((arg) => arg.startsWith('--only='))
  ?.slice('--only='.length);

await mkdir(fileURLToPath(OUTPUT), { recursive: true });
console.log(
  `Baking ${WIDTH}x${HEIGHT} planet maps at ${SUPERSAMPLE}x supersampling`,
);
for (const planet of PLANETS)
  if (!only || planet.file === only) await bake(planet);
