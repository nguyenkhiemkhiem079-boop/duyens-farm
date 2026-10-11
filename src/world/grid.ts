import { GRID_SIZE, CELL_SIZE, FARM_ORIGIN_OFFSET, BUILDING_FOOTPRINTS, DEFAULT_FARM_PLOTS } from '../core/constants';
import { PlacedBuildingInstance, BUILDING_DEFINITIONS, PlacedBuildingType } from '../core/buildings';

export enum CellType {
  WALKABLE = 0,
  BLOCKED_BUILDING = 1,
  FARM_PLOT = 2,
  BLOCKED_DECOR = 3,
  BLOCKED_CUSTOM = 4,
}

// Critical access waypoints that must NEVER be built upon or obstructed
export const CRITICAL_ACCESS_CELLS: Array<{ x: number; z: number; label: string }> = [
  { x: 2, z: 7, label: 'House Door' },
  { x: 2, z: 6, label: 'House Porch Path' },
  { x: 8, z: 4, label: 'Market Counter Front' },
  { x: 9, z: 7, label: 'Barn Entrance' },
];

export class FarmGrid {
  public cells: CellType[][];

  constructor() {
    this.cells = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => CellType.WALKABLE)
    );
    this.initBuildings();
    this.initPlots();
  }

  private initBuildings() {
    // Block House
    const h = BUILDING_FOOTPRINTS.house;
    for (let x = h.minX; x <= h.maxX; x++) {
      for (let z = h.minZ; z <= h.maxZ; z++) {
        this.setCell(x, z, CellType.BLOCKED_BUILDING);
      }
    }

    // Block Barn
    const b = BUILDING_FOOTPRINTS.barn;
    for (let x = b.minX; x <= b.maxX; x++) {
      for (let z = b.minZ; z <= b.maxZ; z++) {
        this.setCell(x, z, CellType.BLOCKED_BUILDING);
      }
    }

    // Block Market
    const m = BUILDING_FOOTPRINTS.market;
    for (let x = m.minX; x <= m.maxX; x++) {
      for (let z = m.minZ; z <= m.maxZ; z++) {
        this.setCell(x, z, CellType.BLOCKED_BUILDING);
      }
    }

    // Some decorative trees at farm corners (e.g. 0,11; 11,11; 0,0; 11,0; 0,6)
    this.setCell(0, 11, CellType.BLOCKED_DECOR);
    this.setCell(11, 11, CellType.BLOCKED_DECOR);
    this.setCell(0, 0, CellType.BLOCKED_DECOR);
    this.setCell(11, 0, CellType.BLOCKED_DECOR);
    this.setCell(0, 6, CellType.BLOCKED_DECOR);
  }

  private initPlots() {
    for (const plot of DEFAULT_FARM_PLOTS) {
      this.setCell(plot.x, plot.z, CellType.FARM_PLOT);
    }
  }

  /**
   * Recomputes entire occupancy grid based on placed buildings and custom plots.
   */
  public recomputeOccupancy(placedBuildings: Record<string, PlacedBuildingInstance>) {
    // 1. Reset all cells
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        this.cells[x][z] = CellType.WALKABLE;
      }
    }

    // 2. Base buildings and scenery
    this.initBuildings();
    this.initPlots();

    // 3. Register custom placed buildings
    for (const bId in placedBuildings) {
      const b = placedBuildings[bId];
      if (b.type === 'custom_plot') {
        this.setCell(b.originX, b.originZ, CellType.FARM_PLOT);
      } else {
        const footprintCells = FarmGrid.getFootprintCells(b.originX, b.originZ, b.type, b.rotationDeg);
        for (const cell of footprintCells) {
          if (this.isValid(cell.x, cell.z)) {
            this.setCell(cell.x, cell.z, CellType.BLOCKED_CUSTOM);
          }
        }
      }
    }
  }

  /**
   * Calculates all grid cells occupied by a rotated building.
   */
  public static getFootprintCells(
    originX: number,
    originZ: number,
    type: string,
    rotationDeg: 0 | 90 | 180 | 270
  ): Array<{ x: number; z: number }> {
    let width = 1;
    let depth = 1;
    const def = BUILDING_DEFINITIONS[type as PlacedBuildingType];
    if (def) {
      width = def.width;
      depth = def.depth;
    }

    const spanX = (rotationDeg === 90 || rotationDeg === 270) ? depth : width;
    const spanZ = (rotationDeg === 90 || rotationDeg === 270) ? width : depth;

    const cells: Array<{ x: number; z: number }> = [];
    for (let dx = 0; dx < spanX; dx++) {
      for (let dz = 0; dz < spanZ; dz++) {
        cells.push({ x: originX + dx, z: originZ + dz });
      }
    }
    return cells;
  }

  /**
   * Validates whether a building can be legally placed at the given location.
   */
  public canPlaceBuilding(
    originX: number,
    originZ: number,
    type: string,
    rotationDeg: 0 | 90 | 180 | 270
  ): { valid: boolean; reason?: string } {
    const footprint = FarmGrid.getFootprintCells(originX, originZ, type, rotationDeg);

    // 1. Boundary & Overlap checks
    for (const cell of footprint) {
      if (!this.isValid(cell.x, cell.z)) {
        return { valid: false, reason: 'Vượt ra ngoài ranh giới hòn đảo 12×12!' };
      }

      // Check critical doorways
      const isCritical = CRITICAL_ACCESS_CELLS.some(c => c.x === cell.x && c.z === cell.z);
      if (isCritical) {
        return { valid: false, reason: 'Vị trí này chắn lối ra vào quan trọng (nhà/quầy hàng)!' };
      }

      const cellType = this.getCell(cell.x, cell.z);
      if (cellType === CellType.BLOCKED_BUILDING) {
        return { valid: false, reason: 'Trùng với công trình cố định trên đảo!' };
      }
      if (cellType === CellType.BLOCKED_CUSTOM) {
        return { valid: false, reason: 'Trùng với một công trình khác đã xây!' };
      }
      if (cellType === CellType.BLOCKED_DECOR) {
        return { valid: false, reason: 'Vướng cây cối hoặc phong cảnh cố định!' };
      }
      if (cellType === CellType.FARM_PLOT && type !== 'custom_plot') {
        return { valid: false, reason: 'Không thể xây đè lên ô đất trồng rau!' };
      }
    }

    return { valid: true };
  }

  public setCell(x: number, z: number, type: CellType) {
    if (this.isValid(x, z)) {
      this.cells[x][z] = type;
    }
  }

  public getCell(x: number, z: number): CellType {
    if (!this.isValid(x, z)) return CellType.BLOCKED_BUILDING;
    return this.cells[x][z];
  }

  public isValid(x: number, z: number): boolean {
    return x >= 0 && x < GRID_SIZE && z >= 0 && z < GRID_SIZE;
  }

  public isWalkable(x: number, z: number): boolean {
    if (!this.isValid(x, z)) return false;
    const type = this.cells[x][z];
    return type === CellType.WALKABLE || type === CellType.FARM_PLOT;
  }

  /**
   * Convert grid (0..11, 0..11) to 3D world coordinates (centered on tile).
   */
  public static gridToWorld(gx: number, gz: number): { x: number; z: number } {
    const x = gx * CELL_SIZE - FARM_ORIGIN_OFFSET + CELL_SIZE / 2;
    const z = gz * CELL_SIZE - FARM_ORIGIN_OFFSET + CELL_SIZE / 2;
    return { x, z };
  }

  /**
   * Convert 3D world coordinates to grid coords.
   */
  public static worldToGrid(x: number, z: number): { gx: number; gz: number } {
    const gx = Math.floor((x + FARM_ORIGIN_OFFSET) / CELL_SIZE);
    const gz = Math.floor((z + FARM_ORIGIN_OFFSET) / CELL_SIZE);
    return {
      gx: Math.max(0, Math.min(GRID_SIZE - 1, gx)),
      gz: Math.max(0, Math.min(GRID_SIZE - 1, gz)),
    };
  }

  /**
   * Find nearest walkable neighbor adjacent to a blocked cell.
   */
  public getNearestWalkableNeighbor(gx: number, gz: number, fromX: number, fromZ: number): { gx: number; gz: number } | null {
    if (this.isWalkable(gx, gz)) {
      return { gx, gz };
    }

    const neighbors = [
      { gx: gx + 1, gz },
      { gx: gx - 1, gz },
      { gx, gz: gz + 1 },
      { gx, gz: gz - 1 },
      { gx: gx + 1, gz: gz + 1 },
      { gx: gx - 1, gz: gz + 1 },
      { gx: gx + 1, gz: gz - 1 },
      { gx: gx - 1, gz: gz - 1 },
    ].filter(n => this.isWalkable(n.gx, n.gz));

    if (neighbors.length === 0) return null;

    neighbors.sort((a, b) => {
      const distA = Math.hypot(a.gx - fromX, a.gz - fromZ);
      const distB = Math.hypot(b.gx - fromX, b.gz - fromZ);
      return distA - distB;
    });

    return neighbors[0];
  }
}
