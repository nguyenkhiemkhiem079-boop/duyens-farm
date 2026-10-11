"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FOUR_FIELDS_ASSETS } from "./fourFieldsMintAssets";
import { human, cat } from "./personalModels";
import { MEMORIES } from "./content/story";
import { browserStorage, completeMemory, loadProgress, saveProgress, PERSONAL_SAVE_KEY, type Progress } from "./personalProgress";

type Phase = "loading" | "intro" | "playing" | "transition" | "victory" | "memory" | "error";
type Direction = "up" | "down" | "left" | "right";

const FARM_XZ_EXPANSION = 1.43;
const WORLD_XZ_SCALE = 30.4 * FARM_XZ_EXPANSION;
const WORLD_Y_SCALE = 32.8;
const FARM_SURFACE_Y = 0.86;
const SINGLE_REAP_START_FRAME = 30;
const SINGLE_REAP_END_FRAME = 73;
const SINGLE_REAP_FPS = 30;
const SINGLE_REAP_TIME_SCALE = 1.35;
const SINGLE_REAP_SECONDS =
  (SINGLE_REAP_END_FRAME - SINGLE_REAP_START_FRAME) /
  SINGLE_REAP_FPS /
  SINGLE_REAP_TIME_SCALE;
const farmSurfacePoint = (x: number, z: number, y = FARM_SURFACE_Y) =>
  new THREE.Vector3(x, y, z);

const PLOTS = [
  { name: "Bắp vàng", icon: "🌽", center: farmSurfacePoint(-3.6, 8), height: 2.5, spread: 1 },
  { name: "Khoai tây", icon: "🥔", center: farmSurfacePoint(7.65, 10.25), height: 1.65, spread: 1 },
  { name: "Cà chua", icon: "🍅", center: farmSurfacePoint(10.8, 1.25), height: 2.15, spread: 1 },
  { name: "Dâu tây", icon: "🍓", center: farmSurfacePoint(0, -3, FARM_SURFACE_Y + 0.055), height: 0.78, spread: 0.82 },
] as const;

const PLANT_OFFSETS = [
  [-2.35, -1.5], [-0.78, -1.5], [0.78, -1.5], [2.35, -1.5],
  [-2.35, 0], [-0.78, 0], [0.78, 0], [2.35, 0],
  [-2.35, 1.5], [-0.78, 1.5], [0.78, 1.5], [2.35, 1.5],
] as const;

const clamp = THREE.MathUtils.clamp;

function loadGltf(loader: GLTFLoader, path: string) {
  return new Promise<Awaited<ReturnType<GLTFLoader["loadAsync"]>>>((resolve, reject) => {
    loader.load(path, resolve, undefined, reject);
  });
}

function disposeResources(roots: THREE.Object3D[]) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  for (const root of roots) root.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return;
    geometries.add(node.geometry);
    for (const mat of Array.isArray(node.material) ? node.material : [node.material]) {
      materials.add(mat);
      for (const value of Object.values(mat)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  geometries.forEach(value => value.dispose());
  materials.forEach(value => value.dispose());
  textures.forEach(value => value.dispose());
}

function groundAndScale(root: THREE.Object3D, height: number) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const scale = height / Math.max(size.y, 0.001);
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);
  const scaled = new THREE.Box3().setFromObject(root);
  const center = scaled.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= scaled.min.y;
  return root;
}

function extractFamily(source: THREE.Object3D, count: number) {
  source.updateMatrixWorld(true);
  let sourceMesh: THREE.Mesh | null = null;
  source.traverse((node) => {
    if ((node as THREE.Mesh).isMesh && !sourceMesh) sourceMesh = node as THREE.Mesh;
  });
  if (!sourceMesh) throw new Error("Mint crop family contains no mesh.");

  const mesh = sourceMesh as THREE.Mesh;
  const geometry = mesh.geometry.clone();
  geometry.applyMatrix4(mesh.matrixWorld);
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  const position = flat.getAttribute("position") as THREE.BufferAttribute;
  const triangles = Math.floor(position.count / 3);
  const points: { x: number; z: number; projection: number; triangle: number }[] = [];

  let meanX = 0;
  let meanZ = 0;
  for (let triangle = 0; triangle < triangles; triangle += 1) {
    const i = triangle * 3;
    const x = (position.getX(i) + position.getX(i + 1) + position.getX(i + 2)) / 3;
    const z = (position.getZ(i) + position.getZ(i + 1) + position.getZ(i + 2)) / 3;
    meanX += x;
    meanZ += z;
    points.push({ x, z, projection: 0, triangle });
  }
  meanX /= points.length;
  meanZ /= points.length;

  let xx = 0;
  let zz = 0;
  let xz = 0;
  for (const point of points) {
    const x = point.x - meanX;
    const z = point.z - meanZ;
    xx += x * x;
    zz += z * z;
    xz += x * z;
  }
  const angle = 0.5 * Math.atan2(2 * xz, xx - zz);
  let axisX = Math.cos(angle);
  let axisZ = Math.sin(angle);
  if (axisX < 0) {
    axisX *= -1;
    axisZ *= -1;
  }
  let min = Infinity;
  let max = -Infinity;
  for (const point of points) {
    point.projection = point.x * axisX + point.z * axisZ;
    min = Math.min(min, point.projection);
    max = Math.max(max, point.projection);
  }

  let centers = Array.from({ length: count }, (_, index) => min + ((index + 0.5) / count) * (max - min));
  for (let iteration = 0; iteration < 40; iteration += 1) {
    const sums = Array.from({ length: count }, () => ({ sum: 0, amount: 0 }));
    for (const point of points) {
      let winner = 0;
      let distance = Infinity;
      centers.forEach((center, index) => {
        const candidate = Math.abs(point.projection - center);
        if (candidate < distance) {
          winner = index;
          distance = candidate;
        }
      });
      sums[winner].sum += point.projection;
      sums[winner].amount += 1;
    }
    centers = centers.map((center, index) => sums[index].amount ? sums[index].sum / sums[index].amount : center);
  }

  const ordered = centers.map((center, index) => ({ center, index })).sort((a, b) => a.center - b.center);
  const rank = new Map(ordered.map((item, index) => [item.index, index]));
  const perCluster = Array.from({ length: count }, () => new Map<string, number[]>());
  const attributes = Object.entries(flat.attributes);

  for (const point of points) {
    let winner = 0;
    let distance = Infinity;
    centers.forEach((center, index) => {
      const candidate = Math.abs(point.projection - center);
      if (candidate < distance) {
        winner = index;
        distance = candidate;
      }
    });
    const target = perCluster[rank.get(winner) ?? winner];
    for (const [name, attribute] of attributes) {
      const values = target.get(name) ?? [];
      const typed = attribute as THREE.BufferAttribute;
      const start = point.triangle * 3;
      for (let vertex = start; vertex < start + 3; vertex += 1) {
        for (let component = 0; component < typed.itemSize; component += 1) {
          values.push(typed.array[vertex * typed.itemSize + component] as number);
        }
      }
      target.set(name, values);
    }
  }

  return perCluster.map((attributeMap) => {
    const output = new THREE.BufferGeometry();
    for (const [name, values] of attributeMap) {
      const original = flat.getAttribute(name) as THREE.BufferAttribute;
      output.setAttribute(name, new THREE.Float32BufferAttribute(values, original.itemSize, original.normalized));
    }
    output.computeBoundingBox();
    const box = output.boundingBox!;
    const center = box.getCenter(new THREE.Vector3());
    output.translate(-center.x, -box.min.y, -center.z);
    output.computeBoundingSphere();
    const result = new THREE.Mesh(output, mesh.material);
    result.castShadow = true;
    result.receiveShadow = true;
    return result;
  });
}

function createPlant(mesh: THREE.Mesh, height: number, position: THREE.Vector3) {
  const plant = new THREE.Mesh(mesh.geometry, mesh.material);
  plant.castShadow = true;
  plant.receiveShadow = true;
  plant.geometry.computeBoundingBox();
  const box = plant.geometry.boundingBox!;
  const scale = height / Math.max(box.max.y - box.min.y, 0.001);
  plant.scale.setScalar(scale);
  plant.position.copy(position);
  return plant;
}

function prepareMintFarmstead(source: THREE.Object3D) {
  let removedTriangles = 0;
  source.updateMatrixWorld(true);
  const sourceMinY = new THREE.Box3().setFromObject(source).min.y;

  source.traverse((node) => {
    if (!(node as THREE.Mesh).isMesh) return;
    const mesh = node as THREE.Mesh;
    const geometry = mesh.geometry;
    const index = geometry.index;
    const position = geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (!index || !position) return;

    const triangleCount = Math.floor(index.count / 3);
    const parents = new Int32Array(triangleCount);
    for (let triangle = 0; triangle < triangleCount; triangle += 1) parents[triangle] = triangle;
    const find = (value: number) => {
      let root = value;
      while (parents[root] !== root) root = parents[root];
      while (parents[value] !== value) {
        const next = parents[value];
        parents[value] = root;
        value = next;
      }
      return root;
    };
    const union = (left: number, right: number) => {
      const leftRoot = find(left);
      const rightRoot = find(right);
      if (leftRoot !== rightRoot) parents[rightRoot] = leftRoot;
    };
    const vertexOwners = new Map<string, number>();
    for (let triangle = 0; triangle < triangleCount; triangle += 1) {
      for (let corner = 0; corner < 3; corner += 1) {
        const vertex = index.getX(triangle * 3 + corner);
        const key = [
          position.getX(vertex).toFixed(5),
          position.getY(vertex).toFixed(5),
          position.getZ(vertex).toFixed(5),
        ].join(",");
        const owner = vertexOwners.get(key);
        if (owner === undefined) vertexOwners.set(key, triangle);
        else union(triangle, owner);
      }
    }

    const componentBounds = new Map<number, THREE.Box3>();
    for (let triangle = 0; triangle < triangleCount; triangle += 1) {
      const root = find(triangle);
      const bounds = componentBounds.get(root) ?? new THREE.Box3();
      for (let corner = 0; corner < 3; corner += 1) {
        const vertex = index.getX(triangle * 3 + corner);
        bounds.expandByPoint(
          new THREE.Vector3(
            position.getX(vertex),
            position.getY(vertex),
            position.getZ(vertex),
          ).applyMatrix4(mesh.matrixWorld),
        );
      }
      componentBounds.set(root, bounds);
    }
    const omittedComponents = new Set<number>();
    for (const [root, bounds] of componentBounds) {
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const worldSizeX = size.x * WORLD_XZ_SCALE;
      const worldSizeY = size.y * WORLD_Y_SCALE;
      const worldSizeZ = size.z * WORLD_XZ_SCALE;
      const worldCenterX = center.x * WORLD_XZ_SCALE;
      const worldCenterY = (center.y - sourceMinY) * WORLD_Y_SCALE;
      const worldCenterZ = center.z * WORLD_XZ_SCALE;
      const isRaisedCrossedGroundDetail =
        worldCenterY < 1.4 &&
        worldSizeY >= 0.3 &&
        worldSizeY <= 1.35 &&
        worldSizeX <= 1.65 &&
        worldSizeZ <= 1.65;
      const isFlatCrossedGroundDetail =
        worldCenterY < 0.8 &&
        worldSizeY >= 0.04 &&
        worldSizeY < 0.3 &&
        worldSizeX <= 2.8 &&
        worldSizeZ <= 2.8;
      const isPlanarCrossedGroundDetail =
        worldCenterY < 0.8 &&
        worldSizeY < 0.04 &&
        worldSizeX <= 1 &&
        worldSizeZ <= 1;
      const isFrontGateDoor =
        worldCenterX > -1 &&
        worldCenterX < 1.5 &&
        worldCenterZ > 16 &&
        worldCenterZ < 18 &&
        worldSizeX > 2.2 &&
        worldSizeX < 3.1 &&
        worldSizeY < 2.9 &&
        worldSizeZ < 2.2;
      if (
        isRaisedCrossedGroundDetail ||
        isFlatCrossedGroundDetail ||
        isPlanarCrossedGroundDetail ||
        isFrontGateDoor
      ) {
        omittedComponents.add(root);
      }
    }

    const keptIndices: number[] = [];
    for (let triangle = 0; triangle < triangleCount; triangle += 1) {
      const offset = triangle * 3;
      const root = find(triangle);
      if (omittedComponents.has(root)) {
        removedTriangles += 1;
        continue;
      }
      const triangleIndices = [
        index.getX(offset),
        index.getX(offset + 1),
        index.getX(offset + 2),
      ];
      keptIndices.push(...triangleIndices);
    }
    geometry.setIndex(keptIndices);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
  });
  return removedTriangles;
}

function extractMintPlotPatch(source: THREE.Object3D, polygon: readonly THREE.Vector2[]) {
  source.updateMatrixWorld(true);
  let sourceMesh: THREE.Mesh | null = null;
  source.traverse((node) => {
    if ((node as THREE.Mesh).isMesh && !sourceMesh) sourceMesh = node as THREE.Mesh;
  });
  if (!sourceMesh) return null;

  const mesh = sourceMesh as THREE.Mesh;
  const geometry = mesh.geometry.clone();
  geometry.applyMatrix4(mesh.matrixWorld);
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  const position = flat.getAttribute("position") as THREE.BufferAttribute;
  const outputValues = new Map<string, number[]>();
  const attributes = Object.entries(flat.attributes);
  attributes.forEach(([name]) => outputValues.set(name, []));

  type PatchVertex = {
    attributes: Map<string, number[]>;
    x: number;
    z: number;
  };
  const polygonArea = polygon.reduce((sum, point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0);
  const orientation = polygonArea >= 0 ? 1 : -1;

  const createVertex = (index: number): PatchVertex => {
    const vertexAttributes = new Map<string, number[]>();
    for (const [name, attribute] of attributes) {
      const typed = attribute as THREE.BufferAttribute;
      vertexAttributes.set(
        name,
        Array.from({ length: typed.itemSize }, (_, component) =>
          typed.array[index * typed.itemSize + component] as number),
      );
    }
    return {
      attributes: vertexAttributes,
      x: position.getX(index),
      z: position.getZ(index),
    };
  };

  const interpolateVertex = (start: PatchVertex, end: PatchVertex, t: number): PatchVertex => {
    const vertexAttributes = new Map<string, number[]>();
    for (const [name, startValues] of start.attributes) {
      const endValues = end.attributes.get(name)!;
      vertexAttributes.set(
        name,
        startValues.map((value, index) => THREE.MathUtils.lerp(value, endValues[index], t)),
      );
    }
    return {
      attributes: vertexAttributes,
      x: THREE.MathUtils.lerp(start.x, end.x, t),
      z: THREE.MathUtils.lerp(start.z, end.z, t),
    };
  };

  const edgeDistance = (vertex: PatchVertex, start: THREE.Vector2, end: THREE.Vector2) =>
    orientation * ((end.x - start.x) * (vertex.z - start.y) - (end.y - start.y) * (vertex.x - start.x));

  for (let triangle = 0; triangle < Math.floor(position.count / 3); triangle += 1) {
    const start = triangle * 3;
    let clipped = [createVertex(start), createVertex(start + 1), createVertex(start + 2)];

    for (let edgeIndex = 0; edgeIndex < polygon.length && clipped.length > 0; edgeIndex += 1) {
      const edgeStart = polygon[edgeIndex];
      const edgeEnd = polygon[(edgeIndex + 1) % polygon.length];
      const input = clipped;
      clipped = [];
      for (let index = 0; index < input.length; index += 1) {
        const current = input[index];
        const previous = input[(index + input.length - 1) % input.length];
        const currentDistance = edgeDistance(current, edgeStart, edgeEnd);
        const previousDistance = edgeDistance(previous, edgeStart, edgeEnd);
        const currentInside = currentDistance >= -0.00001;
        const previousInside = previousDistance >= -0.00001;
        if (currentInside !== previousInside) {
          const t = previousDistance / (previousDistance - currentDistance);
          clipped.push(interpolateVertex(previous, current, t));
        }
        if (currentInside) clipped.push(current);
      }
    }

    for (let index = 1; index < clipped.length - 1; index += 1) {
      for (const vertex of [clipped[0], clipped[index], clipped[index + 1]]) {
        for (const [name, values] of vertex.attributes) outputValues.get(name)!.push(...values);
      }
    }
  }

  const output = new THREE.BufferGeometry();
  for (const [name, values] of outputValues) {
    const original = flat.getAttribute(name) as THREE.BufferAttribute;
    output.setAttribute(name, new THREE.Float32BufferAttribute(values, original.itemSize, original.normalized));
  }
  output.computeBoundingSphere();
  const patch = new THREE.Mesh(output, mesh.material);
  patch.castShadow = true;
  patch.receiveShadow = true;
  return patch;
}

function expandPolygon(polygon: readonly THREE.Vector2[], padding: number) {
  const signedArea = polygon.reduce((sum, point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0);
  const orientation = signedArea >= 0 ? 1 : -1;
  const cross = (left: THREE.Vector2, right: THREE.Vector2) =>
    left.x * right.y - left.y * right.x;

  return polygon.map((point, index) => {
    const previous = polygon[(index + polygon.length - 1) % polygon.length];
    const next = polygon[(index + 1) % polygon.length];
    const previousDirection = point.clone().sub(previous);
    const nextDirection = next.clone().sub(point);
    const previousNormal = new THREE.Vector2(
      orientation * previousDirection.y,
      -orientation * previousDirection.x,
    ).normalize().multiplyScalar(padding);
    const nextNormal = new THREE.Vector2(
      orientation * nextDirection.y,
      -orientation * nextDirection.x,
    ).normalize().multiplyScalar(padding);
    const previousLinePoint = previous.clone().add(previousNormal);
    const nextLinePoint = point.clone().add(nextNormal);
    const denominator = cross(previousDirection, nextDirection);
    if (Math.abs(denominator) < 0.00001) return point.clone().add(nextNormal);
    const distance = cross(
      nextLinePoint.clone().sub(previousLinePoint),
      nextDirection,
    ) / denominator;
    return previousLinePoint.add(previousDirection.multiplyScalar(distance));
  });
}

function cloneAudio(path: string, volume: number, loop = false) {
  const audio = new Audio(path);
  audio.volume = volume;
  audio.loop = loop;
  audio.preload = "auto";
  return audio;
}

export default function FourFields() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<{
    harvest: () => void;
    reset: () => void;
    start: () => void;
    setMuted: (muted: boolean) => void;
    dispose: () => void;
    continueStory: () => void;
    save: () => void;
  } | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const touchRef = useRef<Record<Direction, boolean>>({
    up: false, down: false, left: false, right: false,
  });
  const [phase, setPhase] = useState<Phase>("loading");
  const [plot, setPlot] = useState(0);
  const [harvested, setHarvested] = useState(0);
  const [muted, setMuted] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [initialProgress] = useState(() => loadProgress());
  const progressRef = useRef<Progress>(initialProgress.progress);
  const [readMemories, setReadMemories] = useState(initialProgress.progress.memories);
  const [bookOpen, setBookOpen] = useState(false);
  const [bookIndex, setBookIndex] = useState<number | null>(null);
  const bookOpenRef = useRef(false);
  const manualPauseRef = useRef(false);
  const [manualPaused, setManualPaused] = useState(false);
  const [saveNote, setSaveNote] = useState(initialProgress.warning);

  const flash = useCallback((message: string) => {
    setToast("");
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let ownedAssets: THREE.Object3D[] = [];
    let animationFrame = 0;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#98c86d");
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 150);
    const cameraOffset = new THREE.Vector3(0, 11.8, 8.8);
    const cameraTarget = new THREE.Vector3();
    const cameraLook = new THREE.Vector3();
    const cameraForward = new THREE.Vector3();
    const cameraRight = new THREE.Vector3();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      setError("Chưa mở được đồ họa 3D. Hãy thử Chrome/Edge và bật tăng tốc đồ họa.");
      setPhase("error");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff3d1, 0x567346, 2.35));
    const sun = new THREE.DirectionalLight(0xffe3b0, 3.1);
    sun.position.set(-12, 24, -8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -34;
    sun.shadow.camera.right = 34;
    sun.shadow.camera.top = 34;
    sun.shadow.camera.bottom = -34;
    sun.shadow.bias = -0.00005;
    sun.shadow.normalBias = 0.035;
    scene.add(sun);

    const loader = new GLTFLoader();
    const timer = new THREE.Timer();
    timer.connect(document);
    const farmerRoot = new THREE.Group();
    farmerRoot.position.copy(farmSurfacePoint(1, 11.4));
    scene.add(farmerRoot);
    camera.position.copy(farmerRoot.position).add(cameraOffset);
    camera.lookAt(farmerRoot.position.x, farmerRoot.position.y + 0.9, farmerRoot.position.z);

    let mixer: THREE.AnimationMixer | null = null;
    const actions = new Map<string, THREE.AnimationAction>();
    let currentAction = "";
    let activePlot = 0;
    let gamePhase: Phase = "loading";
    let harvestCooldown = 0;
    let harvestLock = 0;
    let pendingPlotCompletion = false;
    let transitionScale = 1;
    let scytheMount: THREE.Group | null = null;
    let scytheHand: THREE.Object3D | null = null;
    const scytheCarryQuaternion = new THREE.Quaternion();
    const scytheHandWorldQuaternion = new THREE.Quaternion();
    const scytheCarryWorldQuaternion = new THREE.Quaternion();
    const scytheCarryWorldEuler = new THREE.Euler();
    const scytheWorkingQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, Math.PI * 0.08, 0),
    );
    const maturePlants: THREE.Mesh[][] = [[], [], [], []];
    const sproutPlants: THREE.Mesh[][] = [[], [], [], []];
    const harvestedFlags: boolean[][] = Array.from({ length: 4 }, () => Array(12).fill(false));
    const animalData = [
      { anchor: farmSurfacePoint(-12, 0), rotation: 0.65 },
      { anchor: farmSurfacePoint(5.3, 4.2), rotation: -0.8 },
      { anchor: farmSurfacePoint(-11.5, 6.3), rotation: 1.15 },
      { anchor: farmSurfacePoint(12.5, -4.3), rotation: -1.7 },
    ];

    const audio = {
      music: cloneAudio(FOUR_FIELDS_ASSETS.audio.music, 0.16, true),
      ambience: cloneAudio(FOUR_FIELDS_ASSETS.audio.ambience, 0.1, true),
      harvest: cloneAudio(FOUR_FIELDS_ASSETS.audio.harvest, 0.92),
      complete: cloneAudio(FOUR_FIELDS_ASSETS.audio.complete, 0.64),
      growth: cloneAudio(FOUR_FIELDS_ASSETS.audio.growth, 0.55),
      warning: cloneAudio(FOUR_FIELDS_ASSETS.audio.warning, 0.5),
      timeout: cloneAudio(FOUR_FIELDS_ASSETS.audio.timeout, 0.65),
      victory: cloneAudio(FOUR_FIELDS_ASSETS.audio.victory, 0.7),
      click: cloneAudio(FOUR_FIELDS_ASSETS.audio.click, 0.5),
    };
    let isMuted = false;
    let assetsReady = false;
    let autoSaveElapsed = 0;
    const duyen = human("duyen");
    duyen.scale.setScalar(1.08);
    farmerRoot.add(duyen);
    const khim = human("khim");
    khim.position.copy(farmSurfacePoint(-10.5, 3.8));
    khim.rotation.y = 0.65;
    scene.add(khim);
    const familyCats = [cat("mochi"), cat("mon"), cat("may")];
    familyCats.forEach((model, index) => {
      model.scale.setScalar(1.5);
      model.position.copy(farmSurfacePoint(-9 + index * 1.5, 4.6));
      scene.add(model);
    });
    const persist = () => {
      if (!assetsReady || disposed) return;
      progressRef.current.activePlot = activePlot;
      progressRef.current.harvested = harvestedFlags.map(row => [...row]);
      progressRef.current.position = { x: farmerRoot.position.x, z: farmerRoot.position.z };
      if (initialProgress.protected) return;
      const ok = saveProgress(progressRef.current);
      if (!disposed) setSaveNote(ok ? "" : "Trình duyệt chưa lưu được tiến trình. Bấm Tải bản lưu trước khi đóng trang.");
    };

    const play = (name: keyof typeof audio, restart = true) => {
      if (isMuted) return;
      const sound = audio[name];
      if (restart) {
        sound.pause();
        sound.currentTime = 0;
      }
      void sound.play().catch(() => undefined);
    };

    const playAction = (name: string, fade = 0.18) => {
      if (currentAction === name) return;
      const next = actions.get(name);
      if (!next) { currentAction = name; return; }
      const previous = actions.get(currentAction);
      previous?.fadeOut(fade);
      next.reset().fadeIn(fade).play();
      currentAction = name;
    };

    const setPlantState = (plotIndex: number, mode: "empty" | "sprout" | "mature") => {
      sproutPlants[plotIndex].forEach((plant) => { plant.visible = mode === "sprout"; });
      maturePlants[plotIndex].forEach((plant, index) => {
        plant.visible = mode === "mature" && !harvestedFlags[plotIndex][index];
        if (mode === "mature") plant.scale.setScalar(plant.userData.baseScale * transitionScale);
      });
    };

    const reset = () => {
      for (let p = 0; p < 4; p += 1) harvestedFlags[p].fill(false);
      activePlot = 0;
      harvestCooldown = 0;
      harvestLock = 0;
      pendingPlotCompletion = false;
      transitionScale = 1;
      gamePhase = "intro";
      farmerRoot.position.copy(farmSurfacePoint(1, 11.4));
      farmerRoot.rotation.y = 0;
      camera.position.copy(farmerRoot.position).add(cameraOffset);
      camera.lookAt(farmerRoot.position.x, farmerRoot.position.y + 0.9, farmerRoot.position.z);
      setPlantState(0, "mature");
      setPlantState(1, "sprout");
      setPlantState(2, "empty");
      setPlantState(3, "empty");
      setPlot(0);
      setHarvested(0);
      setPhase("intro");
      playAction("idle", 0.12);
    };

    const beginPlot = (index: number) => {
      activePlot = index;
      harvestedFlags[index].fill(false);
      transitionScale = 0.04;
      setPlantState(index, "mature");
      setPlot(index);
      setHarvested(0);
      gamePhase = "transition";
      setPhase("transition");
      play("growth");
      flash(`${PLOTS[index].name} đã sẵn sàng. Mình thong thả thu hoạch nhé.`);
      persist();
    };

    const advancePlot = () => {
      play("complete");
      if (activePlot === 3) {
        gamePhase = "victory";
        setPhase("victory");
        play("victory");
        playAction("victory", 0.2);
        return;
      }
      const next = activePlot + 1;
      if (next + 1 < 4) setPlantState(next + 1, "sprout");
      beginPlot(next);
    };

    const finishPlot = () => {
      persist();
      if (progressRef.current.memories.includes(MEMORIES[activePlot].id)) { advancePlot(); return; }
      gamePhase = "memory";
      setPhase("memory");
      playAction("idle");
      play("complete");
      audio.music.pause();
      audio.ambience.pause();
    };

    const continueStory = () => {
      if (gamePhase !== "memory") return;
      const wasFinalPlot = activePlot === 3;
      completeMemory(progressRef.current, activePlot);
      setReadMemories([...progressRef.current.memories]);
      persist();
      advancePlot();
      if (!wasFinalPlot && !isMuted) {
        void audio.music.play().catch(() => undefined);
        void audio.ambience.play().catch(() => undefined);
      }
    };

    const tryHarvest = () => {
      if (gamePhase !== "playing" || harvestCooldown > 0 || document.hidden || manualPauseRef.current || bookOpenRef.current) return;
      let nearest = -1;
      let nearestDistance = 3.45;
      maturePlants[activePlot].forEach((plant, index) => {
        if (harvestedFlags[activePlot][index]) return;
        const distance = farmerRoot.position.distanceTo(plant.position);
        if (distance < nearestDistance) {
          nearest = index;
          nearestDistance = distance;
        }
      });
      if (nearest < 0) return;
      harvestedFlags[activePlot][nearest] = true;
      maturePlants[activePlot][nearest].visible = false;
      const count = harvestedFlags[activePlot].filter(Boolean).length;
      setHarvested(count);
      persist();
      play("harvest");
      harvestCooldown = SINGLE_REAP_SECONDS + 0.08;
      harvestLock = SINGLE_REAP_SECONDS;
      playAction("reap", 0.18);
      if (count === 12) {
        pendingPlotCompletion = true;
        gamePhase = "transition";
        setPhase("transition");
      }
    };

    const start = () => {
      if (gamePhase !== "intro") return;
      if (harvestedFlags[activePlot].every(Boolean)) { finishPlot(); return; }
      gamePhase = "playing";
      setPhase("playing");
      play("click");
      if (!isMuted) {
        void audio.music.play().catch(() => undefined);
        void audio.ambience.play().catch(() => undefined);
      }
      flash(`Duyên ơi, thu hoạch ${PLOTS[activePlot].name.toLowerCase()} rồi mình mở một trang kỷ niệm nhé.`);
    };

    const collide = (next: THREE.Vector3) => {
      next.x = clamp(next.x, -12.5 * FARM_XZ_EXPANSION, 12.5 * FARM_XZ_EXPANSION);
      next.z = clamp(next.z, -12.4 * FARM_XZ_EXPANSION, 10.2 * FARM_XZ_EXPANSION);
      const buildings = [
        new THREE.Box2(
          new THREE.Vector2(-10.8 * FARM_XZ_EXPANSION, -8.5 * FARM_XZ_EXPANSION),
          new THREE.Vector2(-4.7 * FARM_XZ_EXPANSION, -2.3 * FARM_XZ_EXPANSION),
        ),
        new THREE.Box2(
          new THREE.Vector2(0.7 * FARM_XZ_EXPANSION, -9.3 * FARM_XZ_EXPANSION),
          new THREE.Vector2(7.8 * FARM_XZ_EXPANSION, -3.7 * FARM_XZ_EXPANSION),
        ),
      ];
      for (const box of buildings) {
        if (box.containsPoint(new THREE.Vector2(next.x, next.z))) return false;
      }
      return true;
    };

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height, false);
      const aspect = width / Math.max(height, 1);
      camera.aspect = aspect;
      camera.fov = aspect < 0.78 ? 52 : 46;
      camera.updateProjectionMatrix();
    };

    const load = async () => {
      try {
        const [
          worldGltf, sproutsGltf, matureGltf, cornGltf,
          catGltf, dogGltf, chickenGltf, farmerGltf, scytheGltf,
          idleGltf, walkGltf, reapGltf, victoryGltf,
        ] = await Promise.all([
          loadGltf(loader, FOUR_FIELDS_ASSETS.world),
          loadGltf(loader, FOUR_FIELDS_ASSETS.crops.sprouts),
          loadGltf(loader, FOUR_FIELDS_ASSETS.crops.matureTrio),
          loadGltf(loader, FOUR_FIELDS_ASSETS.crops.corn),
          loadGltf(loader, FOUR_FIELDS_ASSETS.animals.cat),
          loadGltf(loader, FOUR_FIELDS_ASSETS.animals.dog),
          loadGltf(loader, FOUR_FIELDS_ASSETS.animals.chicken),
          loadGltf(loader, FOUR_FIELDS_ASSETS.farmer.rig),
          loadGltf(loader, FOUR_FIELDS_ASSETS.farmer.scythe),
          loadGltf(loader, FOUR_FIELDS_ASSETS.farmer.idle),
          loadGltf(loader, FOUR_FIELDS_ASSETS.farmer.walk),
          loadGltf(loader, FOUR_FIELDS_ASSETS.farmer.reap),
          loadGltf(loader, FOUR_FIELDS_ASSETS.farmer.victory),
        ]);
        ownedAssets = [worldGltf, sproutsGltf, matureGltf, cornGltf, catGltf, dogGltf, chickenGltf, farmerGltf, scytheGltf, idleGltf, walkGltf, reapGltf, victoryGltf].map(gltf => gltf.scene);
        if (disposed) { disposeResources(ownedAssets); return; }

        const world = worldGltf.scene;
        prepareMintFarmstead(world);
        world.scale.set(WORLD_XZ_SCALE, WORLD_Y_SCALE, WORLD_XZ_SCALE);
        world.updateMatrixWorld(true);
        const worldBox = new THREE.Box3().setFromObject(world);
        world.position.y -= worldBox.min.y;
        world.updateMatrixWorld(true);
        world.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            mesh.castShadow = false;
            mesh.receiveShadow = true;
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const material of materials) {
              const textured = material as THREE.MeshStandardMaterial;
              for (const texture of [
                textured.map,
                textured.normalMap,
                textured.roughnessMap,
                textured.metalnessMap,
                textured.aoMap,
              ]) {
                if (!texture) continue;
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                texture.needsUpdate = true;
              }
            }
          }
        });
        scene.add(world);

        const fourthPlot = extractMintPlotPatch(
          world,
          expandPolygon([
            new THREE.Vector2(-7.35, 3.46),
            new THREE.Vector2(1.73, 5.91),
            new THREE.Vector2(-0.14, 12.47),
            new THREE.Vector2(-8.94, 10.02),
          ], 0.85),
        );
        if (fourthPlot) {
          fourthPlot.geometry.translate(3.6, 0.055, -8);
          fourthPlot.scale.set(0.82, 1, 0.82);
          fourthPlot.position.set(0, 0, -3);
          fourthPlot.castShadow = false;
          scene.add(fourthPlot);
        }

        const sproutSources = extractFamily(sproutsGltf.scene, 4);
        const matureSources = extractFamily(matureGltf.scene, 3);
        let cornMesh: THREE.Mesh | null = null;
        cornGltf.scene.traverse((node) => {
          if ((node as THREE.Mesh).isMesh && !cornMesh) cornMesh = node as THREE.Mesh;
        });
        if (!cornMesh) throw new Error("Mint corn model contains no mesh.");
        const corn = cornMesh as THREE.Mesh;
        const cornGeometry = corn.geometry.clone();
        cornGeometry.applyMatrix4(corn.matrixWorld);
        cornGeometry.computeBoundingBox();
        const cornBox = cornGeometry.boundingBox!;
        const cornCenter = cornBox.getCenter(new THREE.Vector3());
        cornGeometry.translate(-cornCenter.x, -cornBox.min.y, -cornCenter.z);
        const cornSource = new THREE.Mesh(cornGeometry, corn.material);
        const matureSourcesAll = [cornSource, ...matureSources];

        PLOTS.forEach((plotConfig, plotIndex) => {
          PLANT_OFFSETS.forEach(([x, z], plantIndex) => {
            const maturePosition = plotConfig.center.clone().add(
              new THREE.Vector3(x * plotConfig.spread, 0, z * plotConfig.spread),
            );
            const mature = createPlant(matureSourcesAll[plotIndex], plotConfig.height, maturePosition);
            mature.rotation.y = ((plantIndex % 4) - 1.5) * 0.13;
            mature.userData.baseScale = mature.scale.x;
            scene.add(mature);
            maturePlants[plotIndex].push(mature);

            const sproutPosition = plotConfig.center.clone().add(
              new THREE.Vector3(x * plotConfig.spread, 0, z * plotConfig.spread),
            );
            const sprout = createPlant(sproutSources[plotIndex], Math.min(plotConfig.height * 0.52, 0.9), sproutPosition);
            sprout.rotation.y = mature.rotation.y;
            scene.add(sprout);
            sproutPlants[plotIndex].push(sprout);
          });
        });

        const farmer = groundAndScale(farmerGltf.scene, 1.9);
        farmer.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            (node as THREE.Mesh).castShadow = true;
            (node as THREE.Mesh).receiveShadow = true;
          }
        });
        // Keep the upstream rig and animations as an anonymous fictional farm neighbour.
        // Duyên is the playable avatar, built from the author's appearance reference.
        farmer.position.add(farmSurfacePoint(-12.5, 8));
        scene.add(farmer);
        farmerRoot.updateMatrixWorld(true);
        const rightHand = farmer.getObjectByName("RightHand");
        if (!rightHand) throw new Error("Mint farmer rig is missing its right-hand attachment bone.");
        const handWorldScale = rightHand.getWorldScale(new THREE.Vector3());
        const scythe = groundAndScale(
          scytheGltf.scene,
          1.72 / Math.max(Math.abs(handWorldScale.y), 0.0001),
        );
        scythe.position.y -= 0.2 / Math.max(Math.abs(handWorldScale.y), 0.0001);
        scythe.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            (node as THREE.Mesh).castShadow = true;
            (node as THREE.Mesh).receiveShadow = true;
          }
        });
        scytheMount = new THREE.Group();
        scytheHand = rightHand;
        scytheMount.add(scythe);
        rightHand.add(scytheMount);
        mixer = new THREE.AnimationMixer(farmer);
        const fullReapClip = reapGltf.animations[0];
        const singleReapClip = fullReapClip
          ? THREE.AnimationUtils.subclip(
              fullReapClip,
              "Farmer single reap",
              SINGLE_REAP_START_FRAME,
              SINGLE_REAP_END_FRAME,
              SINGLE_REAP_FPS,
            )
          : undefined;
        const clips = [
          ["idle", idleGltf.animations[0]],
          ["walk", walkGltf.animations[0]],
          ["reap", singleReapClip],
          ["victory", victoryGltf.animations[0]],
        ] as const;
        for (const [name, clip] of clips) {
          if (!clip) continue;
          const action = mixer.clipAction(clip);
          if (name === "reap" || name === "victory") {
            action.setLoop(name === "victory" ? THREE.LoopRepeat : THREE.LoopOnce, name === "victory" ? Infinity : 1);
            action.clampWhenFinished = true;
          }
          action.timeScale = name === "reap" ? SINGLE_REAP_TIME_SCALE : name === "walk" ? 1.45 : 1;
          actions.set(name, action);
        }
        playAction("idle", 0);

        const animalModels = [catGltf.scene, dogGltf.scene, chickenGltf.scene, chickenGltf.scene.clone(true)];
        const heights = [0.68, 0.9, 0.62, 0.58];
        animalModels.forEach((model, index) => {
          const root = new THREE.Group();
          const visual = groundAndScale(model, heights[index]);
          visual.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) (node as THREE.Mesh).castShadow = true;
          });
          root.add(visual);
          root.position.copy(animalData[index].anchor);
          root.rotation.y = animalData[index].rotation;
          scene.add(root);
        });

        reset();
        const saved = progressRef.current;
        for (let index = 0; index < 4; index++) harvestedFlags[index] = [...saved.harvested[index]];
        activePlot = saved.activePlot;
        setPlot(activePlot);
        setHarvested(harvestedFlags[activePlot].filter(Boolean).length);
        for (let index = 0; index < 4; index++) setPlantState(index, index <= activePlot ? "mature" : index === activePlot + 1 ? "sprout" : "empty");
        farmerRoot.position.copy(farmSurfacePoint(saved.position.x, saved.position.z));
        camera.position.copy(farmerRoot.position).add(cameraOffset);
        assetsReady = true;

      } catch (reason) {
        console.error("Không tải được nông trại Four Fields", reason);
        const message = reason instanceof Error ? reason.message : "Chưa tải được nông trại. Kiểm tra kết nối mạng rồi thử lại.";
        if (disposed) return;
        setError(message);
        setPhase("error");
        gamePhase = "error";
      }
    };

    const tick = () => {
      animationFrame = requestAnimationFrame(tick);
      timer.update();
      const paused = document.hidden || manualPauseRef.current || bookOpenRef.current || gamePhase === "memory";
      const dt = paused ? 0 : Math.min(timer.getDelta(), 0.05);
      harvestCooldown = Math.max(0, harvestCooldown - dt);
      harvestLock = Math.max(0, harvestLock - dt);

      const inputRight = Number(keysRef.current.KeyD || keysRef.current.ArrowRight || touchRef.current.right) -
        Number(keysRef.current.KeyA || keysRef.current.ArrowLeft || touchRef.current.left);
      const inputForward = Number(keysRef.current.KeyW || keysRef.current.ArrowUp || touchRef.current.up) -
        Number(keysRef.current.KeyS || keysRef.current.ArrowDown || touchRef.current.down);
      camera.getWorldDirection(cameraForward);
      cameraForward.y = 0;
      cameraForward.normalize();
      cameraRight.crossVectors(cameraForward, THREE.Object3D.DEFAULT_UP).normalize();
      const move = new THREE.Vector3()
        .addScaledVector(cameraRight, inputRight)
        .addScaledVector(cameraForward, inputForward);
      const wantsToMove = move.lengthSq() > 0.01 && gamePhase === "playing" && !paused;
      const moving = wantsToMove && harvestLock <= 0;
      if (moving) {
        move.normalize();
        const next = farmerRoot.position.clone().addScaledVector(move, 6.4 * dt);
        if (collide(next)) farmerRoot.position.copy(next);
        farmerRoot.rotation.y = Math.atan2(move.x, move.z);
        playAction("walk");
      } else if (gamePhase === "playing" && currentAction !== "reap") {
        playAction("idle");
      }

      if (currentAction === "reap" && harvestLock <= 0 && gamePhase === "playing") {
        playAction(wantsToMove ? "walk" : "idle", 0.18);
      }
      if (pendingPlotCompletion && harvestLock <= 0 && !paused) {
        pendingPlotCompletion = false;
        finishPlot();
      }

      // Personal gift mode: no countdown, timeout or punishment for taking a break.
      if (gamePhase === "playing" && dt > 0) {
        autoSaveElapsed += dt;
        if (autoSaveElapsed >= 5) { autoSaveElapsed = 0; persist(); }
      }

      if (gamePhase === "transition" && transitionScale < 1) {
        transitionScale = Math.min(1, transitionScale + dt * 1.35);
        const eased = 1 - Math.pow(1 - transitionScale, 3);
        maturePlants[activePlot].forEach((plant) => plant.scale.setScalar(plant.userData.baseScale * eased));
        if (transitionScale >= 1) { gamePhase = "playing"; setPhase("playing"); }
      }

      for (const [name, sign] of [["leftLeg", 1], ["rightLeg", -1], ["leftArm", -1], ["rightArm", 1]] as const) {
        const limb = duyen.getObjectByName(name);
        if (limb) limb.rotation.x = moving ? Math.sin(timer.getElapsed() * 11) * 0.45 * sign : currentAction === "reap" && name.includes("Arm") ? -0.8 + Math.sin(harvestLock * 15) * 0.2 : 0;
      }
      const mochi = familyCats[0];
      const catDelta = farmerRoot.position.clone().sub(mochi.position); catDelta.y = 0;
      if (dt > 0 && catDelta.length() > 2.2) {
        const next = mochi.position.clone().addScaledVector(catDelta.normalize(), dt * 3.6);
        if (collide(next)) mochi.position.copy(next);
        mochi.rotation.y = Math.atan2(catDelta.x, catDelta.z);
      }

      cameraTarget.copy(farmerRoot.position).add(cameraOffset);
      camera.position.lerp(cameraTarget, 1 - Math.pow(0.0012, dt));
      cameraLook.copy(farmerRoot.position)
        .add(new THREE.Vector3(0, 0.9, 0));
      camera.lookAt(cameraLook);

      mixer?.update(dt);
      if (scytheMount && scytheHand) {
        let target = scytheWorkingQuaternion;
        if (currentAction !== "reap") {
          scytheHand.getWorldQuaternion(scytheHandWorldQuaternion);
          scytheCarryWorldEuler.set(0, farmerRoot.rotation.y + Math.PI * 0.08, 0);
          scytheCarryWorldQuaternion.setFromEuler(scytheCarryWorldEuler);
          scytheCarryQuaternion.copy(scytheHandWorldQuaternion).invert().multiply(scytheCarryWorldQuaternion);
          target = scytheCarryQuaternion;
        }
        const response = currentAction === "reap" ? 18 : 11;
        scytheMount.quaternion.slerp(target, 1 - Math.exp(-response * dt));
      }
      renderer.render(scene, camera);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.closest("button,input,[role='dialog']") || manualPauseRef.current || bookOpenRef.current) return;
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
      keysRef.current[event.code] = true;
      if ((event.code === "Enter" || event.code === "Space") && (gamePhase === "intro")) start();
      else if (event.code === "Space" && gamePhase === "playing" && !event.repeat) tryHarvest();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.code] = false;
    };
    const clearInput = () => {
      keysRef.current = {};
    touchRef.current = { up: false, down: false, left: false, right: false };
      for (const direction of ["up", "down", "left", "right"] as Direction[]) touchRef.current[direction] = false;
    };
    const onVisibility = () => {
      clearInput();
      if (document.hidden) { persist(); audio.music.pause(); audio.ambience.pause(); }
    };
    window.addEventListener("blur", clearInput);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", persist);
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", resize);
    resize();
    tick();
    void load();

    engineRef.current = {
      harvest: tryHarvest,
      continueStory,
      save: persist,
      reset,
      start,
      setMuted(nextMuted) {
        isMuted = nextMuted;
        Object.values(audio).forEach((sound) => { sound.muted = nextMuted; });
        if (!nextMuted && gamePhase === "playing") {
          void audio.music.play().catch(() => undefined);
          void audio.ambience.play().catch(() => undefined);
        }
      },
      dispose() {
        disposed = true;
      },
    };

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("blur", clearInput);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", persist);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", resize);
      Object.values(audio).forEach((sound) => {
        sound.pause();
        sound.src = "";
      });
      timer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      disposeResources([scene, ...ownedAssets]);
      engineRef.current = null;
    };
  }, [flash]);

  const press = (direction: Direction, active: boolean) => {
    touchRef.current[direction] = active;
  };

  const begin = () => engineRef.current?.start();
  const toggleMute = () => {
    setMuted((current) => {
      engineRef.current?.setMuted(!current);
      return !current;
    });
  };

  const openBook = () => {
    engineRef.current?.save();
    keysRef.current = {};
    touchRef.current = { up: false, down: false, left: false, right: false };
    bookOpenRef.current = true; setBookOpen(true); setBookIndex(null);
  };
  const closeBook = () => { bookOpenRef.current = false; setBookOpen(false); };
  const togglePause = () => {
    manualPauseRef.current = !manualPauseRef.current;
    keysRef.current = {};
    touchRef.current = { up: false, down: false, left: false, right: false };
    setManualPaused(manualPauseRef.current);
    engineRef.current?.save();
  };
  const exportSave = () => {
    engineRef.current?.save();
    let text: string;
    try { text = initialProgress.protected ? browserStorage()?.getItem(PERSONAL_SAVE_KEY) ?? JSON.stringify(progressRef.current) : JSON.stringify(progressRef.current); }
    catch { text = JSON.stringify(progressRef.current); }
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "duyen-four-fields-save.json"; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const memory = phase === "memory" ? MEMORIES[plot] : bookIndex !== null ? MEMORIES[bookIndex] : null;
  const active = phase === "playing" || phase === "transition";

  return (
    <main className="four-fields" aria-label="Nông trại của Duyên">
      <div ref={mountRef} className="ff-stage" aria-hidden="true" />
      {phase !== "loading" && phase !== "error" && <div className="ff-hud">
        <ol className="ff-progress" aria-label="Tiến độ bốn luống">
          {PLOTS.map((item, index) => <li key={item.name} className={readMemories.includes(MEMORIES[index].id) ? "done" : index === plot ? "active" : ""}
            aria-label={`${item.name}: ${readMemories.includes(MEMORIES[index].id) ? "hoàn thành" : index === plot ? "đang thu hoạch" : "chưa mở"}`}>
            {readMemories.includes(MEMORIES[index].id) ? "✓" : item.icon}
          </li>)}
        </ol>
        <div className="ff-objective"><small>Luống {plot + 1} / 4 · Không giới hạn thời gian</small>
          <strong>{PLOTS[plot].name}: {harvested} / 12</strong>
          <div className="ff-meter" aria-hidden="true"><i style={{ width: `${harvested / 12 * 100}%` }} /></div>
        </div>
        <div className="df-toolbar">
          <button onClick={openBook}>📖 Sổ chuyện {readMemories.length}/4</button>
          {active && <button onClick={togglePause}>{manualPaused ? "▶ Tiếp tục" : "Ⅱ Tạm dừng"}</button>}
          <button onClick={exportSave}>Tải bản lưu</button>
          <button onClick={toggleMute} aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}>{muted ? "🔇" : "🔊"}</button>
        </div>
        <span className="ff-controls-note">WASD / phím mũi tên: di chuyển · Space: thu hoạch</span>
      </div>}
      {toast && active && !manualPaused && !bookOpen && <div className="ff-toast" role="status">{toast}</div>}
      {saveNote && <p className="df-save-note" role="status">{saveNote}</p>}
      {phase === "loading" && <div className="ff-loading"><div className="ff-loading-card">
        <p className="ff-eyebrow">Một khu vườn dành cho hai đứa</p><h2>Nông trại của Duyên</h2>
        <p>Đang tải nông trại, cây và các bạn nhỏ… Lần đầu cần kết nối mạng.</p><div className="ff-loader" />
      </div></div>}
      {phase === "intro" && !bookOpen && <div className="ff-overlay"><div className="ff-card">
        <p className="ff-eyebrow">Duyên & Khim · dựa trên Four Fields</p><h1>Nông trại của Duyên</h1>
        <p>Đóng vai Duyên, thu hoạch bốn luống và mở bốn trang chuyện của hai bạn. Mochi sẽ đi cùng. Mình cứ thong thả nhé.</p>
        <p>WASD / phím mũi tên để đi · Space hoặc nút Thu hoạch khi đứng gần cây.</p>
        <button className="ff-button" onClick={begin}>{readMemories.length || initialProgress.progress.harvested.some(row => row.some(Boolean)) ? "Tiếp tục khu vườn" : "Vào khu vườn"}</button>
        <small className="df-credit">Mã nguồn Four Fields: Lucas Ochs-Messick · MIT</small>
      </div></div>}
      {manualPaused && active && !bookOpen && <div className="ff-overlay"><div className="ff-card">
        <h2>Nghỉ một chút nhé</h2><p>Khu vườn đang nghỉ. Bạn có thể tiếp tục bất cứ lúc nào.</p>
        <button className="ff-button" onClick={togglePause}>Tiếp tục</button>
      </div></div>}
      {(phase === "memory" || bookOpen) && <div className="ff-overlay"><div className="ff-card df-book" role="dialog" aria-modal="true" aria-label="Sổ chuyện của Duyên và Khim">
        {memory ? <><p className="ff-eyebrow">{memory.caption}</p><h2>{memory.icon} {memory.title}</h2>
          {memory.paragraphs.map(paragraph => <p key={paragraph} className={paragraph.startsWith("[TODO:") ? "df-todo" : ""}>{paragraph}</p>)}
          {phase === "memory" ? <button className="ff-button" onClick={() => engineRef.current?.continueStory()}>{plot === 3 ? "Giữ ước mơ này" : "Sang luống tiếp theo"}</button>
            : <button className="ff-button" onClick={() => setBookIndex(null)}>Về sổ chuyện</button>}
        </> : <><p className="ff-eyebrow">Chuyện của hai đứa</p><h2>Những điều mình giữ lại</h2>
          {MEMORIES.map((page, index) => <button className="df-page" key={page.id} disabled={!readMemories.includes(page.id)} onClick={() => setBookIndex(index)}>
            {page.icon} {page.title}<small>{readMemories.includes(page.id) ? "Mở trang chuyện" : `Thu hoạch xong luống ${index + 1} để mở`}</small>
          </button>)}<button className="ff-button" onClick={closeBook}>Về khu vườn</button>
        </>}
      </div></div>}
      {phase === "victory" && !bookOpen && <div className="ff-overlay"><div className="ff-card">
        <p className="ff-eyebrow">Bốn luống đầy · bốn trang chuyện</p><h2>Đủ chỗ cho yêu thương 🏡</h2>
        <p>Một khu vườn nhỏ, dành cho Duyên, Khim và ước mơ cùng đón ba mẹ về nhà.</p>
        <button className="ff-button" onClick={openBook}>Đọc lại chuyện của hai đứa</button>
      </div></div>}
      {phase === "error" && <div className="ff-overlay"><div className="ff-card">
        <h2>Chưa mở được khu vườn</h2><p>Kiểm tra kết nối mạng và khả năng hỗ trợ WebGL của trình duyệt.</p><p>{error}</p>
        <button className="ff-button" onClick={() => window.location.reload()}>Thử tải lại</button>
      </div></div>}
      {phase === "playing" && !manualPaused && !bookOpen && <>
        <button className="df-desktop-harvest" onClick={() => engineRef.current?.harvest()}>🌾 Thu hoạch · Space</button>
        <div className="ff-touch" aria-label="Điều khiển cảm ứng">
          <div className="ff-pad">{(["up", "down", "left", "right"] as Direction[]).map(direction => <button key={direction} className={direction}
            aria-label={`Đi ${ { up: "lên", down: "xuống", left: "trái", right: "phải" }[direction]}`}
            onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); press(direction, true); }}
            onPointerUp={() => press(direction, false)} onPointerCancel={() => press(direction, false)} onLostPointerCapture={() => press(direction, false)}>
            {{ up: "▲", down: "▼", left: "◀", right: "▶" }[direction]}</button>)}</div>
          <button className="ff-harvest" onClick={() => engineRef.current?.harvest()}>Thu hoạch</button>
        </div>
      </>}
    </main>
  );
}
