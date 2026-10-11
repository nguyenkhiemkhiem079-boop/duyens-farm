import { FarmGrid } from './grid';
import { GRID_SIZE } from '../core/constants';

interface Node {
  x: number;
  z: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export class PathFinder {
  constructor(private grid: FarmGrid) {}

  /**
   * Finds a path from start grid coords to goal grid coords.
   * Returns array of world positions for the path.
   */
  public findPath(
    startX: number,
    startZ: number,
    targetX: number,
    targetZ: number
  ): Array<{ x: number; z: number }> {
    // If target is blocked, find closest walkable neighbor
    let endX = targetX;
    let endZ = targetZ;
    if (!this.grid.isWalkable(endX, endZ)) {
      const neighbor = this.grid.getNearestWalkableNeighbor(endX, endZ, startX, startZ);
      if (!neighbor) return [];
      endX = neighbor.gx;
      endZ = neighbor.gz;
    }

    if (startX === endX && startZ === endZ) {
      return [FarmGrid.gridToWorld(endX, endZ)];
    }

    const openList: Node[] = [];
    const closedSet = new Set<string>();

    const startNode: Node = {
      x: startX,
      z: startZ,
      g: 0,
      h: this.heuristic(startX, startZ, endX, endZ),
      f: this.heuristic(startX, startZ, endX, endZ),
      parent: null,
    };

    openList.push(startNode);

    const keyOf = (x: number, z: number) => `${x},${z}`;

    while (openList.length > 0) {
      // Find node with lowest f
      let lowestIdx = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[lowestIdx].f) {
          lowestIdx = i;
        }
      }

      const current = openList.splice(lowestIdx, 1)[0];
      closedSet.add(keyOf(current.x, current.z));

      // Check if reached destination
      if (current.x === endX && current.z === endZ) {
        return this.reconstructPath(current);
      }

      // Orthogonal directions (Up, Down, Left, Right)
      const directions = [
        { dx: 1, dz: 0 },
        { dx: -1, dz: 0 },
        { dx: 0, dz: 1 },
        { dx: 0, dz: -1 },
      ];

      for (const dir of directions) {
        const nx = current.x + dir.dx;
        const nz = current.z + dir.dz;

        if (!this.grid.isValid(nx, nz)) continue;
        if (!this.grid.isWalkable(nx, nz)) continue;
        if (closedSet.has(keyOf(nx, nz))) continue;

        const gScore = current.g + 1;
        let neighbor = openList.find(n => n.x === nx && n.z === nz);

        if (!neighbor) {
          const h = this.heuristic(nx, nz, endX, endZ);
          neighbor = {
            x: nx,
            z: nz,
            g: gScore,
            h,
            f: gScore + h,
            parent: current,
          };
          openList.push(neighbor);
        } else if (gScore < neighbor.g) {
          neighbor.g = gScore;
          neighbor.f = gScore + neighbor.h;
          neighbor.parent = current;
        }
      }
    }

    // No path found
    return [];
  }

  private heuristic(x1: number, z1: number, x2: number, z2: number): number {
    // Manhattan distance
    return Math.abs(x1 - x2) + Math.abs(z1 - z2);
  }

  private reconstructPath(endNode: Node): Array<{ x: number; z: number }> {
    const path: Array<{ x: number; z: number }> = [];
    let curr: Node | null = endNode;
    while (curr) {
      path.unshift(FarmGrid.gridToWorld(curr.x, curr.z));
      curr = curr.parent;
    }
    return path;
  }
}
