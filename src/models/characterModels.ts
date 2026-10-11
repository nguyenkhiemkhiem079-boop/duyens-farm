import * as THREE from 'three';
import { MON_FUR_COLOR, PALETTE } from '../core/constants';

/* ------------------------------------------------------------------ *
 * APPEARANCE REFERENCE (from the author's real photos, stylized):
 *  - Duyên: long dark-brown hair with wispy curtain bangs and a center part
 *    (also a shoulder-length, black, outward-curled style); butter-yellow
 *    puff-sleeve dress with a rounded collar; cream ruffled camisole;
 *    pink bangle; white compact camera.
 *  - Khim: short dark hair with a slightly messy, spiky fringe; round face;
 *    glasses; big smile; gray ribbed mock-neck sweater; light-gray pants;
 *    black crossbody bag.
 * Everything is procedural low-poly. Named parts used by FarmScene:
 *  leftLeg, rightLeg, heldTool (Duyên), khimHeart (Khim).
 * Extra named parts for future animation: leftArm, rightArm, eyeL, eyeR,
 *  hair, strawHat, cameraProp (Duyên), tablet (Khim).
 * Triangle budget: ~1500 per human character.
 * ------------------------------------------------------------------ */

export type DuyenHairStyle = 'long' | 'shoulder';
export type DuyenOutfit = 'yellow' | 'cream';
export interface DuyenLook {
  hairStyle: DuyenHairStyle;
  outfit: DuyenOutfit;
  hat: boolean;
}
export const DEFAULT_DUYEN_LOOK: DuyenLook = { hairStyle: 'long', outfit: 'yellow', hat: false };

const lambert = (color: number, doubleSided = false) =>
  new THREE.MeshLambertMaterial({ color, side: doubleSided ? THREE.DoubleSide : THREE.FrontSide });
const basic = (color: number) => new THREE.MeshBasicMaterial({ color });

function mk(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x = 0, y = 0, z = 0,
  cast = true
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = cast;
  parent.add(m);
  return m;
}

function surfaceZ(radius: number, x: number, dy: number): number {
  return Math.sqrt(Math.max(radius * radius - x * x - dy * dy, 0.0001));
}

interface FaceOpts {
  headY: number;
  radius: number;
  eyeSpacing: number;
  eyeDy: number;
  eyeScale: number;
  browDy: number;
  browColor: number;
  mouthDy: number;
  mouth: 'smile' | 'grin';
  blush: boolean;
  nose?: boolean;
  noseDy?: number;
}

/** Big, low-set chibi eyes with double sparkle highlights, tiny nose and mouth. */
function buildFace(parent: THREE.Object3D, o: FaceOpts) {
  const eyeMat = basic(0x2a1a14);
  const hiMat = basic(0xffffff);
  const browMat = basic(o.browColor);
  const blushMat = basic(0xff9fb0);
  const eyeW = 0.028 * o.eyeScale;
  const eyeH = 0.038 * o.eyeScale;
  for (const s of [-1, 1]) {
    const x = s * o.eyeSpacing;
    const z = surfaceZ(o.radius, x, o.eyeDy) + 0.004;
    const eye = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 10), eyeMat);
    eye.name = s < 0 ? 'eyeL' : 'eyeR';
    eye.scale.set(eyeW, eyeH, 0.014);
    eye.position.set(x, o.headY + o.eyeDy, z);
    parent.add(eye);
    // two sparkle highlights
    mk(parent, new THREE.SphereGeometry(eyeW * 0.32, 6, 6), hiMat, x + eyeW * 0.28, o.headY + o.eyeDy + eyeH * 0.32, z + 0.012, false);
    mk(parent, new THREE.SphereGeometry(eyeW * 0.16, 6, 6), hiMat, x - eyeW * 0.28, o.headY + o.eyeDy - eyeH * 0.3, z + 0.012, false);

    const bz = surfaceZ(o.radius, x, o.browDy) + 0.002;
    const brow = mk(parent, new THREE.BoxGeometry(0.07, 0.012, 0.01), browMat, x, o.headY + o.browDy, bz, false);
    brow.rotation.z = -s * 0.12;

    if (o.blush) {
      const bx = s * o.eyeSpacing * 1.55;
      const by = o.eyeDy - 0.06;
      const blush = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), blushMat);
      blush.scale.set(0.055, 0.032, 0.008);
      blush.position.set(bx, o.headY + by, surfaceZ(o.radius, bx, by) + 0.002);
      blush.rotation.y = s * 0.6;
      parent.add(blush);
    }
  }
  if (o.nose) {
    const nd = o.noseDy ?? -0.08;
    mk(parent, new THREE.SphereGeometry(0.014, 6, 6), lambert(0xe9b7a0), 0, o.headY + nd, surfaceZ(o.radius, 0, nd) + 0.004, false);
  }
  const mz = surfaceZ(o.radius, 0, o.mouthDy) + 0.004;
  if (o.mouth === 'smile') {
    const smile = mk(parent, new THREE.TorusGeometry(0.028, 0.006, 6, 12, Math.PI), basic(0xc4566a), 0, o.headY + o.mouthDy + 0.028, mz, false);
    smile.rotation.z = Math.PI;
  } else {
    const mouth = mk(
      parent,
      new THREE.CircleGeometry(0.05, 14, Math.PI, Math.PI),
      new THREE.MeshBasicMaterial({ color: 0x7b2d3a, side: THREE.DoubleSide }),
      0, o.headY + o.mouthDy + 0.028, mz, false
    );
    mouth.name = 'mouth';
    mk(parent, new THREE.BoxGeometry(0.075, 0.013, 0.004), basic(0xffffff), 0, o.headY + o.mouthDy + 0.021, mz + 0.002, false);
  }
}

function makeLeg(
  name: string, x: number, hipY: number, length: number, radius: number,
  legMat: THREE.Material, shoeMat: THREE.Material
): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(radius, radius * 0.9, length, 8);
  geo.translate(0, -length / 2, 0); // pivot at the hip so rotation swings naturally
  const leg = new THREE.Mesh(geo, legMat);
  leg.name = name;
  leg.position.set(x, hipY, 0);
  leg.castShadow = true;
  const shoe = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.7, 8, 6), shoeMat);
  shoe.scale.set(1, 0.62, 1.55);
  shoe.position.set(0, -length + 0.015, radius * 0.7);
  shoe.castShadow = true;
  leg.add(shoe);
  return leg;
}

function makeArm(
  name: string, x: number, y: number, totalLen: number, radius: number,
  sleeveLen: number, sleeveMat: THREE.Material, skinMat: THREE.Material
): THREE.Group {
  const arm = new THREE.Group();
  arm.name = name;
  arm.position.set(x, y, 0);
  arm.rotation.z = x < 0 ? 0.1 : -0.1;
  if (sleeveLen > 0) {
    const sg = new THREE.CylinderGeometry(radius * 1.05, radius * 1.0, sleeveLen, 8);
    sg.translate(0, -sleeveLen / 2, 0);
    mk(arm, sg, sleeveMat, 0, 0, 0);
  }
  if (totalLen > sleeveLen) {
    const fl = totalLen - sleeveLen;
    const fg = new THREE.CylinderGeometry(radius * 0.85, radius * 0.8, fl, 8);
    fg.translate(0, -fl / 2, 0);
    mk(arm, fg, skinMat, 0, -sleeveLen, 0);
  }
  mk(arm, new THREE.SphereGeometry(radius * 1.35, 8, 8), skinMat, 0, -totalLen - 0.005, 0);
  return arm;
}

/**
 * Duyên (player) — CHIBI proportions: huge round head (~55% of total height),
 * short stubby body, arms and legs, big low-set eyes.
 * Default look: long dark-brown hair with curtain bangs, butter-yellow puff-sleeve dress.
 */
export function createDuyenModel(look: Partial<DuyenLook> = {}): THREE.Group {
  const L: DuyenLook = { ...DEFAULT_DUYEN_LOOK, ...look };
  const group = new THREE.Group();
  group.name = 'duyen';

  const skin = lambert(0xffe0cf);
  const yellow = L.outfit === 'yellow';
  const dressMat = lambert(yellow ? 0xf6df8a : 0xf4efe3);
  const collarMat = lambert(0xfbeeb4);
  const hairColor = L.hairStyle === 'long' ? 0x3a2318 : 0x16110f; // [TODO: xác nhận màu tóc mặc định]
  const hairMat = lambert(hairColor, true);
  const shoeMat = lambert(0xfdf6ee);

  const headR = 0.36;
  const headY = 0.98;
  const hr = headR + 0.02; // hair shell radius

  // Little bell-shaped dress body
  mk(group, new THREE.CylinderGeometry(0.15, 0.27, 0.4, 12), dressMat, 0, 0.46, 0);
  if (yellow) {
    mk(group, new THREE.CylinderGeometry(0.155, 0.165, 0.045, 12), collarMat, 0, 0.665, 0);
    for (const s of [-1, 1]) {
      const puff = mk(group, new THREE.SphereGeometry(0.095, 10, 8), dressMat, s * 0.17, 0.6, 0);
      puff.scale.set(1, 0.85, 1);
    }
  } else {
    const l1 = mk(group, new THREE.CylinderGeometry(0.2, 0.31, 0.11, 12), lambert(0xfaf6ec), 0, 0.3, 0);
    l1.rotation.z = 0.05;
    const l2 = mk(group, new THREE.CylinderGeometry(0.18, 0.28, 0.1, 12), lambert(0xf8f2e6), 0, 0.37, 0);
    l2.rotation.z = -0.05;
    for (const s of [-1, 1]) mk(group, new THREE.BoxGeometry(0.03, 0.1, 0.03), dressMat, s * 0.09, 0.68, 0.02);
  }

  // Short chubby arms with round hands
  const leftArm = makeArm('leftArm', -0.17, 0.6, 0.23, 0.045, yellow ? 0.06 : 0, dressMat, skin);
  const rightArm = makeArm('rightArm', 0.17, 0.6, 0.23, 0.045, yellow ? 0.06 : 0, dressMat, skin);
  group.add(leftArm, rightArm);
  const bangle = mk(rightArm, new THREE.TorusGeometry(0.052, 0.011, 6, 12), lambert(0xf3a6bb), 0, -0.19, 0, false);
  bangle.rotation.x = Math.PI / 2;

  // Stubby legs with chunky shoes
  group.add(makeLeg('leftLeg', -0.09, 0.27, 0.25, 0.065, skin, shoeMat));
  group.add(makeLeg('rightLeg', 0.09, 0.27, 0.25, 0.065, skin, shoeMat));

  // Big round head + face
  const head = mk(group, new THREE.SphereGeometry(headR, 20, 16), skin, 0, headY, 0);
  head.scale.set(1.04, 0.97, 1);
  buildFace(group, {
    headY, radius: headR, eyeSpacing: 0.125, eyeDy: -0.035, eyeScale: 1.9,
    browDy: 0.095, browColor: 0x3a2a22, mouthDy: -0.175, mouth: 'smile', blush: true,
    nose: true, noseDy: -0.1,
  });

  // Hair (group 'hair'); the cap ends well ABOVE the brows so the face stays visible
  const hair = new THREE.Group();
  hair.name = 'hair';
  group.add(hair);
  mk(hair, new THREE.SphereGeometry(hr, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.36), hairMat, 0, headY, -0.01);
  const longH = L.hairStyle === 'long';
  const hairTop = headY + 0.17;
  const bottomY = longH ? 0.42 : 0.72;
  const backH = hairTop - bottomY;
  const back = mk(
    hair,
    new THREE.CylinderGeometry(hr, longH ? 0.3 : hr + 0.05, backH, 16, 1, true, Math.PI * 0.32, Math.PI * 1.36),
    hairMat, 0, bottomY + backH / 2, -0.01
  );
  back.castShadow = true;
  const bangY = headY + 0.15;
  const rxz = Math.sqrt(hr * hr - 0.15 * 0.15) + 0.012;
  for (const s of [-1, 1]) {
    [0.12, 0.3, 0.5, 0.7, 0.92].forEach((a, i) => {
      const ang = a * s;
      const bang = mk(
        hair, new THREE.BoxGeometry(0.085, 0.085 + (i % 2) * 0.015, 0.022), hairMat,
        rxz * Math.sin(ang), bangY, rxz * Math.cos(ang), false
      );
      bang.rotation.y = ang;
      bang.rotation.z = -s * 0.15;
    });
    // Face-framing locks over the shoulders (tapered, hugging the head)
    const lockLen = longH ? 0.6 : 0.3;
    const lockGeo = new THREE.CylinderGeometry(0.055, 0.03, lockLen, 6);
    const lx = s * (headR * 1.0 + 0.0);
    const lock = mk(hair, lockGeo, hairMat, lx, hairTop - 0.03 - lockLen / 2, 0.11, false);
    lock.scale.set(1, 1, 0.8);
    lock.rotation.z = s * 0.06;
  }

  if (L.hat) {
    const hat = new THREE.Group();
    hat.name = 'strawHat';
    const hatMat = lambert(PALETTE.duyenHat);
    mk(hat, new THREE.CylinderGeometry(0.62, 0.62, 0.035, 20), hatMat, 0, headY + 0.3, 0);
    mk(hat, new THREE.CylinderGeometry(0.34, 0.38, 0.2, 16), hatMat, 0, headY + 0.4, 0);
    mk(hat, new THREE.CylinderGeometry(0.385, 0.385, 0.055, 16), lambert(0xff8fa3), 0, headY + 0.34, 0, false);
    group.add(hat);
  }

  // Watering can (toggled by FarmScene)
  const toolGroup = new THREE.Group();
  toolGroup.name = 'heldTool';
  const canMat = lambert(0x70c1b3);
  mk(toolGroup, new THREE.CylinderGeometry(0.08, 0.1, 0.18, 8), canMat);
  const spout = mk(toolGroup, new THREE.CylinderGeometry(0.02, 0.03, 0.18, 6), canMat, 0.1, 0.06, 0);
  spout.rotation.z = Math.PI / 4;
  toolGroup.position.set(0.3, 0.4, 0.15);
  toolGroup.visible = false;
  group.add(toolGroup);

  // Compact camera accessory (hidden by default)
  const cam = new THREE.Group();
  cam.name = 'cameraProp';
  mk(cam, new THREE.BoxGeometry(0.12, 0.075, 0.045), lambert(0xf7f7f5));
  mk(cam, new THREE.CylinderGeometry(0.027, 0.027, 0.03, 10), lambert(0x222831), 0, 0, 0.035).rotation.x = Math.PI / 2;
  cam.position.set(-0.24, 0.38, 0.12);
  cam.visible = false;
  group.add(cam);

  return group;
}

/**
 * Khim (supporting NPC) — CHIBI proportions. Short dark spiky-fringe hair, glasses,
 * big smile, gray mock-neck sweater, light-gray pants, black crossbody bag.
 */
export function createKhimModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'khim';

  const skin = lambert(0xf6d5bf);
  const sweater = lambert(0x8b8f94);
  const pants = lambert(0xb4b7bb);
  const hairMat = lambert(0x1c1c22);
  const black = lambert(0x1f2430);
  const glassMat = basic(0x3a3f4a);
  const shoeMat = lambert(0xf1efe9);

  const headR = 0.37;
  const headY = 1.02;
  const hr = headR + 0.02;

  // Short chubby torso + mock neck
  mk(group, new THREE.CylinderGeometry(0.19, 0.24, 0.42, 12), sweater, 0, 0.49, 0);
  mk(group, new THREE.CylinderGeometry(0.1, 0.11, 0.06, 10), sweater, 0, 0.72, 0);
  const strapF = mk(group, new THREE.BoxGeometry(0.045, 0.5, 0.03), black, 0, 0.5, 0.2, false);
  strapF.rotation.z = 0.6;
  const strapB = mk(group, new THREE.BoxGeometry(0.045, 0.5, 0.03), black, 0, 0.5, -0.2, false);
  strapB.rotation.z = -0.6;
  mk(group, new THREE.BoxGeometry(0.16, 0.12, 0.07), black, 0.25, 0.34, 0.04);

  group.add(makeArm('leftArm', -0.22, 0.65, 0.27, 0.055, 0.24, sweater, skin));
  group.add(makeArm('rightArm', 0.22, 0.65, 0.27, 0.055, 0.24, sweater, skin));

  group.add(makeLeg('leftLeg', -0.1, 0.28, 0.27, 0.078, pants, shoeMat));
  group.add(makeLeg('rightLeg', 0.1, 0.28, 0.27, 0.078, pants, shoeMat));

  // Big round head (slightly wider) + ears
  const head = mk(group, new THREE.SphereGeometry(headR, 20, 16), skin, 0, headY, 0);
  head.scale.set(1.06, 0.98, 1);
  for (const s of [-1, 1]) mk(group, new THREE.SphereGeometry(0.06, 8, 8), skin, s * headR * 1.06, headY - 0.04, 0);
  buildFace(group, {
    headY, radius: headR, eyeSpacing: 0.125, eyeDy: -0.03, eyeScale: 1.5,
    browDy: 0.085, browColor: 0x1c1c22, mouthDy: -0.18, mouth: 'grin', blush: false,
    nose: true, noseDy: -0.1,
  });

  // Glasses
  const gz = surfaceZ(headR, 0.125, -0.03) + 0.014;
  for (const s of [-1, 1]) {
    const ring = mk(group, new THREE.TorusGeometry(0.085, 0.009, 6, 16), glassMat, s * 0.125, headY - 0.03, gz, false);
    ring.scale.set(1.15, 0.95, 1);
    const temple = mk(group, new THREE.BoxGeometry(0.012, 0.012, 0.36), glassMat, s * 0.3, headY - 0.025, 0.17, false);
    temple.rotation.y = -s * 0.57;
  }
  mk(group, new THREE.BoxGeometry(0.06, 0.012, 0.012), glassMat, 0, headY - 0.02, gz, false);

  // Hair: cap above brows + spiky fringe + crown spikes
  const hair = new THREE.Group();
  hair.name = 'hair';
  group.add(hair);
  mk(hair, new THREE.SphereGeometry(hr, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.383), hairMat, 0, headY, -0.01);
  for (const s of [-1, 1]) {
    const sb = mk(hair, new THREE.SphereGeometry(0.1, 8, 8), hairMat, s * (headR * 1.0 + 0.0), headY + 0.11, 0, false);
    sb.scale.set(0.55, 1.1, 1.15);
  }
  const fringeGeo = new THREE.ConeGeometry(0.042, 0.11, 5);
  const fr = Math.sqrt(hr * hr - 0.17 * 0.17) + 0.005;
  [-0.95, -0.62, -0.3, 0, 0.3, 0.62, 0.95].forEach((a) => {
    const c = mk(hair, fringeGeo, hairMat, fr * Math.sin(a), headY + 0.17, fr * Math.cos(a), false);
    c.rotation.y = a;
    c.rotation.x = Math.PI * 0.9;
  });
  const spikeGeo = new THREE.ConeGeometry(0.055, 0.15, 5);
  const up = new THREE.Vector3(0, 1, 0);
  [[0.2, 0], [0.55, 0.8], [0.55, 2.4], [0.55, 4.0], [0.55, 5.4], [0.9, 1.6], [0.9, 3.2], [0.9, 4.8]].forEach(([pol, az]) => {
    const n = new THREE.Vector3(Math.sin(pol) * Math.sin(az), Math.cos(pol), Math.sin(pol) * Math.cos(az));
    const sp = new THREE.Mesh(spikeGeo, hairMat);
    sp.position.copy(n.clone().multiplyScalar(hr + 0.01)).add(new THREE.Vector3(0, headY, -0.01));
    sp.quaternion.setFromUnitVectors(up, n);
    hair.add(sp);
  });

  // Optional BIM tablet (hidden by default)
  const tablet = mk(group, new THREE.BoxGeometry(0.2, 0.28, 0.02), lambert(0x2d3748), 0.3, 0.4, 0.15);
  tablet.name = 'tablet';
  tablet.rotation.x = -Math.PI / 6;
  tablet.visible = false;

  // Relationship heart icon overhead
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, 0);
  heartShape.bezierCurveTo(-0.06, 0.08, -0.12, 0.04, -0.12, -0.06);
  heartShape.bezierCurveTo(-0.12, -0.14, -0.04, -0.2, 0, -0.26);
  heartShape.bezierCurveTo(0.04, -0.2, 0.12, -0.14, 0.12, -0.06);
  heartShape.bezierCurveTo(0.12, 0.04, 0.06, 0.08, 0, 0);
  const heartMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(heartShape),
    new THREE.MeshBasicMaterial({ color: 0xff6b81, side: THREE.DoubleSide })
  );
  heartMesh.name = 'khimHeart';
  heartMesh.scale.set(0.6, -0.6, 0.6);
  heartMesh.position.set(0, 1.78, 0);
  group.add(heartMesh);

  return group;
}

/**
 * Creates cat models:
 * - Mochi: White with brown cow spots, follows Duyên
 * - Mon: Playful cat with unconfirmed fur color, temporary item thief
 * - Mây: Serene pure cream/white, leaves gifts
 */
export function createCatModel(catId: 'mochi' | 'mon' | 'may'): THREE.Group {
  const group = new THREE.Group();
  group.name = `cat_${catId}`;

  let primaryColor = PALETTE.catWhite;
  let spotColor = PALETTE.catBrownSpot;

  if (catId === 'mon') {
    primaryColor = MON_FUR_COLOR;
    spotColor = MON_FUR_COLOR; // Neutral placeholder; no assumed markings.
  } else if (catId === 'may') {
    primaryColor = PALETTE.catSoftCream;
    spotColor = PALETTE.catSoftCream;
  }

  const primaryMat = new THREE.MeshLambertMaterial({ color: primaryColor });
  const spotMat = new THREE.MeshLambertMaterial({ color: spotColor });
  const noseMat = new THREE.MeshLambertMaterial({ color: 0xffb7b2 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });

  // Body
  const bodyGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.45, 8);
  bodyGeo.rotateZ(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, primaryMat);
  body.position.y = 0.22;
  body.castShadow = true;
  group.add(body);

  // Spots / Patches for Mochi (cow-like patches)
  if (catId === 'mochi') {
    const patch1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), spotMat);
    patch1.scale.set(1.2, 0.4, 1);
    patch1.position.set(-0.06, 0.32, 0.05);
    const patch2 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), spotMat);
    patch2.scale.set(1, 0.4, 0.8);
    patch2.position.set(0.12, 0.32, -0.06);
    group.add(patch1, patch2);
  }

  // Head
  const headGeo = new THREE.SphereGeometry(0.16, 10, 8);
  const head = new THREE.Mesh(headGeo, primaryMat);
  head.position.set(0.24, 0.32, 0);
  head.castShadow = true;
  group.add(head);

  // Ears
  const earGeo = new THREE.ConeGeometry(0.06, 0.1, 4);
  const leftEar = new THREE.Mesh(earGeo, catId === 'mochi' ? spotMat : primaryMat);
  leftEar.position.set(0.24, 0.46, 0.09);
  leftEar.rotation.z = -0.15;
  const rightEar = new THREE.Mesh(earGeo, primaryMat);
  rightEar.position.set(0.24, 0.46, -0.09);
  rightEar.rotation.z = -0.15;
  group.add(leftEar, rightEar);

  // Eyes & Nose
  const eyeGeo = new THREE.SphereGeometry(0.02, 6, 6);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(0.38, 0.33, 0.07);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.38, 0.33, -0.07);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), noseMat);
  nose.position.set(0.4, 0.3, 0);
  group.add(leftEye, rightEye, nose);

  // 4 Paws / Legs
  const pawGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.14, 6);
  const flPaw = new THREE.Mesh(pawGeo, primaryMat);
  flPaw.name = 'flPaw';
  flPaw.position.set(0.14, 0.07, 0.1);
  const frPaw = new THREE.Mesh(pawGeo, primaryMat);
  frPaw.name = 'frPaw';
  frPaw.position.set(0.14, 0.07, -0.1);
  const blPaw = new THREE.Mesh(pawGeo, primaryMat);
  blPaw.name = 'blPaw';
  blPaw.position.set(-0.14, 0.07, 0.1);
  const brPaw = new THREE.Mesh(pawGeo, primaryMat);
  brPaw.name = 'brPaw';
  brPaw.position.set(-0.14, 0.07, -0.1);
  group.add(flPaw, frPaw, blPaw, brPaw);

  // Tail
  const tailGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.26, 6);
  const tail = new THREE.Mesh(tailGeo, catId === 'mochi' ? spotMat : primaryMat);
  tail.name = 'catTail';
  tail.position.set(-0.28, 0.32, 0);
  tail.rotation.z = Math.PI / 4;
  group.add(tail);

  // Stolen Item visual attached to Mon's mouth when active
  if (catId === 'mon') {
    const stolenGroup = new THREE.Group();
    stolenGroup.name = 'stolenItem';
    const stolenMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0xef4444 })
    );
    stolenMesh.position.set(0.42, 0.28, 0);
    stolenGroup.add(stolenMesh);
    stolenGroup.visible = false;
    group.add(stolenGroup);
  }

  return group;
}

/**
 * Creates the ground gift box left by Mây.
 */
export function createMayGiftBox(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'may_gift_box';

  const boxGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
  const boxMat = new THREE.MeshLambertMaterial({ color: 0xffd1dc }); // soft pastel pink
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.y = 0.18;
  box.castShadow = true;

  const ribbonGeo = new THREE.BoxGeometry(0.37, 0.37, 0.08);
  const ribbonMat = new THREE.MeshLambertMaterial({ color: 0xfef08a }); // cream gold
  const ribbon1 = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbon1.position.y = 0.18;
  const ribbon2 = ribbon1.clone();
  ribbon2.rotation.y = Math.PI / 2;

  // Cute bow on top
  const bowGeo = new THREE.SphereGeometry(0.07, 6, 6);
  const bow = new THREE.Mesh(bowGeo, ribbonMat);
  bow.position.y = 0.39;

  group.add(box, ribbon1, ribbon2, bow);
  return group;
}

/**
 * Creates distinct procedural low-poly models for the four villagers.
 */
export function createVillagerModel(villagerId: string): THREE.Group {
  const group = new THREE.Group();
  group.name = `villager_${villagerId}`;

  const skinMat = new THREE.MeshLambertMaterial({ color: PALETTE.duyenSkin });
  const darkEyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });

  if (villagerId === 'ong_bay') {
    // Ông Bảy Thợ Mộc: Older carpenter, gray hair, leather apron
    const grayHairMat = new THREE.MeshLambertMaterial({ color: 0x9ca3af });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const apronMat = new THREE.MeshLambertMaterial({ color: 0x92400e }); // leather brown
    const hatMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.58, 0.3), shirtMat);
    torso.position.y = 0.65;
    torso.castShadow = true;
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.45, 0.04), apronMat);
    apron.position.set(0, 0.62, 0.16);
    group.add(torso, apron);

    // Head & Gray Beard / Hair
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), skinMat);
    head.position.y = 1.15;
    head.castShadow = true;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), grayHairMat);
    hair.position.y = 1.18;
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.12, 10), hatMat);
    hat.position.set(0, 1.34, 0);
    group.add(head, hair, hat);

    // Eyes
    const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), darkEyeMat);
    e1.position.set(-0.08, 1.15, 0.23);
    const e2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), darkEyeMat);
    e2.position.set(0.08, 1.15, 0.23);
    group.add(e1, e2);

    // Legs
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.4, 0.18), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    leftLeg.position.set(-0.12, 0.2, 0);
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.12;
    group.add(leftLeg, rightLeg);

    // Carpenter Ruler/Plank in hand
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.04), new THREE.MeshLambertMaterial({ color: 0xfef08a }));
    plank.position.set(0.3, 0.6, 0.1);
    plank.rotation.z = -0.3;
    group.add(plank);
  } else if (villagerId === 'co_hoa') {
    // Cô Hoa Tạp Hóa: Floral yellow shirt, wicker basket
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x451a03 });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
    const skirtMat = new THREE.MeshLambertMaterial({ color: 0x15803d });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 0.55, 8), shirtMat);
    torso.position.y = 0.6;
    torso.castShadow = true;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), skinMat);
    head.position.y = 1.05;
    head.castShadow = true;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), hairMat);
    hair.position.set(0, 1.08, -0.05);
    const hairBand = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 6, 12), new THREE.MeshLambertMaterial({ color: 0xf43f5e }));
    hairBand.position.set(0, 1.12, 0);
    hairBand.rotation.x = Math.PI / 2;
    group.add(head, hair, hairBand);

    // Legs
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.35, 8), skirtMat);
    skirt.position.y = 0.22;
    group.add(skirt);

    // Wicker Market Basket on arm
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.22, 8), new THREE.MeshLambertMaterial({ color: 0xd97706 }));
    basket.position.set(0.32, 0.5, 0.12);
    group.add(basket);
  } else if (villagerId === 'ban_lan') {
    // Bạn Lan: Cute wavy hair, soft rose sweater
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const dressMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 0.6, 8), dressMat);
    body.position.y = 0.55;
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), skinMat);
    head.position.y = 1.05;
    head.castShadow = true;

    // Wavy hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), hairMat);
    hair.position.set(0, 1.05, -0.04);
    hair.scale.set(1.05, 1.2, 1.1);

    const hairClip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.02), new THREE.MeshLambertMaterial({ color: 0x67e8f9 }));
    hairClip.position.set(0.15, 1.12, 0.18);
    group.add(head, hair, hairClip);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 6), skinMat);
    leg.position.set(-0.1, 0.15, 0);
    const leg2 = leg.clone();
    leg2.position.x = 0.1;
    group.add(leg, leg2);
  } else {
    // Minh Mê Sách: Neat dark green cardigan, glasses, book
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    const vestMat = new THREE.MeshLambertMaterial({ color: 0x065f46 });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x3f3f46 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.26), vestMat);
    torso.position.y = 0.65;
    torso.castShadow = true;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), skinMat);
    head.position.y = 1.12;
    head.castShadow = true;
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 0.45), hairMat);
    hair.position.set(0, 1.24, 0);
    group.add(head, hair);

    // Glasses
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.04), new THREE.MeshBasicMaterial({ color: 0x09090b }));
    g.position.set(0, 1.12, 0.22);
    group.add(g);

    // Book in hand
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.08), new THREE.MeshLambertMaterial({ color: 0xb91c1c }));
    book.position.set(0.28, 0.62, 0.15);
    book.rotation.x = -Math.PI / 4;
    group.add(book);

    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.4, 0.18), pantsMat);
    leg1.position.set(-0.12, 0.2, 0);
    const leg2 = leg1.clone();
    leg2.position.x = 0.12;
    group.add(leg1, leg2);
  }

  return group;
}

/**
 * Creates procedural Mailbox model (Hộp Thư Gỗ).
 */
export function createMailboxModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'prop_mailbox';

  const woodMat = new THREE.MeshLambertMaterial({ color: PALETTE.woodDark });
  const boxMat = new THREE.MeshLambertMaterial({ color: 0xfef08a }); // cream yellow
  const roofMat = new THREE.MeshLambertMaterial({ color: 0xf87171 }); // coral red
  const flagMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });

  // Post
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6), woodMat);
  post.position.y = 0.55;
  post.castShadow = true;
  group.add(post);

  // Mailbox box
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.55), boxMat);
  box.position.set(0, 1.15, 0);
  box.castShadow = true;

  // Curved top roof
  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.57, 8, 1, false, 0, Math.PI),
    roofMat
  );
  roof.rotation.z = Math.PI / 2;
  roof.rotation.y = Math.PI / 2;
  roof.position.set(0, 1.32, 0);

  // Little red flag
  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.08), flagMat);
  flag.position.set(0.22, 1.25, -0.1);
  group.add(box, roof, flag);

  return group;
}

/**
 * Creates 3D clue markers for Mon's mystery investigation.
 */
export function createClueModel(type: 'crumbs' | 'pawprints'): THREE.Group {
  const group = new THREE.Group();
  group.name = `clue_${type}`;

  if (type === 'crumbs') {
    // Golden bread crumbs on the floor
    const crumbMat = new THREE.MeshLambertMaterial({ color: 0xfbbf24 });
    for (let i = 0; i < 5; i++) {
      const crumb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 5, 5), crumbMat);
      crumb.position.set(
        (Math.random() - 0.5) * 0.4,
        0.03,
        (Math.random() - 0.5) * 0.4
      );
      group.add(crumb);
    }
  } else {
    // Muddy cute cat pawprints
    const mudMat = new THREE.MeshBasicMaterial({ color: 0x78350f });
    for (let p = 0; p < 3; p++) {
      const pawPad = new THREE.Mesh(new THREE.CircleGeometry(0.05, 8), mudMat);
      pawPad.rotation.x = -Math.PI / 2;
      pawPad.position.set(p * 0.2 - 0.2, 0.02, p * 0.15 - 0.1);
      group.add(pawPad);
    }
  }

  // Sparkle beacon overhead
  const beacon = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.12, 0),
    new THREE.MeshBasicMaterial({ color: 0x60a5fa })
  );
  beacon.position.y = 0.5;
  group.add(beacon);

  return group;
}

/**
 * Creates Duyên's Salon Chair model (Ghế làm tóc ngoài trời).
 */
export function createSalonChairModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'prop_salon_chair';

  const chromeMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
  const leatherMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 }); // pastel pink cushion
  const woodMat = new THREE.MeshLambertMaterial({ color: PALETTE.woodLight });
  const mirrorMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });

  // Chrome disc base & stem
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 12), chromeMat);
  base.position.y = 0.03;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8), chromeMat);
  stem.position.y = 0.25;
  group.add(base, stem);

  // Seat cushion
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.55), leatherMat);
  seat.position.y = 0.5;
  seat.castShadow = true;

  // Backrest
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.1), leatherMat);
  back.position.set(0, 0.8, -0.24);
  back.castShadow = true;
  group.add(seat, back);

  // Styling vanity table with mirror
  const table = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 0.35), woodMat);
  table.position.set(0, 0.38, 0.65);
  table.castShadow = true;

  const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.7, 0.05), woodMat);
  mirrorFrame.position.set(0, 1.1, 0.7);
  const mirrorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.02), mirrorMat);
  mirrorGlass.position.set(0, 1.1, 0.72);
  group.add(table, mirrorFrame, mirrorGlass);

  // Little scissors & spray bottle on vanity table
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.18, 6), new THREE.MeshLambertMaterial({ color: 0x38bdf8 }));
  bottle.position.set(0.25, 0.85, 0.65);
  group.add(bottle);

  return group;
}
