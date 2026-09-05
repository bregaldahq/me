'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  BufferGeometry,
  Group,
  Mesh,
  PlaneGeometry,
  Points,
  RepeatWrapping,
  SphereGeometry,
  NoColorSpace,
  TextureLoader,
  type Material,
  type ShaderMaterial,
  type Texture,
} from 'three';
import { PROJECTS } from '../project-data';
import type { OrbitSceneProps } from './scene-types';
import { applyPlanetMap, createPlanetMaterial } from './planet-material';
import { planetPlacements } from './journey-choreography';
import { createSpaceMaterial } from './space-material';
import { createStarField } from './star-field';
import { journeyState } from './journey-state';

/**
 * Baked stone, fetched only once the scene is actually animating. The static
 * poster never pays for it.
 */
function loadPlanetMaps(
  planets: readonly Mesh[],
  anisotropy: number,
  loaded: Texture[],
  small: boolean,
) {
  const loader = new TextureLoader();
  PROJECTS.forEach((project, index) => {
    const file = `${project.id}${small ? '-sm' : ''}.webp`;
    loader.load(`/media/planets/${file}`, (texture) => {
      texture.colorSpace = NoColorSpace;
      texture.wrapS = RepeatWrapping;
      texture.anisotropy = anisotropy;
      loaded.push(texture);
      const material = planets[index]?.material;
      if (material && !Array.isArray(material))
        applyPlanetMap(material as ShaderMaterial, texture);
    });
  });
}

/** Size ratios live with the themes; the choreography only needs the numbers. */
const PLANET_RADII = PROJECTS.map((project) => project.planet.radius);

function makeJourneyWorld(low: boolean) {
  const world = new Group();
  const space = new Mesh(new PlaneGeometry(1, 1), createSpaceMaterial());
  space.position.z = -600;
  space.renderOrder = -1;
  world.add(space);
  // Low-poly spheres show their silhouette once the planets fill a phone's hero.
  const segments = low ? 40 : 64;
  const planets = PROJECTS.map((project, index) => {
    const material = createPlanetMaterial(project.planet);
    const mesh = new Mesh(
      new SphereGeometry(1, segments, segments / 2),
      material,
    );
    // Each planet owns a depth. Sharing one plane made the spheres intersect
    // during the departure, which reads as a seam cut across the stone.
    mesh.position.z = -260 - (PROJECTS.length - 1 - index) * 45;
    world.add(mesh);
    return mesh;
  });
  const stars = createStarField(low ? 340 : 900);
  world.add(stars);
  return { world, planets, stars, space };
}

export function JourneyWorld({
  layoutRef,
  tier,
}: Pick<OrbitSceneProps, 'layoutRef' | 'tier'>) {
  const { gl } = useThree();
  const assets = useMemo(() => makeJourneyWorld(tier === 'low'), [tier]);
  const assetsRef = useRef<ReturnType<typeof makeJourneyWorld> | null>(null);
  const spin = useRef(0);
  useEffect(() => {
    assetsRef.current = assets;
    const maps: Texture[] = [];
    // A sphere's texture is steeply foreshortened towards the limb, which is
    // where anisotropic filtering earns its keep.
    loadPlanetMaps(
      assets.planets,
      Math.min(4, gl.capabilities.getMaxAnisotropy()),
      maps,
      tier === 'low',
    );
    return () => {
      maps.forEach((map) => map.dispose());
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
  }, [assets, gl, tier]);
  useFrame(({ size }, delta) => {
    const assets = assetsRef.current;
    if (!assets) return;
    const layout = layoutRef.current;
    assets.world.visible = layout.span > 0;
    if (!layout.span) return;
    const p = layout.journeyProgress;
    const state = journeyState(p);
    const heroX = layout.x - size.width / 2;
    const heroY =
      size.height / 2 - (layout.y - layout.scroll - layout.navHeight);
    // The pool belongs to the opening cluster, so it leaves with it and the
    // chapters keep the page's own background.
    assets.space.position.set(heroX, heroY, -600);
    assets.space.scale.set(layout.span * 3.5, layout.span * 3.1, 1);
    assets.space.material.uniforms.uOpacity.value = 1 - state.departure;
    assets.space.visible = state.departure < 0.999;
    const placements = planetPlacements(
      {
        width: size.width,
        height: size.height,
        span: layout.span,
        heroX,
        heroY,
        progress: p,
      },
      PLANET_RADII,
    );
    assets.planets.forEach((planet, i) => {
      const placement = placements[i];
      planet.position.x = placement.x;
      planet.position.y = placement.y;
      planet.scale.setScalar(placement.radius);
      // Rotation accumulates instead of being a function of scroll alone, so a
      // planet keeps turning while the reader is still.
      planet.rotation.y += delta * 0.05 + (p - spin.current) * 0.3;
      planet.rotation.x = i * 0.36;
      planet.rotation.z = i * 0.42;
    });
    spin.current = p;
    assets.stars.scale.set(size.width, size.height, 100);
    assets.stars.position.z = -400;
    assets.stars.rotation.z = p * -0.035;
    const starUniforms = assets.stars.material.uniforms;
    starUniforms.uPixelRatio.value = gl.getPixelRatio();
    // In the star field's own unit space, so a near star drifts further.
    starUniforms.uDrift.value[0] = Math.sin(p * 0.3) * 0.14;
    starUniforms.uDrift.value[1] = p * 0.05;
  });
  return <primitive object={assets.world} />;
}
