import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Points,
  ShaderMaterial,
} from 'three';

/**
 * The sky behind the journey.
 *
 * A PointsMaterial draws square points at one size, which at this scale read as
 * dust rather than as stars. This is a single draw call still, but every star
 * carries its own size, brightness and depth, so the field has a near and a far
 * and drifts at different rates as the page scrolls.
 */
export function createStarField(count: number) {
  const positions: number[] = [];
  const scales: number[] = [];
  const alphas: number[] = [];
  const depths: number[] = [];
  for (let i = 0; i < count; i++) {
    // A fixed seed: the sky is the same on every visit, and costs no randomness
    // at runtime.
    const a = Math.sin(i * 127.1 + 53.7) * 43758.5453;
    const b = Math.sin(i * 311.7 + 17.3) * 24731.378;
    const c = Math.sin(i * 74.7 + 91.3) * 19349.113;
    const d = Math.sin(i * 45.3 + 12.9) * 31627.577;
    const fract = (value: number) => value - Math.floor(value);
    positions.push(fract(a) * 2 - 1, fract(b) * 2 - 1, fract(c));
    // Most stars are faint pinpricks; a few carry the eye.
    const rank = fract(d);
    scales.push(1.1 + rank * rank * rank * 4.4);
    alphas.push(0.22 + rank * 0.62);
    depths.push(0.25 + fract(c) * 0.75);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aScale', new Float32BufferAttribute(scales, 1));
  geometry.setAttribute('aAlpha', new Float32BufferAttribute(alphas, 1));
  geometry.setAttribute('aDepth', new Float32BufferAttribute(depths, 1));
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new Color('#e6dcff') },
      // gl_PointSize counts framebuffer pixels, so a star has to be scaled by
      // the ratio the scene is rendering at or it shrinks on dense screens.
      uPixelRatio: { value: 1 },
      uDrift: { value: [0, 0] },
    },
    vertexShader: `
      attribute float aScale;
      attribute float aAlpha;
      attribute float aDepth;
      uniform float uPixelRatio;
      uniform vec2 uDrift;
      varying float vAlpha;
      void main() {
        vAlpha = aAlpha;
        // Nearer stars travel further: parallax, under an orthographic camera.
        vec3 shifted = position + vec3(uDrift * aDepth, 0.0);
        vec4 mv = modelViewMatrix * vec4(shifted, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aScale * uPixelRatio;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        // A round star with a soft edge, rather than the default square.
        float distance = length(gl_PointCoord - 0.5);
        float alpha = smoothstep(0.5, 0.06, distance) * vAlpha;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(uColor, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  return new Points(geometry, material);
}
