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
   * Algorithm A: Enhanced async calculation for multiple paths
   * Implements true parallel processing with dynamic obstacle management
   */
  public async calculateMultiLanePathsAsync(config: MultiLaneGridConfig): Promise<{
    paths: Record<string, [number, number][]>;
    calculations: Array<{
      laneId: string;
      startTime: number;
      endTime: number;
      pathLength: number;
      success: boolean;
    }>;
  }> {
    const pathResults: Array<[number, number][] | null> = new Array(config.lanes.length).fill(null);
    const calculationMetrics: Array<{
      laneId: string;
      startTime: number;
      endTime: number;
      pathLength: number;
      success: boolean;
    }> = [];

    // Create async processes for each lane
    const pathPromises = config.lanes.map(async (lane, index) => {
      const startTime = Date.now();
      
      try {
        // Each process gets its own matrix copy
        const laneMatrix = this.baseMatrix.map(row => [...row]);
        
        // Apply dynamic obstacle updates based on other calculated paths
        const path = await this.calculateLanePathWithDynamicObstacles(
          lane, 
          laneMatrix, 
          index, 
          pathResults,
          config.selectedLaneId === lane.id
        );

        const endTime = Date.now();
        pathResults[index] = path;
        
        calculationMetrics.push({
          laneId: lane.id,
          startTime,
          endTime,
          pathLength: path.length,
          success: path.length > 0
        });

        return { laneId: lane.id, path, index };
      } catch (error) {
        const endTime = Date.now();
        console.warn(`Failed to calculate path for lane ${lane.id}:`, error);
        
        calculationMetrics.push({
          laneId: lane.id,
          startTime,
          endTime,
          pathLength: 0,
          success: false
        });

        return { laneId: lane.id, path: [], index };
      }
    });

    const results = await Promise.all(pathPromises);
    
    // Convert to the expected format
    const allPaths: Record<string, [number, number][]> = {};
    results.forEach(({ laneId, path }) => {
      allPaths[laneId] = path;
    });

    return {
      paths: allPaths,
      calculations: calculationMetrics
    };
  }

  /**
   * Calculate lane path with dynamic obstacle management
   * Monitors other paths being calculated and adjusts obstacles accordingly
   */
  private async calculateLanePathWithDynamicObstacles(
    lane: LaneConfig,
    laneMatrix: number[][],
    currentIndex: number,
    pathResults: Array<[number, number][] | null>,
    isSelected: boolean
  ): Promise<[number, number][]> {
    
    // Apply lane restrictions
    if (isSelected) {
      // Set cells outside this lane's row range as obstacles
      for (let x = 0; x < this.rows; x++) {
        if (x < lane.startRow || x > lane.endRow) {
          for (let y = 0; y < this.columns; y++) {
            if (laneMatrix[x]?.[y] !== undefined) {
              laneMatrix[x]![y] = 1; // Mark as obstacle
            }
          }
        }
      }
    }

    // Check for completed paths from other lanes and mark as obstacles
    const pollInterval = 50; // Check every 50ms
    let attempts = 0;
    const maxAttempts = 20; // Maximum wait time

    while (attempts < maxAttempts) {
      // Apply obstacles from completed paths
      for (let i = 0; i < pathResults.length; i++) {
        if (i !== currentIndex && pathResults[i] !== null) {
          const otherPath = pathResults[i];
          if (otherPath && !isSelected) {
            // Mark other lane paths as obstacles
            otherPath.forEach(([x, y]) => {
              if (laneMatrix[x]?.[y] === 0) {
                laneMatrix[x]![y] = 1; // Obstacle
              }
            });
          }
        }
      }

      // Try to calculate path with current obstacle state
      const grid = new PF.Grid(laneMatrix);
      const finder = new PF.AStarFinder({
        allowDiagonal: false,
        dontCrossCorners: true
      });

      let bestPath: [number, number][] = [];
      let shortestDistance = Infinity;

      for (const startPoint of lane.startPoints) {
        for (const endPoint of lane.endPoints) {
          try {
            if (this.isPointInLane(startPoint, lane) && this.isPointInLane(endPoint, lane)) {
              const path = finder.findPath(...startPoint, ...endPoint, grid.clone()) as [number, number][];
              
              if (path.length > 0 && path.length < shortestDistance) {
                bestPath = path;
                shortestDistance = path.length;
              }
            }
          } catch (error) {
            // Continue trying other combinations
          }
        }
      }

      if (bestPath.length > 0) {
        return bestPath;
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    // Fallback: return empty path if no solution found
    return [];
  }
}
