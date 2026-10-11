import * as THREE from 'three';
import { PALETTE } from '../core/constants';

/**
 * Creates the cozy farmhouse for Khim & Duyên.
 */
export function createHouseModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'building_house';

  const wallMat = new THREE.MeshLambertMaterial({ color: PALETTE.stoneWhite });
  const roofMat = new THREE.MeshLambertMaterial({ color: PALETTE.roofPeach });
  const woodMat = new THREE.MeshLambertMaterial({ color: PALETTE.woodDark });
  const windowMat = new THREE.MeshBasicMaterial({ color: 0xfff3b0 });
  const chimneyMat = new THREE.MeshLambertMaterial({ color: 0xd97736 });

  // Main house base (Width: 3.2, Height: 2.2, Depth: 3.2)
  const baseGeo = new THREE.BoxGeometry(3.2, 2.2, 3.2);
  const base = new THREE.Mesh(baseGeo, wallMat);
  base.position.y = 1.1;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Roof (Pyramid/Prism)
  const roofGeo = new THREE.ConeGeometry(2.8, 1.4, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 2.9;
  roof.castShadow = true;
  group.add(roof);

  // Wooden Door (Facing south: +Z)
  const doorGeo = new THREE.BoxGeometry(0.7, 1.3, 0.08);
  const door = new THREE.Mesh(doorGeo, woodMat);
  door.position.set(0, 0.65, 1.62);
  group.add(door);

  // Door knob
  const knobGeo = new THREE.SphereGeometry(0.04, 6, 6);
  const knobMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const knob = new THREE.Mesh(knobGeo, knobMat);
  knob.position.set(0.24, 0.65, 1.68);
  group.add(knob);

  // Cute Porch Overhang
  const porchGeo = new THREE.BoxGeometry(1.2, 0.08, 0.6);
  const porch = new THREE.Mesh(porchGeo, woodMat);
  porch.position.set(0, 1.5, 1.9);
  group.add(porch);

  // Windows with warm cozy light
  const windowGeo = new THREE.BoxGeometry(0.55, 0.55, 0.05);
  const leftWin = new THREE.Mesh(windowGeo, windowMat);
  leftWin.position.set(-0.95, 1.2, 1.62);
  const rightWin = new THREE.Mesh(windowGeo, windowMat);
  rightWin.position.set(0.95, 1.2, 1.62);
  group.add(leftWin, rightWin);

  // Window Frames
  const frameMat = new THREE.MeshLambertMaterial({ color: PALETTE.woodDark });
  const frameGeo = new THREE.BoxGeometry(0.62, 0.05, 0.06);
  const f1 = new THREE.Mesh(frameGeo, frameMat);
  f1.position.set(-0.95, 1.2, 1.63);
  const f2 = new THREE.Mesh(frameGeo, frameMat);
  f2.position.set(0.95, 1.2, 1.63);
  group.add(f1, f2);

  // Chimney
  const chimneyGeo = new THREE.BoxGeometry(0.4, 1.0, 0.4);
  const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
  chimney.position.set(0.8, 2.8, -0.6);
  chimney.castShadow = true;
  group.add(chimney);

  // Cute welcome mat
  const matGeo = new THREE.BoxGeometry(0.9, 0.02, 0.5);
  const mat = new THREE.Mesh(matGeo, new THREE.MeshLambertMaterial({ color: 0xa78bfa }));
  mat.position.set(0, 0.01, 1.9);
  group.add(mat);

  return group;
}

/**
 * Creates the small barn model (Kho thóc nhỏ).
 */
export function createBarnModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'building_barn';

  const wallMat = new THREE.MeshLambertMaterial({ color: PALETTE.roofBarn });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0xffedd5 });
  const woodMat = new THREE.MeshLambertMaterial({ color: PALETTE.woodLight });

  // Main barn body
  const bodyGeo = new THREE.BoxGeometry(2.8, 2.0, 2.8);
  const body = new THREE.Mesh(bodyGeo, wallMat);
  body.position.y = 1.0;
  body.castShadow = true;
  group.add(body);

  // Barn Roof (Curved Cylinder)
  const roofGeo = new THREE.CylinderGeometry(1.6, 1.6, 3.0, 10, 1, false, 0, Math.PI);
  roofGeo.rotateZ(Math.PI / 2);
  roofGeo.rotateY(Math.PI / 2);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 2.0;
  roof.castShadow = true;
  group.add(roof);

  // Double wooden barn door
  const doorGeo = new THREE.BoxGeometry(1.2, 1.4, 0.08);
  const door = new THREE.Mesh(doorGeo, woodMat);
  door.position.set(0, 0.7, 1.42);
  group.add(door);

  // Hay bale outside barn
  const hayGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 8);
  hayGeo.rotateZ(Math.PI / 2);
  const hayMat = new THREE.MeshLambertMaterial({ color: 0xfde047 });
  const hay1 = new THREE.Mesh(hayGeo, hayMat);
  hay1.position.set(1.4, 0.3, 1.2);
  hay1.castShadow = true;
  const hay2 = new THREE.Mesh(hayGeo, hayMat);
  hay2.position.set(1.4, 0.3, 0.5);
  hay2.castShadow = true;
  group.add(hay1, hay2);

  return group;
}

/**
 * Creates the Market Stand (Quầy nông sản).
 */
export function createMarketModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'building_market';

  const woodMat = new THREE.MeshLambertMaterial({ color: PALETTE.woodDark });
  const canopyMat1 = new THREE.MeshLambertMaterial({ color: PALETTE.roofButter });
  const canopyMat2 = new THREE.MeshLambertMaterial({ color: 0xf87171 }); // Coral red stripe

  // Counter table
  const counterGeo = new THREE.BoxGeometry(2.4, 0.9, 1.4);
  const counter = new THREE.Mesh(counterGeo, woodMat);
  counter.position.y = 0.45;
  counter.castShadow = true;
  group.add(counter);

  // Canopy poles
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6);
  const pole1 = new THREE.Mesh(poleGeo, woodMat);
  pole1.position.set(-1.1, 0.9, -0.6);
  const pole2 = new THREE.Mesh(poleGeo, woodMat);
  pole2.position.set(1.1, 0.9, -0.6);
  const pole3 = new THREE.Mesh(poleGeo, woodMat);
  pole3.position.set(-1.1, 0.9, 0.6);
  const pole4 = new THREE.Mesh(poleGeo, woodMat);
  pole4.position.set(1.1, 0.9, 0.6);
  group.add(pole1, pole2, pole3, pole4);

  // Striped Canopy Awning
  const canopyGeo = new THREE.BoxGeometry(2.6, 0.1, 1.8);
  const canopy = new THREE.Mesh(canopyGeo, canopyMat1);
  canopy.position.set(0, 1.8, 0);
  canopy.rotation.x = 0.12;
  group.add(canopy);

  // Produce Display crates on counter
  const crateGeo = new THREE.BoxGeometry(0.5, 0.2, 0.4);
  const crate1 = new THREE.Mesh(crateGeo, woodMat);
  crate1.position.set(-0.6, 1.0, 0.2);
  const crate2 = new THREE.Mesh(crateGeo, woodMat);
  crate2.position.set(0.6, 1.0, 0.2);

  // Little veggies in crates
  const carrotVeggies = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.22, 6),
    new THREE.MeshLambertMaterial({ color: 0xf97316 })
  );
  carrotVeggies.rotation.z = Math.PI / 2;
  carrotVeggies.position.set(-0.6, 1.15, 0.2);

  const tomatoVeggies = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 6, 6),
    new THREE.MeshLambertMaterial({ color: 0xef4444 })
  );
  tomatoVeggies.position.set(0.6, 1.15, 0.2);

  group.add(crate1, crate2, carrotVeggies, tomatoVeggies);

  // Signboard: "CHỢ NÔNG SẢN"
  const signGeo = new THREE.BoxGeometry(1.2, 0.3, 0.05);
  const sign = new THREE.Mesh(
    signGeo,
    new THREE.MeshLambertMaterial({ color: 0xfef08a })
  );
  sign.position.set(0, 1.45, 0.7);
  group.add(sign);

  return group;
}

/**
 * Creates low-poly decorative tree.
 */
export function createTreeModel(variant: number = 0): THREE.Group {
  const group = new THREE.Group();
  group.name = 'tree';

  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x785135 });
  const leavesColors = [0x86efac, 0x6ee7b7, 0xa7f3d0];
  const leavesMat = new THREE.MeshLambertMaterial({
    color: leavesColors[variant % leavesColors.length],
  });

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.22, 1.2, 7);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.6;
  trunk.castShadow = true;
  group.add(trunk);

  // Foliage (stacked spheres / cones)
  const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 1), leavesMat);
  f1.position.y = 1.6;
  f1.castShadow = true;
  const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 1), leavesMat);
  f2.position.set(0.2, 2.1, -0.1);
  f2.castShadow = true;

  group.add(f1, f2);
  return group;
}

/**
 * Creates decorative perimeter fence unit.
 */
export function createFenceUnit(): THREE.Group {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshLambertMaterial({ color: PALETTE.woodLight });

  // Post
  const postGeo = new THREE.BoxGeometry(0.1, 0.65, 0.1);
  const post1 = new THREE.Mesh(postGeo, woodMat);
  post1.position.set(0, 0.32, 0);
  post1.castShadow = true;

  // Rail
  const railGeo = new THREE.BoxGeometry(1.6, 0.07, 0.05);
  const rail1 = new THREE.Mesh(railGeo, woodMat);
  rail1.position.set(0.8, 0.45, 0);
  const rail2 = new THREE.Mesh(railGeo, woodMat);
  rail2.position.set(0.8, 0.22, 0);

  group.add(post1, rail1, rail2);
  return group;
}

/**
 * Creates the Windmill model (Cối Xay Gió) with rotating sails.
 */
export function createWindmillModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'building_windmill';

  const stoneMat = new THREE.MeshLambertMaterial({ color: 0xfdf6e2 });
  const woodMat = new THREE.MeshLambertMaterial({ color: PALETTE.woodDark });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 }); // sky blue cone roof
  const sailMat = new THREE.MeshLambertMaterial({ color: 0xfef9c3 }); // cloth sail

  // Octagonal tapered tower
  const towerGeo = new THREE.CylinderGeometry(0.9, 1.3, 3.2, 8);
  const tower = new THREE.Mesh(towerGeo, stoneMat);
  tower.position.y = 1.6;
  tower.castShadow = true;
  group.add(tower);

  // Roof cap
  const roofGeo = new THREE.ConeGeometry(1.2, 1.2, 8);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 3.8;
  roof.castShadow = true;
  group.add(roof);

  // Door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.9, 0.1),
    woodMat
  );
  door.position.set(0, 0.45, 1.25);
  group.add(door);

  // Rotating Sails Group
  const sailsGroup = new THREE.Group();
  sailsGroup.name = 'windmillSails';
  sailsGroup.position.set(0, 3.0, 1.05);

  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.2, 8),
    woodMat
  );
  hub.rotation.x = Math.PI / 2;
  sailsGroup.add(hub);

  // 4 Blades
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const spar = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 2.2, 0.04),
      woodMat
    );
    spar.position.set(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0);
    spar.rotation.z = angle + Math.PI / 2;

    const sail = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 1.6, 0.02),
      sailMat
    );
    sail.position.set(Math.cos(angle) * 1.0 + Math.sin(angle) * 0.15, Math.sin(angle) * 1.0 - Math.cos(angle) * 0.15, 0);
    sail.rotation.z = angle + Math.PI / 2;

    sailsGroup.add(spar, sail);
  }

  group.add(sailsGroup);
  return group;
}

/**
 * Creates the Bakery Oven model (Lò Nướng Bánh).
 */
export function createBakeryModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'building_bakery';

  const stoneMat = new THREE.MeshLambertMaterial({ color: 0xd6d3d1 });
  const brickMat = new THREE.MeshLambertMaterial({ color: 0xf97316 });
  const woodMat = new THREE.MeshLambertMaterial({ color: PALETTE.woodDark });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });

  // Main hearth base
  const hearth = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.2, 2.0),
    stoneMat
  );
  hearth.position.y = 0.6;
  hearth.castShadow = true;
  group.add(hearth);

  // Dome oven on top
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
    brickMat
  );
  dome.position.set(-0.3, 1.2, 0);
  group.add(dome);

  // Glowing oven mouth
  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.4, 0.1),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  mouth.position.set(-0.3, 1.35, 0.85);
  group.add(mouth);

  // Chimney
  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 1.6, 0.4),
    brickMat
  );
  chimney.position.set(-0.3, 2.2, -0.4);
  chimney.castShadow = true;
  group.add(chimney);

  // Baker Preparation Table & Loaves
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.8, 1.4),
    woodMat
  );
  table.position.set(0.7, 0.7, 0.1);
  group.add(table);

  // Bread loaves on table
  const loafMat = new THREE.MeshLambertMaterial({ color: 0xfde047 });
  const loaf1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.35, 6), loafMat);
  loaf1.rotation.z = Math.PI / 2;
  loaf1.position.set(0.7, 1.15, 0.3);
  const loaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), loafMat);
  loaf2.position.set(0.7, 1.15, -0.2);
  group.add(loaf1, loaf2);

  return group;
}

/**
 * Creates the Juice Press model (Máy Ép Nước Quả).
 */
export function createJuicePressModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'building_juice_press';

  const woodMat = new THREE.MeshLambertMaterial({ color: PALETTE.woodDark });
  const metalMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
  const juiceMat = new THREE.MeshLambertMaterial({ color: 0xf97316 });

  // Wooden Table Frame
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.8, 1.2),
    woodMat
  );
  table.position.y = 0.4;
  table.castShadow = true;
  group.add(table);

  // Press Barrel Vat
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.7, 8),
    metalMat
  );
  barrel.position.set(-0.4, 1.05, 0);
  group.add(barrel);

  // Press Screw & Crank Handle
  const screw = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6),
    metalMat
  );
  screw.position.set(-0.4, 1.6, 0);
  const crank = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.06, 0.06),
    metalMat
  );
  crank.position.set(-0.4, 2.05, 0);
  group.add(screw, crank);

  // Juice Collector Tray & Glass Jug
  const jug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.16, 0.35, 6),
    juiceMat
  );
  jug.position.set(0.5, 0.95, 0.1);
  group.add(jug);

  return group;
}

/**
 * Creates the Rose Gazebo model (Chòi Nghỉ Mát Hoa Hồng).
 */
export function createGazeboModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'building_gazebo';

  const whiteWood = new THREE.MeshLambertMaterial({ color: 0xfef9c3 });
  const roseMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });
  const vineMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });

  // 4 Pillars
  const offsets = [
    { x: -0.9, z: -0.9 },
    { x: 0.9, z: -0.9 },
    { x: -0.9, z: 0.9 },
    { x: 0.9, z: 0.9 },
  ];

  offsets.forEach(pos => {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6),
      whiteWood
    );
    pillar.position.set(pos.x, 1.1, pos.z);
    pillar.castShadow = true;
    group.add(pillar);
  });

  // Lattice Roof Pergola
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.1, 2.3),
    whiteWood
  );
  roof.position.y = 2.25;
  group.add(roof);

  // Climbing Rose foliage clusters
  offsets.forEach(pos => {
    const roseBush = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 6, 6),
      vineMat
    );
    roseBush.position.set(pos.x, 1.8, pos.z);
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 5, 5),
      roseMat
    );
    flower.position.set(pos.x + 0.1, 1.9, pos.z + 0.1);
    group.add(roseBush, flower);
  });

  // Cozy bench inside
  const bench = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.4, 0.4),
    whiteWood
  );
  bench.position.set(0, 0.2, 0);
  group.add(bench);

  return group;
}

/**
 * Creates the Garden Lantern model (Đèn Lồng Gỗ).
 */
export function createLanternModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'building_lantern';

  const woodMat = new THREE.MeshLambertMaterial({ color: PALETTE.woodDark });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  // Post
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 1.8, 6),
    woodMat
  );
  post.position.y = 0.9;
  post.castShadow = true;
  group.add(post);

  // Lantern Head
  const lantern = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.45, 0.35),
    glowMat
  );
  lantern.position.set(0, 1.7, 0);
  group.add(lantern);

  // Cap
  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.2, 4),
    woodMat
  );
  cap.position.set(0, 2.0, 0);
  group.add(cap);

  return group;
}

/**
 * Creates Construction Scaffolding for buildings currently being built.
 */
export function createScaffoldingModel(widthCells: number, depthCells: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'building_scaffolding';

  const woodMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
  const tapeMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });

  const w = widthCells * 1.5;
  const d = depthCells * 1.5;

  // 4 Corner Posts
  const postPositions = [
    { x: -w / 2, z: -d / 2 },
    { x: w / 2, z: -d / 2 },
    { x: -w / 2, z: d / 2 },
    { x: w / 2, z: d / 2 },
  ];

  postPositions.forEach(p => {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6),
      woodMat
    );
    post.position.set(p.x, 0.9, p.z);
    group.add(post);
  });

  // Crossbeams
  const beam1 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.08), woodMat);
  beam1.position.set(0, 1.6, -d / 2);
  const beam2 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.08), woodMat);
  beam2.position.set(0, 1.6, d / 2);
  group.add(beam1, beam2);

  // Caution banner
  const banner = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.9, 0.2, 0.02),
    tapeMat
  );
  banner.position.set(0, 1.0, d / 2 + 0.02);
  group.add(banner);

  return group;
}

/**
 * Creates Duyên's Salon Building model (Tiệm Tóc Của Duyên).
 */
export function createSalonBuildingModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'building_salon_building';

  const wallMat = new THREE.MeshLambertMaterial({ color: 0xfff0f5 }); // lavender blush pastel
  const trimMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 }); // warm rose
  const roofMat = new THREE.MeshLambertMaterial({ color: 0xa7f3d0 }); // mint pastel
  const glassMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });

  // Main shop structure (Width 2.8, Height 2.2, Depth 2.6)
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 2.6), wallMat);
  base.position.y = 1.1;
  base.castShadow = true;
  group.add(base);

  // Mansard / Gambrel cute roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.6, 2.8), roofMat);
  roof.position.y = 2.4;
  roof.castShadow = true;
  group.add(roof);

  // Glass showcase window
  const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 0.05), glassMat);
  windowGlass.position.set(0.5, 1.1, 1.32);
  group.add(windowGlass);

  // Door
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.5, 0.08), trimMat);
  door.position.set(-0.8, 0.75, 1.32);
  group.add(door);

  // Barber pole with candy stripe
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8), new THREE.MeshLambertMaterial({ color: 0xf43f5e }));
  pole.position.set(-1.3, 1.3, 1.35);
  const poleGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.7, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  poleGlass.position.set(-1.3, 1.3, 1.35);
  group.add(pole, poleGlass);

  // Signboard: "SALON DUYÊN"
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.06), trimMat);
  sign.position.set(0, 2.05, 1.35);
  group.add(sign);

  return group;
}

/**
 * Creates Book Café model (Quán Cà Phê Sách).
 */
export function createBookCafeModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'building_book_cafe';

  const brickMat = new THREE.MeshLambertMaterial({ color: 0xd97736 }); // warm terracotta brick
  const woodMat = new THREE.MeshLambertMaterial({ color: PALETTE.woodDark });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x475569 }); // slate dark roof
  const awningMat = new THREE.MeshLambertMaterial({ color: 0xfef08a }); // cream gold awning

  // Main café structure
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 2.6), brickMat);
  base.position.y = 1.1;
  base.castShadow = true;
  group.add(base);

  // Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.2, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 2.8;
  roof.castShadow = true;
  group.add(roof);

  // Striped Awning over window
  const awning = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.7), awningMat);
  awning.rotation.x = 0.2;
  awning.position.set(0, 1.7, 1.5);
  group.add(awning);

  // Bay window with books inside
  const bay = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.05), new THREE.MeshBasicMaterial({ color: 0xffedd5 }));
  bay.position.set(0, 1.1, 1.32);
  group.add(bay);

  // Outdoor café table with 2 cups (fictional game-world decoration)
  const table = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 10), woodMat);
  table.position.set(1.1, 0.55, 1.8);
  const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 6), woodMat);
  tableLeg.position.set(1.1, 0.28, 1.8);

  // Coffee cups
  const cup1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.08, 6), new THREE.MeshLambertMaterial({ color: 0xffffff }));
  cup1.position.set(1.0, 0.61, 1.8);
  const cup2 = cup1.clone();
  cup2.position.set(1.2, 0.61, 1.8);

  group.add(table, tableLeg, cup1, cup2);

  return group;
}
