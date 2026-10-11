import * as THREE from 'three';
import { DUYEN_LOOK, MON_COLOR, type FriendId } from './content/garden';

const material = (color: number) => new THREE.MeshLambertMaterial({ color });
function part(parent: THREE.Object3D, geometry: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, name = '') {
  const mesh = new THREE.Mesh(geometry, mat); mesh.position.set(x, y, z); mesh.name = name;
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
const sphere = (radius: number) => new THREE.SphereGeometry(radius, 16, 12);

export function human(id: 'duyen' | 'khim'): THREE.Group {
  const root = new THREE.Group(); root.name = id;
  const skin = material(0xf3d1b2), hair = material(id === 'duyen' ? DUYEN_LOOK.hair : 0x28252c);
  const shirt = material(id === 'duyen' ? DUYEN_LOOK.dress : 0x999da3);
  const shoes = material(0xf7edda);
  // Limb groups pivot at the hips/shoulders, rather than at the mesh center.
  for (const side of [-1, 1]) {
    const leg = new THREE.Group(); leg.name = side < 0 ? 'leftLeg' : 'rightLeg'; leg.position.set(side * 0.13, 0.48, 0);
    part(leg, new THREE.CylinderGeometry(0.07, 0.07, 0.36, 8), id === 'duyen' ? skin : material(0xc6c6c4), 0, -0.18);
    const shoe = part(leg, sphere(0.085), shoes, 0, -0.36, 0.035); shoe.scale.set(1, 0.7, 1.5); root.add(leg);
    const arm = new THREE.Group(); arm.name = side < 0 ? 'leftArm' : 'rightArm'; arm.position.set(side * 0.26, 0.85, 0);
    part(arm, sphere(0.115), shirt, 0, -0.015);
    part(arm, new THREE.CylinderGeometry(0.065, 0.057, 0.27, 8), skin, side * 0.035, -0.2);
    root.add(arm);
    if (id === 'duyen' && side === -1) {
      const bangle = part(arm, new THREE.TorusGeometry(0.065, 0.015, 6, 12), material(DUYEN_LOOK.bangle), side * 0.035, -0.3);
      bangle.rotation.x = Math.PI / 2;
    }
  }
  if (id === 'duyen') {
    part(root, new THREE.CylinderGeometry(0.2, 0.37, 0.52, 16), shirt, 0, 0.62);
    const collar = part(root, new THREE.TorusGeometry(0.16, 0.04, 6, 16), shoes, 0, 0.91); collar.rotation.x = Math.PI / 2;
  } else {
    part(root, new THREE.CylinderGeometry(0.2, 0.23, 0.49, 12), shirt, 0, 0.7);
    const strap = part(root, new THREE.BoxGeometry(0.035, 0.53, 0.025), material(0x353332), 0, 0.67, 0.23); strap.rotation.z = 0.55;
    part(root, new THREE.BoxGeometry(0.19, 0.16, 0.08), material(0x353332), 0.21, 0.5, 0.18);
  }
  const head = part(root, sphere(0.42), skin, 0, 1.28); head.scale.set(1, 1.02, 0.96);
  const hairGroup = new THREE.Group(); hairGroup.name = 'hair';
  // Back half-shell and high crown leave the eye plane entirely clear.
  part(hairGroup, new THREE.SphereGeometry(0.445, 20, 14, Math.PI, Math.PI), hair, 0, 1.3);
  part(hairGroup, new THREE.SphereGeometry(0.449, 20, 8, 0, Math.PI * 2, 0, 0.92), hair, 0, 1.3);
  if (id === 'duyen') {
    for (const side of [-1, 1]) {
      const lock = part(hairGroup, new THREE.CapsuleGeometry(0.11, 0.47, 4, 10), hair, side * 0.33, 1.03, -0.14); lock.rotation.z = side * -0.07;
      const bang = part(hairGroup, new THREE.CapsuleGeometry(0.075, 0.19, 4, 8), hair, side * 0.23, 1.56, 0.22); bang.rotation.z = side * 0.65;
    }
    const camera = new THREE.Group(); camera.name = 'camera';
    part(camera, new THREE.BoxGeometry(0.16, 0.1, 0.06), material(0xffffff));
    const lens = part(camera, new THREE.CylinderGeometry(0.034, 0.034, 0.035, 10), material(0x443d37), 0, 0, 0.05); lens.rotation.x = Math.PI / 2;
    camera.position.set(0.31, 0.46, 0.1); root.add(camera);
  } else {
    for (let i = 0; i < 6; i++) {
      const spike = part(hairGroup, new THREE.ConeGeometry(0.085, 0.17, 6), hair, -0.22 + i * 0.09, 1.68, 0.15);
      spike.rotation.z = (i - 2) * 0.17;
    }
  }
  root.add(hairGroup);
  for (const side of [-1, 1]) {
    const eye = part(root, sphere(0.056), material(0x302b2b), side * 0.14, 1.27, 0.381, side < 0 ? 'eyeL' : 'eyeR'); eye.scale.set(0.85, 1.1, 0.25);
    const shine = part(root, sphere(0.013), material(0xffffff), side * 0.14 - 0.012, 1.29, 0.397); shine.scale.z = 0.3;
    const cheek = part(root, sphere(0.041), material(0xeea693), side * 0.245, 1.16, 0.335); cheek.scale.set(1.3, 0.6, 0.2);
    if (id === 'khim') part(root, new THREE.TorusGeometry(0.085, 0.009, 6, 16), material(0x303037), side * 0.14, 1.28, 0.398);
  }
  if (id === 'khim') part(root, new THREE.BoxGeometry(0.12, 0.014, 0.02), material(0x303037), 0, 1.28, 0.405);
  const smile = part(root, new THREE.TorusGeometry(0.044, 0.009, 6, 12, Math.PI), material(0x91614c), 0, 1.13, 0.366); smile.rotation.z = Math.PI;
  const tool = new THREE.Group(); tool.name = 'wateringCan'; tool.visible = false;
  const can = material(0x84b6b5);
  part(tool, new THREE.CylinderGeometry(0.11, 0.11, 0.18, 10), can);
  const spout = part(tool, new THREE.CylinderGeometry(0.025, 0.025, 0.22, 8), can, 0.12, 0.07); spout.rotation.z = -Math.PI / 3;
  tool.position.set(0.34, 0.55, 0.18); root.add(tool);
  return root;
}

export function cat(id: Exclude<FriendId, 'khim'>): THREE.Group {
  const root = new THREE.Group(); root.name = id;
  const fur = material(id === 'mon' ? MON_COLOR : 0xfffdf5);
  const body = part(root, sphere(0.23), fur, 0, 0.25); body.scale.set(0.72, 0.78, 1.5);
  part(root, sphere(0.185), fur, 0, 0.37, 0.23);
  for (const side of [-1, 1]) {
    part(root, new THREE.ConeGeometry(0.075, 0.16, 3), fur, side * 0.12, 0.56, 0.2);
    part(root, new THREE.ConeGeometry(0.04, 0.075, 3), material(0xeab3b3), side * 0.12, 0.56, 0.245);
    part(root, sphere(0.025), material(0x393434), side * 0.085, 0.4, 0.387);
    for (const z of [-0.16, 0.18]) part(root, sphere(0.07), fur, side * 0.12, 0.1, z);
  }
  part(root, sphere(0.022), material(0xd98a91), 0, 0.34, 0.405);
  const tail = part(root, new THREE.CapsuleGeometry(0.038, 0.29, 4, 8), fur, 0.02, 0.37, -0.34, 'tail'); tail.rotation.x = -0.6;
  if (id === 'mochi') {
    const patch = part(root, sphere(0.14), material(0x3f3c40), 0.08, 0.38, -0.08); patch.scale.set(0.8, 0.3, 1.25);
    const facePatch = part(root, sphere(0.09), material(0x3f3c40), -0.11, 0.48, 0.22); facePatch.scale.z = 0.7;
  }
  return root;
}
