import * as THREE from 'three';
import { GameSimulation } from '../systems/GameSimulation';
import { ToolType, CropType } from '../core/types';
import {
  GRID_SIZE,
  CELL_SIZE,
  FARM_ORIGIN_OFFSET,
  PALETTE,
  BUILDING_FOOTPRINTS,
  DEFAULT_FARM_PLOTS,
  DAY_DURATION_SECONDS,
} from '../core/constants';
import { FarmGrid } from './grid';
import { PathFinder } from './pathfinding';
import {
  createDuyenModel,
  createKhimModel,
  createCatModel,
  createMayGiftBox,
  createVillagerModel,
  createMailboxModel,
  createClueModel,
  createSalonChairModel,
} from '../models/characterModels';
import {
  createHouseModel,
  createBarnModel,
  createMarketModel,
  createTreeModel,
  createFenceUnit,
  createWindmillModel,
  createBakeryModel,
  createJuicePressModel,
  createGazeboModel,
  createLanternModel,
  createScaffoldingModel,
  createSalonBuildingModel,
  createBookCafeModel,
} from '../models/buildingModels';
import { createPlotTileModel, createCropMesh } from '../models/cropModels';
import { PlacedBuildingType, BUILDING_DEFINITIONS } from '../core/buildings';
import { VILLAGERS } from '../content/villagers';
import { SEASONS_DATA } from '../content/seasons';

export class FarmScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  public sim: GameSimulation;
  private pathFinder: PathFinder;

  // Scene Objects
  private islandGroup: THREE.Group = new THREE.Group();
  private duyenGroup!: THREE.Group;
  private khimGroup!: THREE.Group;
  private catMochiGroup!: THREE.Group;
  private catMonGroup!: THREE.Group;
  private catMayGroup!: THREE.Group;
  private mayGiftBoxMesh: THREE.Group | null = null;
  private plotMeshes: Map<string, THREE.Group> = new Map();

  // Phase 2, 3 & 4 Scene Objects
  private customBuildingMeshes: Map<string, THREE.Group> = new Map();
  private villagerMeshes: Map<string, THREE.Group> = new Map();
  private mailboxMesh: THREE.Group | null = null;
  private salonChairMesh: THREE.Group | null = null;
  private clueCrumbsMesh: THREE.Group | null = null;
  private cluePawprintsMesh: THREE.Group | null = null;
  private weatherParticlesGroup: THREE.Group = new THREE.Group();
  private grassTileMeshes: THREE.Mesh[] = [];

  // Lighting
  private sunLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private ambientLight!: THREE.AmbientLight;

  // Camera Orbit & Zoom Controls
  private cameraDistance: number = 24;
  private cameraAngleY: number = -Math.PI / 4; // 45 deg isometric perspective
  private cameraPitch: number = Math.PI / 4.5; // ~40-45 deg downwards
  private isRightDragging: boolean = false;
  private lastMouseX: number = 0;

  // Movement & Interaction State
  private currentPath: Array<{ x: number; z: number }> = [];
  private currentWayPointIdx: number = 0;
  private playerWalkSpeed: number = 3.6; // Units per second
  private isWalking: boolean = false;
  private walkAnimTime: number = 0;
  private pendingInteraction: {
    type: string;
    targetPos: { x: number; z: number };
    gridX?: number;
    gridZ?: number;
    execute: () => void;
  } | null = null;

  // Selected Tool & Dialog Callback
  public selectedTool: ToolType = 'hand';
  public onOpenDialog?: (type: string, extra?: unknown) => void;

  // Blueprint Construction Mode State
  public blueprintActive: boolean = false;
  public blueprintBuildingType: PlacedBuildingType | null = null;
  public blueprintRotation: 0 | 90 | 180 | 270 = 0;
  private blueprintGhostGroup: THREE.Group = new THREE.Group();
  private blueprintGridOverlay: THREE.Group = new THREE.Group();
  private blueprintHoverGrid: { gx: number; gz: number } | null = null;

  // Animation Frame Loop
  private animFrameId: number = 0;
  private lastTimestamp: number = 0;
  private isDisposed: boolean = false;

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  // Keyboard
  private keysPressed: Record<string, boolean> = {};

  constructor(container: HTMLElement, simulation: GameSimulation) {
    this.container = container;
    this.sim = simulation;
    this.pathFinder = new PathFinder(this.sim.grid);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(PALETTE.waterBlue);

    // Camera (Diorama 45-degree angle)
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.updateCameraPosition();

    // Setup Lighting
    this.setupLighting();

    // Build Island World
    this.buildWorld();

    // Event Listeners
    this.setupListeners();

    // Start Rendering Loop
    this.lastTimestamp = performance.now();
    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  private setupLighting() {
    this.ambientLight = new THREE.AmbientLight(PALETTE.ambientSky, 0.6);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(PALETTE.ambientSky, PALETTE.ambientGround, 0.7);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(PALETTE.sunColor, 1.2);
    this.sunLight.position.set(15, 25, 12);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 60;
    const d = 16;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);
  }

  private buildWorld() {
    this.scene.add(this.islandGroup);

    // 1. Water Base
    const waterGeo = new THREE.PlaneGeometry(120, 120);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshLambertMaterial({ color: PALETTE.waterBlue });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = -0.4;
    waterMesh.receiveShadow = true;
    this.islandGroup.add(waterMesh);

    // 2. Island Base Sand / Bedrock
    const islandTotalSize = GRID_SIZE * CELL_SIZE;
    const islandGeo = new THREE.BoxGeometry(islandTotalSize + 1.2, 0.8, islandTotalSize + 1.2);
    const islandMat = new THREE.MeshLambertMaterial({ color: PALETTE.sandEdge });
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.y = -0.4;
    islandMesh.receiveShadow = true;
    this.islandGroup.add(islandMesh);

    // 3. Top Lush Grass Tiles (12x12 grid)
    const grassGroup = new THREE.Group();
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const { x: wx, z: wz } = FarmGrid.gridToWorld(x, z);
        const tileColor = (x + z) % 2 === 0 ? PALETTE.grassLight : PALETTE.grassDark;
        const tileGeo = new THREE.BoxGeometry(CELL_SIZE - 0.04, 0.1, CELL_SIZE - 0.04);
        const tileMat = new THREE.MeshLambertMaterial({ color: tileColor });
        const tile = new THREE.Mesh(tileGeo, tileMat);
        tile.position.set(wx, 0.0, wz);
        tile.receiveShadow = true;
        tile.userData = { gridX: x, gridZ: z, isGround: true };
        grassGroup.add(tile);
        this.grassTileMeshes.push(tile);
      }
    }
    this.islandGroup.add(grassGroup);

    // 4. Default Farm Plots
    for (const plot of DEFAULT_FARM_PLOTS) {
      const plotGroup = createPlotTileModel();
      const { x: wx, z: wz } = FarmGrid.gridToWorld(plot.x, plot.z);
      plotGroup.position.set(wx, 0.05, wz);
      plotGroup.userData = { gridX: plot.x, gridZ: plot.z, isPlot: true };
      this.islandGroup.add(plotGroup);
      this.plotMeshes.set(`${plot.x},${plot.z}`, plotGroup);
    }

    // 5. Buildings
    // A. House
    const house = createHouseModel();
    const houseCenter = FarmGrid.gridToWorld(
      (BUILDING_FOOTPRINTS.house.minX + BUILDING_FOOTPRINTS.house.maxX) / 2,
      (BUILDING_FOOTPRINTS.house.minZ + BUILDING_FOOTPRINTS.house.maxZ) / 2
    );
    house.position.set(houseCenter.x, 0.05, houseCenter.z);
    house.userData = { buildingType: 'house' };
    this.islandGroup.add(house);

    // B. Barn
    const barn = createBarnModel();
    const barnCenter = FarmGrid.gridToWorld(
      (BUILDING_FOOTPRINTS.barn.minX + BUILDING_FOOTPRINTS.barn.maxX) / 2,
      (BUILDING_FOOTPRINTS.barn.minZ + BUILDING_FOOTPRINTS.barn.maxZ) / 2
    );
    barn.position.set(barnCenter.x, 0.05, barnCenter.z);
    barn.userData = { buildingType: 'barn' };
    this.islandGroup.add(barn);

    // C. Market Stand
    const market = createMarketModel();
    const marketCenter = FarmGrid.gridToWorld(
      (BUILDING_FOOTPRINTS.market.minX + BUILDING_FOOTPRINTS.market.maxX) / 2,
      (BUILDING_FOOTPRINTS.market.minZ + BUILDING_FOOTPRINTS.market.maxZ) / 2
    );
    market.position.set(marketCenter.x, 0.05, marketCenter.z);
    market.userData = { buildingType: 'market' };
    this.islandGroup.add(market);

    // D. Mailbox Prop (near house porch)
    this.mailboxMesh = createMailboxModel();
    const mbPos = FarmGrid.gridToWorld(1, 7);
    this.mailboxMesh.position.set(mbPos.x + 0.3, 0.05, mbPos.z);
    this.mailboxMesh.userData = { isMailbox: true };
    this.islandGroup.add(this.mailboxMesh);

    // E. Salon Chair Prop (outdoors on grass lawn)
    this.salonChairMesh = createSalonChairModel();
    const scPos = FarmGrid.gridToWorld(1, 3);
    this.salonChairMesh.position.set(scPos.x, 0.05, scPos.z);
    this.salonChairMesh.userData = { isSalonChair: true };
    this.islandGroup.add(this.salonChairMesh);

    // F. Mon Mystery Clues (crumbs & pawprints)
    this.clueCrumbsMesh = createClueModel('crumbs');
    const crumbsPos = FarmGrid.gridToWorld(2, 6);
    this.clueCrumbsMesh.position.set(crumbsPos.x + 0.2, 0.05, crumbsPos.z - 0.2);
    this.clueCrumbsMesh.userData = { isClueCrumbs: true };
    this.islandGroup.add(this.clueCrumbsMesh);

    this.cluePawprintsMesh = createClueModel('pawprints');
    const pawsPos = FarmGrid.gridToWorld(4, 6);
    this.cluePawprintsMesh.position.set(pawsPos.x, 0.05, pawsPos.z);
    this.cluePawprintsMesh.userData = { isCluePawprints: true };
    this.islandGroup.add(this.cluePawprintsMesh);

    // 6. Perimeter Wooden Fences
    for (let i = 0; i < GRID_SIZE; i += 2) {
      const f1 = createFenceUnit();
      const pos1 = FarmGrid.gridToWorld(i, GRID_SIZE - 1);
      f1.position.set(pos1.x, 0.05, pos1.z + CELL_SIZE / 2);
      this.islandGroup.add(f1);

      const f2 = createFenceUnit();
      f2.rotation.y = Math.PI / 2;
      const pos2 = FarmGrid.gridToWorld(0, i);
      f2.position.set(pos2.x - CELL_SIZE / 2, 0.05, pos2.z);
      this.islandGroup.add(f2);
    }

    // 7. Scenery Trees in corner areas
    const treeCoords = [
      { gx: 0, gz: 11 },
      { gx: 11, gz: 11 },
      { gx: 0, gz: 0 },
      { gx: 11, gz: 0 },
      { gx: 0, gz: 6 },
    ];
    treeCoords.forEach((tc, idx) => {
      const tree = createTreeModel(idx);
      const pos = FarmGrid.gridToWorld(tc.gx, tc.gz);
      tree.position.set(pos.x, 0.05, pos.z);
      this.islandGroup.add(tree);
    });

    // 8. Player Character: Duyên
    this.duyenGroup = createDuyenModel();
    const playerStart = FarmGrid.gridToWorld(4, 4);
    this.duyenGroup.position.set(playerStart.x, 0.05, playerStart.z);
    this.scene.add(this.duyenGroup);

    // 9. Supporting NPC: Khim
    this.khimGroup = createKhimModel();
    this.khimGroup.position.set(this.sim.state.khim.x, 0.05, this.sim.state.khim.z);
    this.scene.add(this.khimGroup);

    // 10. Cats: Mochi, Mon, Mây
    this.catMochiGroup = createCatModel('mochi');
    this.catMochiGroup.position.set(this.sim.state.cats.mochi.x, 0.05, this.sim.state.cats.mochi.z);
    this.scene.add(this.catMochiGroup);

    this.catMonGroup = createCatModel('mon');
    this.catMonGroup.position.set(this.sim.state.cats.mon.x, 0.05, this.sim.state.cats.mon.z);
    this.scene.add(this.catMonGroup);

    this.catMayGroup = createCatModel('may');
    this.catMayGroup.position.set(this.sim.state.cats.may.x, 0.05, this.sim.state.cats.may.z);
    this.scene.add(this.catMayGroup);

    // 11. Four Villagers
    for (const vId in VILLAGERS) {
      const vModel = createVillagerModel(vId);
      const vDef = VILLAGERS[vId];
      const startPos = vDef.schedule.morning;
      vModel.position.set(startPos.x, 0.05, startPos.z);
      vModel.userData = { isVillager: true, villagerId: vId };
      this.scene.add(vModel);
      this.villagerMeshes.set(vId, vModel);
    }

    // 12. Weather Particles Group
    this.scene.add(this.weatherParticlesGroup);
    this.initWeatherParticles();

    // 13. Blueprint Ghost & Grid Overlay
    this.scene.add(this.blueprintGhostGroup);
    this.scene.add(this.blueprintGridOverlay);
    this.initBlueprintGridOverlay();

    // Sync custom buildings and crops
    this.syncCrops();
    this.syncCustomBuildings();
  }

  private initBlueprintGridOverlay() {
    this.blueprintGridOverlay.visible = false;
    const gridLineGeo = new THREE.BufferGeometry();
    const points: number[] = [];
    const minW = -FARM_ORIGIN_OFFSET;
    const maxW = FARM_ORIGIN_OFFSET;

    for (let i = 0; i <= GRID_SIZE; i++) {
      const coord = i * CELL_SIZE - FARM_ORIGIN_OFFSET;
      // Along X
      points.push(coord, 0.08, minW, coord, 0.08, maxW);
      // Along Z
      points.push(minW, 0.08, coord, maxW, 0.08, coord);
    }

    gridLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    const gridLineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, opacity: 0.6, transparent: true });
    const lines = new THREE.LineSegments(gridLineGeo, gridLineMat);
    this.blueprintGridOverlay.add(lines);
  }

  private initWeatherParticles() {
    // Lightweight particle pool for rain and snow (60 particles)
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = Math.random() * 12 + 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.15,
      transparent: true,
      opacity: 0.7,
    });
    const pMesh = new THREE.Points(particleGeo, particleMat);
    pMesh.name = 'weatherPoints';
    this.weatherParticlesGroup.add(pMesh);
  }

  private updateCameraPosition() {
    const x = Math.sin(this.cameraAngleY) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const y = Math.sin(this.cameraPitch) * this.cameraDistance;
    const z = Math.cos(this.cameraAngleY) * Math.cos(this.cameraPitch) * this.cameraDistance;

    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0.5, 0);
  }

  private setupListeners() {
    const el = this.renderer.domElement;

    el.addEventListener('contextmenu', e => e.preventDefault());

    el.addEventListener('mousedown', e => {
      if (e.button === 2) {
        this.isRightDragging = true;
        this.lastMouseX = e.clientX;
      } else if (e.button === 0) {
        this.handleCanvasClick(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mousemove', e => {
      if (this.isRightDragging) {
        const deltaX = e.clientX - this.lastMouseX;
        this.lastMouseX = e.clientX;
        this.cameraAngleY += deltaX * 0.008;
        this.updateCameraPosition();
      }

      if (this.blueprintActive) {
        this.updateBlueprintHover(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', e => {
      if (e.button === 2) {
        this.isRightDragging = false;
      }
    });

    el.addEventListener(
      'wheel',
      e => {
        e.preventDefault();
        this.cameraDistance = Math.max(12, Math.min(36, this.cameraDistance + e.deltaY * 0.02));
        this.updateCameraPosition();
      },
      { passive: false }
    );

    window.addEventListener('keydown', e => {
      this.keysPressed[e.key.toLowerCase()] = true;

      // 'R' key rotates building in blueprint mode
      if (e.key.toLowerCase() === 'r' && this.blueprintActive) {
        this.blueprintRotation = ((this.blueprintRotation + 90) % 360) as any;
        this.updateGhostModel();
      }
    });

    window.addEventListener('keyup', e => {
      this.keysPressed[e.key.toLowerCase()] = false;
    });

    window.addEventListener('resize', this.onWindowResize);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.sim.state.time.isPaused = true;
      } else {
        this.sim.state.time.isPaused = false;
        this.lastTimestamp = performance.now();
      }
    });
  }

  private onWindowResize = () => {
    if (!this.container || this.isDisposed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  /**
   * Raycasting and click interactions.
   */
  private handleCanvasClick(clientX: number, clientY: number) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // If in Blueprint Mode: Left Click places building
    if (this.blueprintActive && this.blueprintBuildingType && this.blueprintHoverGrid) {
      const { gx, gz } = this.blueprintHoverGrid;
      const success = this.sim.buildStructure(
        this.blueprintBuildingType,
        gx,
        gz,
        this.blueprintRotation
      );
      if (success) {
        this.syncCustomBuildings();
      }
      return;
    }

    // 1. Check clicking on Khim
    const khimHits = this.raycaster.intersectObject(this.khimGroup, true);
    if (khimHits.length > 0) {
      this.planMoveAndInteract('khim', { x: this.khimGroup.position.x, z: this.khimGroup.position.z }, () => {
        this.onOpenDialog?.('khim');
      });
      return;
    }

    // 2. Check clicking on Mochi
    const mochiHits = this.raycaster.intersectObject(this.catMochiGroup, true);
    if (mochiHits.length > 0) {
      this.planMoveAndInteract('mochi', { x: this.catMochiGroup.position.x, z: this.catMochiGroup.position.z }, () => {
        this.onOpenDialog?.('mochi');
      });
      return;
    }

    // 3. Check clicking on Mon
    const monHits = this.raycaster.intersectObject(this.catMonGroup, true);
    if (monHits.length > 0) {
      this.planMoveAndInteract('mon', { x: this.catMonGroup.position.x, z: this.catMonGroup.position.z }, () => {
        this.sim.catchMon();
      });
      return;
    }

    // 4. Check clicking on Mailbox
    if (this.mailboxMesh) {
      const mbHits = this.raycaster.intersectObject(this.mailboxMesh, true);
      if (mbHits.length > 0) {
        this.planMoveAndInteract('mailbox', { x: this.mailboxMesh.position.x, z: this.mailboxMesh.position.z }, () => {
          this.onOpenDialog?.('mailbox');
        });
        return;
      }
    }

    // 5. Check clicking on Salon Chair
    if (this.salonChairMesh) {
      const scHits = this.raycaster.intersectObject(this.salonChairMesh, true);
      if (scHits.length > 0) {
        this.planMoveAndInteract('salon', { x: this.salonChairMesh.position.x, z: this.salonChairMesh.position.z }, () => {
          this.onOpenDialog?.('salon');
        });
        return;
      }
    }

    // 6. Check clicking on Clues (crumbs or pawprints)
    if (this.clueCrumbsMesh) {
      const crumbHits = this.raycaster.intersectObject(this.clueCrumbsMesh, true);
      if (crumbHits.length > 0) {
        this.sim.inspectClue('crumbs');
        return;
      }
    }

    if (this.cluePawprintsMesh) {
      const pawHits = this.raycaster.intersectObject(this.cluePawprintsMesh, true);
      if (pawHits.length > 0) {
        this.sim.inspectClue('pawprints');
        return;
      }
    }

    // 7. Check clicking on Villagers
    for (const [vId, vGroup] of this.villagerMeshes) {
      const vHits = this.raycaster.intersectObject(vGroup, true);
      if (vHits.length > 0) {
        this.planMoveAndInteract('villager', { x: vGroup.position.x, z: vGroup.position.z }, () => {
          this.onOpenDialog?.('villager', vId);
        });
        return;
      }
    }

    // 8. Check clicking on Custom Buildings (Production Facilities)
    for (const [bId, bGroup] of this.customBuildingMeshes) {
      const bHits = this.raycaster.intersectObject(bGroup, true);
      if (bHits.length > 0) {
        const bInst = this.sim.state.placedBuildings[bId];
        if (bInst) {
          this.planMoveAndInteract('custom_building', { x: bGroup.position.x, z: bGroup.position.z }, () => {
            this.onOpenDialog?.('production_machine', bInst);
          });
          return;
        }
      }
    }

    // 9. Check clicking on May's gift box
    if (this.mayGiftBoxMesh) {
      const giftHits = this.raycaster.intersectObject(this.mayGiftBoxMesh, true);
      if (giftHits.length > 0) {
        this.planMoveAndInteract('may_gift', { x: this.mayGiftBoxMesh.position.x, z: this.mayGiftBoxMesh.position.z }, () => {
          this.sim.collectMayGift();
          this.syncMayGift();
        });
        return;
      }
    }

    // 10. Check clicking on Plots or Core Buildings or Ground
    const allHits = this.raycaster.intersectObjects(this.islandGroup.children, true);
    if (allHits.length > 0) {
      let hitTarget: THREE.Object3D | null = allHits[0].object;
      while (hitTarget && !hitTarget.userData?.isPlot && !hitTarget.userData?.buildingType && !hitTarget.userData?.isGround) {
        hitTarget = hitTarget.parent;
      }

      if (hitTarget?.userData?.buildingType === 'house') {
        const door = FarmGrid.gridToWorld(BUILDING_FOOTPRINTS.house.doorX, BUILDING_FOOTPRINTS.house.doorZ);
        this.planMoveAndInteract('house', door, () => {
          this.onOpenDialog?.('house');
        });
        return;
      }

      if (hitTarget?.userData?.buildingType === 'market') {
        const door = FarmGrid.gridToWorld(BUILDING_FOOTPRINTS.market.doorX, BUILDING_FOOTPRINTS.market.doorZ);
        this.planMoveAndInteract('market', door, () => {
          this.onOpenDialog?.('market');
        });
        return;
      }

      if (hitTarget?.userData?.isPlot) {
        const gx = hitTarget.userData.gridX;
        const gz = hitTarget.userData.gridZ;
        const plotWorld = FarmGrid.gridToWorld(gx, gz);

        this.planMoveAndInteract('plot', plotWorld, () => {
          this.handlePlotInteraction(gx, gz);
        }, gx, gz);
        return;
      }

      // Ground plane click -> Walk to position
      const groundPt = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.groundPlane, groundPt);
      if (groundPt) {
        const gridPos = FarmGrid.worldToGrid(groundPt.x, groundPt.z);
        this.startPathToGrid(gridPos.gx, gridPos.gz);
        this.pendingInteraction = null;
      }
    }
  }

  private planMoveAndInteract(
    type: string,
    targetPos: { x: number; z: number },
    execute: () => void,
    gridX?: number,
    gridZ?: number
  ) {
    const currentDist = Math.hypot(
      this.duyenGroup.position.x - targetPos.x,
      this.duyenGroup.position.z - targetPos.z
    );

    if (currentDist <= 1.8) {
      execute();
      this.pendingInteraction = null;
      return;
    }

    const gridTarget = FarmGrid.worldToGrid(targetPos.x, targetPos.z);
    this.startPathToGrid(gridTarget.gx, gridTarget.gz);
    this.pendingInteraction = {
      type,
      targetPos,
      gridX,
      gridZ,
      execute,
    };
  }

  private handlePlotInteraction(gx: number, gz: number) {
    const key = `${gx},${gz}`;
    const crop = this.sim.state.plots[key];

    if (this.selectedTool.startsWith('seed_')) {
      const cropType = this.selectedTool.replace('seed_', '') as CropType;
      const planted = this.sim.plantCrop(gx, gz, cropType);
      if (planted) {
        this.syncCrops();
      }
      return;
    }

    if (this.selectedTool === 'water_can') {
      const watered = this.sim.waterPlot(gx, gz);
      if (watered) {
        this.syncCrops();
      }
      return;
    }

    if (crop) {
      if (crop.stage === 3) {
        const harvested = this.sim.harvestCrop(gx, gz);
        if (harvested) {
          this.syncCrops();
        }
      } else if (!crop.watered) {
        const watered = this.sim.waterPlot(gx, gz);
        if (watered) {
          this.syncCrops();
        }
      } else {
        this.sim.harvestCrop(gx, gz);
      }
    } else {
      this.sim.plantCrop(gx, gz, 'carrot');
      this.syncCrops();
    }
  }

  private startPathToGrid(gx: number, gz: number) {
    const curGrid = FarmGrid.worldToGrid(this.duyenGroup.position.x, this.duyenGroup.position.z);
    const path = this.pathFinder.findPath(curGrid.gx, curGrid.gz, gx, gz);
    if (path.length > 0) {
      this.currentPath = path;
      this.currentWayPointIdx = 0;
      this.isWalking = true;
    }
  }

  /**
   * Synchronizes visual crop meshes and soil color.
   */
  public syncCrops() {
    for (const [key, plotGroup] of this.plotMeshes.entries()) {
      const crop = this.sim.state.plots[key];
      const soilMesh = plotGroup.getObjectByName('soilMesh') as THREE.Mesh;
      const plantGroup = plotGroup.getObjectByName('plantGroup') as THREE.Group;

      if (soilMesh) {
        const targetColor = (crop && crop.watered) ? PALETTE.soilWet : PALETTE.soilDry;
        (soilMesh.material as THREE.MeshLambertMaterial).color.setHex(targetColor);
      }

      while (plantGroup.children.length > 0) {
        plantGroup.remove(plantGroup.children[0]);
      }

      if (crop) {
        const cropMesh = createCropMesh(crop.type, crop.stage);
        plantGroup.add(cropMesh);
      }
    }
  }

  /**
   * Synchronizes placed custom buildings in the 3D scene.
   */
  public syncCustomBuildings() {
    const placed = this.sim.state.placedBuildings || {};

    // Remove demolished buildings
    for (const [id, mesh] of this.customBuildingMeshes) {
      if (!placed[id]) {
        this.islandGroup.remove(mesh);
        this.customBuildingMeshes.delete(id);
      }
    }

    // Add or update buildings
    for (const id in placed) {
      const b = placed[id];
      const def = BUILDING_DEFINITIONS[b.type];
      if (!def) continue;

      let existingMesh = this.customBuildingMeshes.get(id);

      // Recreate if construction state changed from scaffolding to complete
      if (existingMesh && existingMesh.userData.isConstructed !== b.isConstructed) {
        this.islandGroup.remove(existingMesh);
        this.customBuildingMeshes.delete(id);
        existingMesh = undefined;
      }

      if (!existingMesh) {
        let newMesh: THREE.Group;
        if (!b.isConstructed) {
          newMesh = createScaffoldingModel(def.width, def.depth);
        } else {
          switch (b.type) {
            case 'windmill':
              newMesh = createWindmillModel();
              break;
            case 'bakery':
              newMesh = createBakeryModel();
              break;
            case 'juice_press':
              newMesh = createJuicePressModel();
              break;
            case 'gazebo':
              newMesh = createGazeboModel();
              break;
            case 'lantern':
              newMesh = createLanternModel();
              break;
            case 'salon_building':
              newMesh = createSalonBuildingModel();
              break;
            case 'book_cafe':
              newMesh = createBookCafeModel();
              break;
            case 'custom_plot':
              newMesh = createPlotTileModel();
              newMesh.userData = { gridX: b.originX, gridZ: b.originZ, isPlot: true };
              this.plotMeshes.set(`${b.originX},${b.originZ}`, newMesh);
              break;
            default:
              newMesh = createGazeboModel();
          }
        }

        const spanX = (b.rotationDeg === 90 || b.rotationDeg === 270) ? def.depth : def.width;
        const spanZ = (b.rotationDeg === 90 || b.rotationDeg === 270) ? def.width : def.depth;
        const worldPos = FarmGrid.gridToWorld(
          b.originX + spanX / 2 - 0.5,
          b.originZ + spanZ / 2 - 0.5
        );

        newMesh.position.set(worldPos.x, 0.05, worldPos.z);
        newMesh.rotation.y = -(b.rotationDeg * Math.PI) / 180;
        newMesh.userData = {
          isCustomBuilding: true,
          instanceId: id,
          isConstructed: b.isConstructed,
        };

        this.islandGroup.add(newMesh);
        this.customBuildingMeshes.set(id, newMesh);
      }
    }
  }

  private syncMayGift() {
    if (this.sim.state.mayGift.hasGiftOnGround) {
      if (!this.mayGiftBoxMesh) {
        this.mayGiftBoxMesh = createMayGiftBox();
        const pos = FarmGrid.gridToWorld(
          this.sim.state.mayGift.gridX,
          this.sim.state.mayGift.gridZ
        );
        this.mayGiftBoxMesh.position.set(pos.x, 0.05, pos.z);
        this.scene.add(this.mayGiftBoxMesh);
      }
    } else {
      if (this.mayGiftBoxMesh) {
        this.scene.remove(this.mayGiftBoxMesh);
        this.mayGiftBoxMesh = null;
      }
    }
  }

  // --- BLUEPRINT CONSTRUCTION MODE CONTROLS ---

  public setBlueprintMode(active: boolean, buildingType: PlacedBuildingType | null = null) {
    this.blueprintActive = active;
    this.blueprintBuildingType = buildingType;
    this.blueprintGridOverlay.visible = active;

    if (!active) {
      while (this.blueprintGhostGroup.children.length > 0) {
        this.blueprintGhostGroup.remove(this.blueprintGhostGroup.children[0]);
      }
    } else {
      this.updateGhostModel();
    }
  }

  private updateGhostModel() {
    while (this.blueprintGhostGroup.children.length > 0) {
      this.blueprintGhostGroup.remove(this.blueprintGhostGroup.children[0]);
    }

    if (!this.blueprintBuildingType) return;
    const def = BUILDING_DEFINITIONS[this.blueprintBuildingType];
    if (!def) return;

    const spanX = (this.blueprintRotation === 90 || this.blueprintRotation === 270) ? def.depth : def.width;
    const spanZ = (this.blueprintRotation === 90 || this.blueprintRotation === 270) ? def.width : def.depth;

    const ghostBox = new THREE.Mesh(
      new THREE.BoxGeometry(spanX * CELL_SIZE - 0.1, 1.2, spanZ * CELL_SIZE - 0.1),
      new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.5,
        wireframe: false,
      })
    );
    ghostBox.name = 'ghostBox';
    ghostBox.position.y = 0.6;
    this.blueprintGhostGroup.add(ghostBox);
  }

  private updateBlueprintHover(clientX: number, clientY: number) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const groundPt = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.groundPlane, groundPt);
    if (!groundPt) return;

    const { gx, gz } = FarmGrid.worldToGrid(groundPt.x, groundPt.z);
    this.blueprintHoverGrid = { gx, gz };

    if (!this.blueprintBuildingType) return;
    const def = BUILDING_DEFINITIONS[this.blueprintBuildingType];
    const spanX = (this.blueprintRotation === 90 || this.blueprintRotation === 270) ? def.depth : def.width;
    const spanZ = (this.blueprintRotation === 90 || this.blueprintRotation === 270) ? def.width : def.depth;

    const worldPos = FarmGrid.gridToWorld(
      gx + spanX / 2 - 0.5,
      gz + spanZ / 2 - 0.5
    );
    this.blueprintGhostGroup.position.set(worldPos.x, 0.05, worldPos.z);

    // Validate legality
    const check = this.sim.grid.canPlaceBuilding(gx, gz, this.blueprintBuildingType, this.blueprintRotation);
    const ghostBox = this.blueprintGhostGroup.getObjectByName('ghostBox') as THREE.Mesh;
    if (ghostBox) {
      const mat = ghostBox.material as THREE.MeshBasicMaterial;
      mat.color.setHex(check.valid ? 0x22c55e : 0xef4444);
    }
  }

  /**
   * Main render & update loop.
   */
  private loop(timestamp: number) {
    if (this.isDisposed) return;

    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    this.sim.update(dt);

    this.handleKeyboardMovement(dt);
    this.handlePathMovement(dt);
    this.updateAnimations(dt);

    this.syncMayGift();

    this.renderer.render(this.scene, this.camera);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  private handleKeyboardMovement(dt: number) {
    let moveX = 0;
    let moveZ = 0;

    if (this.keysPressed['w'] || this.keysPressed['arrowup']) moveZ -= 1;
    if (this.keysPressed['s'] || this.keysPressed['arrowdown']) moveZ += 1;
    if (this.keysPressed['a'] || this.keysPressed['arrowleft']) moveX -= 1;
    if (this.keysPressed['d'] || this.keysPressed['arrowright']) moveX += 1;

    if (moveX !== 0 || moveZ !== 0) {
      this.currentPath = [];
      this.pendingInteraction = null;

      const forwardAngle = this.cameraAngleY + Math.PI;
      const dirX = moveX * Math.cos(forwardAngle) - moveZ * Math.sin(forwardAngle);
      const dirZ = moveX * Math.sin(forwardAngle) + moveZ * Math.cos(forwardAngle);

      const len = Math.hypot(dirX, dirZ);
      const nextX = this.duyenGroup.position.x + (dirX / len) * this.playerWalkSpeed * dt;
      const nextZ = this.duyenGroup.position.z + (dirZ / len) * this.playerWalkSpeed * dt;

      const nextGrid = FarmGrid.worldToGrid(nextX, nextZ);
      if (this.sim.grid.isWalkable(nextGrid.gx, nextGrid.gz)) {
        this.duyenGroup.position.x = nextX;
        this.duyenGroup.position.z = nextZ;
        this.duyenGroup.rotation.y = Math.atan2(dirX, dirZ);
        this.isWalking = true;
      }
    } else if (this.currentPath.length === 0) {
      this.isWalking = false;
    }
  }

  private handlePathMovement(dt: number) {
    if (this.currentPath.length === 0) return;

    const targetPt = this.currentPath[this.currentWayPointIdx];
    const dx = targetPt.x - this.duyenGroup.position.x;
    const dz = targetPt.z - this.duyenGroup.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 0.15) {
      this.currentWayPointIdx++;
      if (this.currentWayPointIdx >= this.currentPath.length) {
        this.currentPath = [];
        this.isWalking = false;

        if (this.pendingInteraction) {
          const act = this.pendingInteraction;
          const finalDist = Math.hypot(
            this.duyenGroup.position.x - act.targetPos.x,
            this.duyenGroup.position.z - act.targetPos.z
          );
          if (finalDist <= 2.2) {
            act.execute();
          }
          this.pendingInteraction = null;
        }
      }
    } else {
      this.duyenGroup.position.x += (dx / dist) * this.playerWalkSpeed * dt;
      this.duyenGroup.position.z += (dz / dist) * this.playerWalkSpeed * dt;
      this.duyenGroup.rotation.y = Math.atan2(dx, dz);
      this.isWalking = true;
    }

    this.sim.state.playerPos.x = this.duyenGroup.position.x;
    this.sim.state.playerPos.z = this.duyenGroup.position.z;
  }

  private updateAnimations(dt: number) {
    // A. Duyên Walking
    const leftLeg = this.duyenGroup.getObjectByName('leftLeg');
    const rightLeg = this.duyenGroup.getObjectByName('rightLeg');

    if (this.isWalking) {
      this.walkAnimTime += dt * 10;
      this.duyenGroup.position.y = 0.05 + Math.abs(Math.sin(this.walkAnimTime)) * 0.08;
      if (leftLeg && rightLeg) {
        leftLeg.rotation.x = Math.sin(this.walkAnimTime) * 0.6;
        rightLeg.rotation.x = -Math.sin(this.walkAnimTime) * 0.6;
      }
    } else {
      this.duyenGroup.position.y = 0.05;
      if (leftLeg && rightLeg) {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
      }
    }

    const heldTool = this.duyenGroup.getObjectByName('heldTool');
    if (heldTool) {
      heldTool.visible = this.selectedTool === 'water_can';
    }

    // B. Khim & Cats
    this.khimGroup.position.set(this.sim.state.khim.x, 0.05, this.sim.state.khim.z);
    this.catMochiGroup.position.set(this.sim.state.cats.mochi.x, 0.05, this.sim.state.cats.mochi.z);
    this.catMonGroup.position.set(this.sim.state.cats.mon.x, 0.05, this.sim.state.cats.mon.z);
    this.catMayGroup.position.set(this.sim.state.cats.may.x, 0.05, this.sim.state.cats.may.z);

    // C. Windmill sails animation
    for (const [, bMesh] of this.customBuildingMeshes) {
      const sails = bMesh.getObjectByName('windmillSails');
      if (sails) {
        sails.rotation.z += dt * 1.5;
      }
    }

    // D. Villagers schedule positions
    const timeNorm = this.sim.state.time.timeOfDay / DAY_DURATION_SECONDS;
    for (const [vId, vMesh] of this.villagerMeshes) {
      const vDef = VILLAGERS[vId];
      if (!vDef) continue;
      const targetPos = timeNorm < 0.35 ? vDef.schedule.morning : timeNorm < 0.75 ? vDef.schedule.daytime : vDef.schedule.evening;
      const dx = targetPos.x - vMesh.position.x;
      const dz = targetPos.z - vMesh.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.1) {
        vMesh.position.x += (dx / dist) * 0.7 * dt;
        vMesh.position.z += (dz / dist) * 0.7 * dt;
      }
    }

    // E. Weather particles
    const pPoints = this.weatherParticlesGroup.getObjectByName('weatherPoints') as THREE.Points;
    if (pPoints) {
      const weather = this.sim.state.weather.current;
      const reduced = this.sim.state.settings.reducedMotion;
      pPoints.visible = !reduced && (weather === 'rainy' || weather === 'stormy' || weather === 'snowy');

      if (pPoints.visible) {
        const posAttr = pPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < posAttr.count; i++) {
          let y = posAttr.getY(i);
          y -= dt * (weather === 'snowy' ? 2 : 12);
          if (y < 0) y = 14;
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
      }
    }

    // F. Day-Night Lighting Transition
    if (timeNorm < 0.25) {
      this.sunLight.color.setHex(0xffecd2);
      this.sunLight.intensity = 1.1;
      this.scene.background = new THREE.Color(0xbde0fe);
    } else if (timeNorm < 0.7) {
      this.sunLight.color.setHex(PALETTE.sunColor);
      this.sunLight.intensity = 1.3;
      this.scene.background = new THREE.Color(PALETTE.waterBlue);
    } else if (timeNorm < 0.88) {
      this.sunLight.color.setHex(0xfb923c);
      this.sunLight.intensity = 0.95;
      this.scene.background = new THREE.Color(0xfbcfe8);
    } else {
      this.sunLight.color.setHex(0x38bdf8);
      this.sunLight.intensity = 0.35;
      this.scene.background = new THREE.Color(0x1e293b);
    }
  }

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onWindowResize);

    this.scene.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
