import {
  Color,
  DataTexture,
  NoColorSpace,
  RGBAFormat,
  ShaderMaterial,
  type Texture,
} from 'three';
import type { PlanetTheme } from '../project-data';

/**
 * Flat stand-in until the planet's material map arrives: a level normal, a mid
 * tone and no accent, so a planet is a smooth lit sphere rather than nothing.
 */
function neutralMap() {
  const texture = new DataTexture(
    new Uint8Array([128, 128, 128, 0]),
    1,
    1,
    RGBAFormat,
  );
  texture.colorSpace = NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Lit stone, textured from a baked material map (scripts/generate-planet-maps.mjs).
 * The detail is mipmapped, so it stays stone at every size the journey scales a
 * planet to instead of aliasing into noise, which per-pixel procedural texture
 * could not do. Colour still comes from the theme, never from the file.
 */
/**
 * A three-stop ramp per mineral, measured off the poster rather than invented.
 *
 * Sampling its four planets showed something the eye misses: they share one
 * palette — a plum shadow near #34253c, a mauve body near #7f6485 and a pale
 * pink crest near #e2cdd4 — and differ by surface, not by colour. Chasing four
 * distinct hues is what pushed the geode to blow out to white and left the rest
 * far more violet than the reference. The theme's own colour tints each stop,
 * so the brand still reads, without steering the whole planet.
 */
const MINERALS = [
  // Veined marble: the warmest crest of the four, gold down in the cracks.
  {
    deep: '#3a2440',
    mid: '#8a6a8e',
    pale: '#ead0d9',
    vein: '#d9a24a',
    relief: 2.1,
    pale0: 0.5,
    paleMix: 0.62,
    accent: 0.3,
  },
  // Cratered basalt: the darkest body, rust in the pits.
  {
    deep: '#2e2136',
    mid: '#7d6383',
    pale: '#c9aec6',
    vein: '#c88a45',
    relief: 2.5,
    pale0: 0.52,
    paleMix: 0.52,
    accent: 0.18,
  },
  // A geode's crust: a touch cooler, its crystal faces catching the crest.
  {
    deep: '#351f3c',
    mid: '#8a5f92',
    pale: '#e7d2d5',
    vein: '#dcb45f',
    relief: 2.3,
    pale0: 0.52,
    paleMix: 0.58,
    accent: 0.2,
  },
  // Banded agate: the warmest of the four, seams of gold along the strata.
  {
    deep: '#3a2731',
    mid: '#82677a',
    pale: '#eed0d6',
    vein: '#d8a44b',
    relief: 1.9,
    pale0: 0.38,
    paleMix: 0.6,
    accent: 0.28,
  },
] as const;

export function createPlanetMaterial(theme: PlanetTheme) {
  const kind = [11, 23, 37, 47].indexOf(theme.seed);
  const mineral = MINERALS[kind] ?? MINERALS[0];
  return new ShaderMaterial({
    // Opaque, so the depth test resolves overlap. Fading a planet's own alpha
    // turned two overlapping planets into glass; the whole scene fades as one
    // layer through --scene-opacity instead.
    transparent: false,
    uniforms: {
      // A light tint of the project's own colour, not a takeover.
      uBase: {
        value: new Color(mineral.mid).lerp(new Color(theme.base), 0.22),
      },
      uDeep: {
        value: new Color(mineral.deep).lerp(new Color(theme.base), 0.18),
      },
      uPale: { value: new Color(mineral.pale) },
      // The project's signal colour tints the mineral's own vein rather than
      // replacing it, so a green-signalled planet reads as stone, not as neon.
      uVein: {
        value: new Color(mineral.vein).lerp(new Color(theme.signal), 0.3),
      },
      // Where the crest starts, how far it goes, and how much vein shows:
      // one shared ramp made pale minerals wash out and dark ones stay flat.
      uRamp: {
        value: [mineral.relief, mineral.pale0, mineral.paleMix, mineral.accent],
      },
      uMap: { value: neutralMap() },
      uKind: { value: kind },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vTangent;
      varying vec3 vView;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        // SphereGeometry's own parameterisation: the surface runs east along
        // increasing uv.x, the tangent the baked normals are relative to.
        float phi = uv.x * 6.2831853;
        vTangent = normalize(normalMatrix * vec3(sin(phi), 0.0, cos(phi)));
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uBase;
      uniform vec3 uDeep;
      uniform vec3 uPale;
      uniform vec3 uVein;
      uniform vec4 uRamp;
      uniform sampler2D uMap;
      uniform float uKind;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vTangent;
      varying vec3 vView;
      void main() {
        vec4 material = texture2D(uMap, vUv);
        vec3 normal = normalize(vNormal);
        vec3 tangent = normalize(vTangent - normal * dot(normal, vTangent));
        vec3 bitangent = cross(normal, tangent);
        // The map stores slopes; a surface tilts away from rising height.
        // Relief strength lives here rather than in the bake, so the stone can
        // be dialled against the lighting without regenerating every map.
        vec2 slope = (material.rg - 0.5) * 2.0 * uRamp.x;
        vec3 n = normalize(normal - tangent * slope.x - bitangent * slope.y);
        float tone = material.b;
        float accent = material.a;
        vec3 eye = normalize(vView);
        // A grazing key light, so every planet keeps the poster's dark half.
        vec3 key = normalize(vec3(0.72, 0.52, 0.06));
        float ndl = dot(n, key);
        // A narrow terminator: one bright crescent, one deep shadow.
        float diffuse = smoothstep(-0.04, 0.9, ndl);
        float marble = uKind < 0.5 ? 1.0 : 0.0;
        float basalt = uKind > 0.5 && uKind < 1.5 ? 1.0 : 0.0;
        float geode = uKind > 1.5 && uKind < 2.5 ? 1.0 : 0.0;
        float agate = uKind > 2.5 ? 1.0 : 0.0;
        // Stone, not plastic: a tight glint instead of a broad glossy blob.
        float shine = marble * 96.0 + basalt * 26.0 + geode * 150.0 + agate * 64.0;
        float gloss = marble * 0.22 + basalt * 0.05 + geode * 0.32 + agate * 0.12;
        float specular = pow(max(dot(n, normalize(key + eye)), 0.0), shine);
        float rim = pow(1.0 - max(dot(n, eye), 0.0), 2.7) *
          smoothstep(-0.15, 0.65, ndl);
        // Shadow to body to crest: the hue travels, it does not just brighten.
        vec3 albedo = mix(uDeep, uBase * uRamp.x, smoothstep(0.04, 0.52, tone));
        albedo = mix(
          albedo,
          uPale,
          smoothstep(uRamp.y, 1.0, tone) * uRamp.z
        );
        albedo = mix(albedo, uVein * 0.6, accent * uRamp.w);
        // Lit rock is never as saturated as a brand swatch, but the ramp is
        // doing the work now, so it needs far less flattening than before.
        albedo = mix(albedo, vec3(dot(albedo, vec3(0.3, 0.59, 0.11))), 0.12);
        vec3 ambient = vec3(0.05, 0.038, 0.085) * (0.55 + tone * 0.5);
        vec3 sun = vec3(1.0, 0.93, 0.83);
        vec3 color = albedo * (ambient + sun * diffuse * 1.06);
        color += sun * specular * gloss;
        // The sunlit crescent warms towards tan, the way lit rock does — as a
        // boost of the material itself, so dark minerals do not wash out white.
        color += albedo * vec3(1.2, 0.98, 0.78) * pow(diffuse, 3.0) * 0.42;
        // The lit edge carries the halo the poster has; the dark edge stays dark.
        color += vec3(0.5, 0.34, 0.6) * rim * 0.45;
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

/** Swaps the flat stand-in for the baked map once it has downloaded. */
export function applyPlanetMap(material: ShaderMaterial, map: Texture) {
  const previous = material.uniforms.uMap.value as Texture;
  material.uniforms.uMap.value = map;
  previous.dispose();
}
