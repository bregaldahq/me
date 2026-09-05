'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  MathUtils,
  Mesh,
  Points,
  PointsMaterial,
  SphereGeometry,
  type Material,
} from 'three';
import { PROJECTS } from '../project-data';
import type { OrbitSceneProps } from './scene-types';
import { createPlanetMaterial } from './planet-material';
import { easeRange, journeyState } from './journey-state';

function makeJourneyWorld(low: boolean) {
  const world = new Group();
  const segments = low ? 24 : 48;
  const planets = PROJECTS.map((project) => {
    const material = createPlanetMaterial(project.planet);
    const mesh = new Mesh(
      new SphereGeometry(1, segments, segments / 2),
      material,
    );
    mesh.position.z = -250;
    world.add(mesh);
    return mesh;
  });
  // Fixed seed, one draw call. Parallax is driven by scroll, not an autonomous flight loop.
  const starPositions: number[] = [];
  for (let i = 0; i < (low ? 100 : 230); i++) {
    const n = Math.sin(i * 127.1 + 53.7) * 43758.5453;
    const m = Math.sin(i * 311.7 + 17.3) * 24731.378;
    starPositions.push(
      (n - Math.floor(n)) * 2 - 1,
      (m - Math.floor(m)) * 2 - 1,
      (i % 11) / 11,
    );
  }
  const starGeo = new BufferGeometry();
  starGeo.setAttribute(
    'position',
    new Float32BufferAttribute(starPositions, 3),
  );
  const stars = new Points(
    starGeo,
    new PointsMaterial({
      color: '#d2c5f4',
      size: low ? 1.2 : 1.5,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      sizeAttenuation: false,
    }),
  );
  world.add(stars);
  return { world, planets, stars };
}

export function JourneyWorld({
  layoutRef,
  tier,
}: Pick<OrbitSceneProps, 'layoutRef' | 'tier'>) {
  const assets = useMemo(() => makeJourneyWorld(tier === 'low'), [tier]);
  const assetsRef = useRef<ReturnType<typeof makeJourneyWorld> | null>(null);
  useEffect(() => {
    assetsRef.current = assets;
    return () => {
      const geometries = new Set<BufferGeometry>();
      const materials = new Set<Material>();
      assets.world.traverse((object) => {
        if (object instanceof Mesh || object instanceof Points) {
          geometries.add(object.geometry);
          for (const material of Array.isArray(object.material)
            ? object.material
            : [object.material])
            materials.add(material);
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    };
  }, [assets]);
  useFrame(({ size }) => {
    const assets = assetsRef.current;
    if (!assets) return;
    const layout = layoutRef.current;
    assets.world.visible = layout.span > 0;
    if (!layout.span) return;
    const p = layout.journeyProgress;
    const state = journeyState(p);
    const compact = size.width < 1024;
    const departure = state.departure;
    assets.planets.forEach((planet, i) => {
      const angle = Math.PI / 2 - (i * Math.PI) / 2;
      const heroX =
        layout.x - size.width / 2 + Math.cos(angle) * layout.span * 0.36;
      const heroY =
        size.height / 2 -
        (layout.y - layout.scroll - layout.navHeight) +
        Math.sin(angle) * layout.span * 0.285;
      const backgroundX =
        size.width * (0.4 + i * 0.19) +
        Math.sin(p * 0.4 + i) * size.width * 0.1;
      const backgroundY =
        size.height * (0.05 - i * 0.24) +
        Math.cos(p * 0.5 + i) * size.height * 0.16;
      planet.position.x = MathUtils.lerp(heroX, backgroundX, departure);
      planet.position.y = MathUtils.lerp(heroY, backgroundY, departure);
      const radius = MathUtils.lerp(
        layout.span * 0.12 * PROJECTS[i].planet.radius,
        size.width * (i === 0 ? 0.39 : 0.17) * (1 - state.arrival * 0.7),
        departure,
      );
      planet.scale.setScalar(radius);
      planet.rotation.set(i * 0.36, p * 0.32 + i, i * 0.42);
      const uniforms = planet.material.uniforms;
      uniforms.uOpacity.value = MathUtils.lerp(
        1,
        (compact ? 0.23 : 0.46) * (i === 0 ? 1 : 0.36),
        departure,
      );
      uniforms.uIllumination.value = 1;
      uniforms.uMorph.value = easeRange(p, 2, 4) * 0.2;
    });
    assets.stars.scale.set(size.width, size.height, 100);
    assets.stars.position.set(
      Math.sin(p * 0.3) * size.width * 0.1,
      p * size.height * 0.035,
      -400,
    );
    assets.stars.rotation.z = p * -0.035;
  });
  return <primitive object={assets.world} />;
}
