import { Color, ShaderMaterial } from 'three';

/**
 * The pool of deep space the opening cluster sits in. It is darker than the
 * page it dissolves into, which is what gives the planets their contrast —
 * the poster's own background, drawn where the poster used to be.
 */
export function createSpaceMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uCore: { value: new Color('#211838') },
      uEdge: { value: new Color('#080511') },
      uOpacity: { value: 1 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uCore;
      uniform vec3 uEdge;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float r = length((vUv - 0.5) * 2.0);
        vec3 color = mix(uCore, uEdge, smoothstep(0.0, 1.05, r));
        float alpha = (1.0 - smoothstep(0.32, 1.0, r)) * uOpacity;
        gl_FragColor = vec4(color, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
