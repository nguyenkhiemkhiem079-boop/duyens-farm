import * as THREE from 'three';
import { CropType, GrowthStage } from '../core/types';
import { PALETTE } from '../core/constants';

/**
 * Creates visual 3D representation for a crop plot and the plant growing on it.
 */
export function createPlotTileModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'plot_tile';

  // Soil bed (Dry soil default)
  const soilGeo = new THREE.BoxGeometry(1.4, 0.08, 1.4);
  const soilMat = new THREE.MeshLambertMaterial({
    color: PALETTE.soilDry,
    name: 'soilMat',
  });
  const soil = new THREE.Mesh(soilGeo, soilMat);
  soil.name = 'soilMesh';
  soil.position.y = 0.04;
  soil.receiveShadow = true;
  group.add(soil);

  // Raised furrow ridges
  const ridgeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.3, 6);
  ridgeGeo.rotateZ(Math.PI / 2);
  const r1 = new THREE.Mesh(ridgeGeo, soilMat);
  r1.position.set(0, 0.08, -0.4);
  const r2 = new THREE.Mesh(ridgeGeo, soilMat);
  r2.position.set(0, 0.08, 0);
  const r3 = new THREE.Mesh(ridgeGeo, soilMat);
  r3.position.set(0, 0.08, 0.4);
  group.add(r1, r2, r3);

  // Container group for plant meshes
  const plantGroup = new THREE.Group();
  plantGroup.name = 'plantGroup';
  plantGroup.position.y = 0.08;
  group.add(plantGroup);

  return group;
}

/**
 * Generates the plant mesh depending on crop type and growth stage.
 */
export function createCropMesh(type: CropType, stage: GrowthStage): THREE.Group {
  const group = new THREE.Group();
  group.name = `crop_${type}_stage_${stage}`;

  const greenMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });
  const darkGreenMat = new THREE.MeshLambertMaterial({ color: 0x16a34a });

  if (stage === 0) {
    // Stage 0: Tiny seedling sprout
    const sproutGeo = new THREE.ConeGeometry(0.04, 0.15, 5);
    const sprout1 = new THREE.Mesh(sproutGeo, greenMat);
    sprout1.position.set(0, 0.08, 0);
    const sprout2 = new THREE.Mesh(sproutGeo, greenMat);
    sprout2.position.set(0.08, 0.06, 0.04);
    sprout2.rotation.z = -0.3;
    group.add(sprout1, sprout2);
    return group;
  }

  if (stage === 1) {
    // Stage 1: Leafy young shoot
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.25, 5);
    const stem = new THREE.Mesh(stemGeo, greenMat);
    stem.position.y = 0.12;
    group.add(stem);

    const leafGeo = new THREE.SphereGeometry(0.08, 6, 6);
    leafGeo.scale(1, 0.3, 1.5);
    const l1 = new THREE.Mesh(leafGeo, darkGreenMat);
    l1.position.set(0.06, 0.22, 0);
    l1.rotation.z = -0.4;
    const l2 = new THREE.Mesh(leafGeo, darkGreenMat);
    l2.position.set(-0.06, 0.2, 0);
    l2.rotation.z = 0.4;
    group.add(l1, l2);
    return group;
  }

  if (stage === 2) {
    // Stage 2: Medium developing plant
    if (type === 'carrot') {
      const topGeo = new THREE.ConeGeometry(0.12, 0.35, 6);
      for (let i = 0; i < 4; i++) {
        const leaf = new THREE.Mesh(topGeo, darkGreenMat);
        const ang = (i * Math.PI) / 2;
        leaf.position.set(Math.cos(ang) * 0.08, 0.22, Math.sin(ang) * 0.08);
        leaf.rotation.x = Math.sin(ang) * 0.3;
        leaf.rotation.z = -Math.cos(ang) * 0.3;
        group.add(leaf);
      }
    } else if (type === 'wheat') {
      for (let i = -1; i <= 1; i++) {
        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.45, 5),
          greenMat
        );
        stalk.position.set(i * 0.12, 0.22, 0);
        stalk.rotation.z = i * 0.1;
        group.add(stalk);
      }
    } else if (type === 'tomato') {
      const bush = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.24, 0),
        darkGreenMat
      );
      bush.position.y = 0.25;
      group.add(bush);
      // Small green tomato bud
      const bud = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 6, 6),
        new THREE.MeshLambertMaterial({ color: 0x86efac })
      );
      bud.position.set(0.14, 0.25, 0.14);
      group.add(bud);
    }
    return group;
  }

  // Stage 3: Fully Mature & Harvestable!
  if (type === 'carrot') {
    // Lush leafy plumes + orange carrot crowns visible popping out of the dirt
    const carrotOrangeMat = new THREE.MeshLambertMaterial({ color: 0xf97316 });
    for (let c = -1; c <= 1; c += 2) {
      for (let r = -1; r <= 1; r += 2) {
        const cX = c * 0.18;
        const cZ = r * 0.18;

        // Carrot top poking up
        const crown = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.04, 0.15, 8),
          carrotOrangeMat
        );
        crown.position.set(cX, 0.07, cZ);
        crown.castShadow = true;

        // Big bushy green foliage
        const plume = new THREE.Mesh(
          new THREE.ConeGeometry(0.12, 0.45, 6),
          darkGreenMat
        );
        plume.position.set(cX, 0.32, cZ);
        plume.castShadow = true;

        group.add(crown, plume);
      }
    }
  } else if (type === 'wheat') {
    // Golden waving wheat sheaves
    const goldenMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
    for (let i = -2; i <= 2; i++) {
      const stalk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.03, 0.6, 5),
        goldenMat
      );
      stalk.position.set(i * 0.09, 0.3, (i % 2) * 0.05);
      stalk.rotation.z = i * 0.08;
      stalk.castShadow = true;

      // Heavy golden ear
      const ear = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.03, 0.25, 6),
        goldenMat
      );
      ear.position.set(i * 0.11, 0.6, (i % 2) * 0.05);
      ear.rotation.z = i * 0.15;
      group.add(stalk, ear);
    }
  } else if (type === 'tomato') {
    // Lush tomato vine with bright red ripe tomatoes
    const bush = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.35, 1),
      darkGreenMat
    );
    bush.position.y = 0.35;
    bush.castShadow = true;
    group.add(bush);

    const redTomatoMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const tomatoPositions = [
      { x: 0.22, y: 0.32, z: 0.2 },
      { x: -0.22, y: 0.28, z: 0.18 },
      { x: 0.05, y: 0.42, z: -0.24 },
      { x: -0.15, y: 0.48, z: 0.15 },
    ];

    tomatoPositions.forEach(pos => {
      const tom = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        redTomatoMat
      );
      tom.position.set(pos.x, pos.y, pos.z);
      tom.castShadow = true;

      // Little green calyx star
      const calyx = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.04, 5),
        darkGreenMat
      );
      calyx.position.set(pos.x, pos.y + 0.09, pos.z);
      group.add(tom, calyx);
    });
  }

  // Harvest Sparkle indicator ring/star
  const readyRingGeo = new THREE.RingGeometry(0.4, 0.48, 16);
  readyRingGeo.rotateX(-Math.PI / 2);
  const readyRingMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    side: THREE.DoubleSide,
  });
  const readyRing = new THREE.Mesh(readyRingGeo, readyRingMat);
  readyRing.name = 'readyRing';
  readyRing.position.y = 0.02;
  group.add(readyRing);

  return group;
}
