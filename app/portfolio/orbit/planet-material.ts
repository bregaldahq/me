import { Color, ShaderMaterial } from 'three';
import type { PlanetTheme } from '../project-data';

/** Lit, procedurally textured stone: no downloads, random flashes, or postprocessing. */
export function createPlanetMaterial(theme: PlanetTheme) {
  return new ShaderMaterial({
    transparent: true,
    uniforms: {
      uBase: { value: new Color(theme.base) },
      uSignal: { value: new Color(theme.signal) },
      uSeed: { value: theme.seed },
      uKind: { value: [11, 23, 37, 47].indexOf(theme.seed) },
      uMorph: { value: 0 },
      uOpacity: { value: 1 },
      uIllumination: { value: 1 },
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uBase;
      uniform vec3 uSignal;
      uniform float uSeed;
      uniform float uKind;
      uniform float uMorph;
      uniform float uOpacity;
      uniform float uIllumination;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vView;
      float hash(vec3 p) {
        p = fract(p * 0.3183099 + vec3(0.13, 0.71, 0.37));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }
      float noise(vec3 p) {
        vec3 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                       mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                       mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += noise(p) * amplitude;
          p = p * 2.03 + 2.71;
          amplitude *= 0.5;
        }
        return value;
      }
      void main() {
        vec3 p = vPosition * (3.2 + uMorph * 1.4) + uSeed;
        float stone = fbm(p);
        float fineStone = fbm(p * 3.0);
        float grain = noise(p * 38.0);
        float frequency = uKind < 0.5 ? 24.0 : uKind < 1.5 ? 8.0 : uKind < 2.5 ? 42.0 : 18.0;
        float strata = sin(vPosition.y * frequency + stone * 12.0 + uSeed);
        float seam = pow(1.0 - abs(sin(stone * 14.0 + vPosition.y * 3.0)), 32.0);
        float relief = fineStone + strata * (uKind > 1.5 && uKind < 2.5 ? 0.14 : 0.03);
        vec3 n = normalize(vNormal + vec3(-dFdx(relief), -dFdy(relief), 0.0) * 0.25);
        vec3 eye = normalize(vView);
        vec3 key = normalize(mix(vec3(-0.85, 0.55, 0.3), vec3(-0.65, 0.8, 1.0), uIllumination));
        float diffuse = max(dot(n, key), 0.0);
        float rim = pow(1.0 - max(dot(n, eye), 0.0), 3.0);
        float specular = pow(max(dot(n, normalize(key + eye)), 0.0), 42.0);
        vec3 mineral = mix(uBase * 0.65, vec3(0.15, 0.08, 0.28), stone);
        mineral *= 0.6 + fineStone * 0.85 + strata * 0.09 + grain * 0.08;
        mineral = mix(mineral, uSignal * 0.52, seam * (0.32 + uMorph * 0.35));
        vec3 color = mineral * (0.08 + diffuse * 1.8 * uIllumination);
        color += vec3(0.85, 0.78, 0.67) * specular * 0.2 * uIllumination;
        color += vec3(0.34, 0.21, 0.53) * rim * mix(0.25, 0.45, uIllumination);
        gl_FragColor = vec4(color, uOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
