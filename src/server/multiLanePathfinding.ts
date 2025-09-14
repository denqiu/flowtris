import PF from 'pathfinding';
import { LaneConfig, MultiLaneGridConfig } from '../shared/types/grid';

export class MultiLanePathCalculator {
  private rows: number;
  private columns: number;
  private baseMatrix: number[][];

  constructor(rows: number, columns: number, baseMatrix: number[][]) {
    this.rows = rows;
    this.columns = columns;
    this.baseMatrix = baseMatrix.map(row => [...row]); // Deep copy
  }

  /**
   * Calculate paths for multiple lanes, ensuring vehicles stay in their designated lanes
   */
  public calculateMultiLanePaths(config: MultiLaneGridConfig): Record<string, [number, number][]> {
    const allPaths: Record<string, [number, number][]> = {};

    // Calculate path for each lane
    for (const lane of config.lanes) {
      const lanePaths = this.calculateLanePaths(lane, config.selectedLaneId === lane.id);
      allPaths[lane.id] = lanePaths;
    }

    return allPaths;
  }

  /**
   * Calculate paths for a specific lane with lane restrictions
   */
  private calculateLanePaths(lane: LaneConfig, isSelected: boolean): [number, number][] {
    // Create a copy of the base matrix
    const laneMatrix = this.baseMatrix.map(row => [...row]);

    // Mark other lanes as obstacles if this is the selected lane
    if (isSelected) {
      // Set cells outside this lane's row range as obstacles
      for (let x = 0; x < this.rows; x++) {
        if (x < lane.startRow || x > lane.endRow) {
          for (let y = 0; y < this.columns; y++) {
            if (laneMatrix[x] && laneMatrix[x][y] !== undefined) {
              laneMatrix[x][y] = 1; // Mark as obstacle
            }
          }
        }
      }
    }

    // Find the best path within the lane
    const grid = new PF.Grid(laneMatrix);
    const finder = new PF.AStarFinder({
      allowDiagonal: false,
      dontCrossCorners: true
    });

    // Try to find a path from any start point to any end point
    let bestPath: [number, number][] = [];
    let shortestDistance = Infinity;

    for (const startPoint of lane.startPoints) {
      for (const endPoint of lane.endPoints) {
        try {
          // Ensure points are within the lane boundaries
          if (this.isPointInLane(startPoint, lane) && this.isPointInLane(endPoint, lane)) {
            const path = finder.findPath(...startPoint, ...endPoint, grid.clone()) as [number, number][];
            
            if (path.length > 0 && path.length < shortestDistance) {
              bestPath = path;
              shortestDistance = path.length;
            }
          }
        } catch (error) {
          console.warn(`Failed to find path for lane ${lane.id}:`, error);
        }
      }
    }

    return bestPath;
  }

  /**
   * Check if a point is within the lane boundaries
   */
  private isPointInLane(point: [number, number], lane: LaneConfig): boolean {
    const [x] = point;
    return x >= lane.startRow && x <= lane.endRow;
  }

  /**
   * Get matrix with all paths marked, with selected path having priority
   */
  public getMultiLaneMatrix(config: MultiLaneGridConfig): {
    matrix: number[][];
    selectedPath: [number, number][];
    otherPaths: Record<string, [number, number][]>;
  } {
    const matrix = this.baseMatrix.map(row => [...row]);
    const allPaths = this.calculateMultiLanePaths(config);
    
    let selectedPath: [number, number][] = [];
    const otherPaths: Record<string, [number, number][]> = {};

    // Mark all non-selected paths as obstacles first
    for (const [laneId, path] of Object.entries(allPaths)) {
      if (config.selectedLaneId !== laneId) {
        otherPaths[laneId] = path;
        // Mark other paths as obstacles in the matrix
        path.forEach(([x, y]) => {
          if (matrix[x] && matrix[x][y] !== undefined) {
            matrix[x][y] = 1; // Obstacle
          }
        });
      }
    }

    // Mark selected path as walkable
    if (config.selectedLaneId && allPaths[config.selectedLaneId]) {
      const selectedLanePath = allPaths[config.selectedLaneId];
      if (selectedLanePath) {
        selectedPath = selectedLanePath;
        selectedPath.forEach(([x, y]) => {
          if (matrix[x] && matrix[x][y] !== undefined) {
            matrix[x][y] = 2; // Path
          }
        });
      }
    }

    return {
      matrix,
      selectedPath,
      otherPaths
    };
  }

  /**
   * Algorithm A: Async calculation for multiple paths (as mentioned in requirements)
   * This implements the async approach you described for handling decision paralysis
   */
  public async calculateMultiLanePathsAsync(config: MultiLaneGridConfig): Promise<Record<string, [number, number][]>> {
    const pathPromises = config.lanes.map(async (lane, index) => {
      // Each async process has a copy of the matrix
      // Calculate path for this lane
      const path = await new Promise<[number, number][]>((resolve) => {
        setTimeout(() => {
          const lanePath = this.calculateLanePaths(lane, config.selectedLaneId === lane.id);
          resolve(lanePath);
        }, index * 10); // Stagger the calculations
      });

      return { laneId: lane.id, path };
    });

    const results = await Promise.all(pathPromises);
    
    // Convert to the expected format
    const allPaths: Record<string, [number, number][]> = {};
    results.forEach(({ laneId, path }) => {
      allPaths[laneId] = path;
    });

    return allPaths;
  }
}
