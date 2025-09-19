import { MatrixDirectionsResponse } from '../shared/types/grid';

export type Direction = 'north' | 'south' | 'east' | 'west';

/**
 * Convert A* path points into directional matrix
 * Based on your specification:
 * 1. Setup string map of 4 directions and points
 * 2. First point must be edge or corner otherwise throw error
 * 3. Determine start direction depending on edge or corner
 * 4. While next point shares same x or y, add to direction key
 * 5. If x or y becomes different, re-run loop
 */
export class PathDirectionCalculator {
  private rows: number;
  private columns: number;

  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
  }

  /**
   * Check if point is on edge or corner of grid
   */
  private isEdgeOrCorner(point: [number, number]): boolean {
    const [x, y] = point;
    return x === 0 || x === this.rows - 1 || y === 0 || y === this.columns - 1;
  }

  /**
   * Check if point is a corner
   */
  private isCorner(point: [number, number]): boolean {
    const [x, y] = point;
    return (x === 0 || x === this.rows - 1) && (y === 0 || y === this.columns - 1);
  }

  /**
   * Determine initial direction from start point
   * If corner and no direction specified, throw error
   */
  private getStartDirection(startPoint: [number, number], nextPoint?: [number, number], specifiedDirection?: Direction): Direction {
    const [x, y] = startPoint;
    
    if (this.isCorner(startPoint)) {
      if (!specifiedDirection && !nextPoint) {
        throw new Error('Corner start point requires specified direction or next point to determine direction');
      }
      if (specifiedDirection) return specifiedDirection;
      
      // Determine from next point
      if (nextPoint) {
        const [nextX, nextY] = nextPoint;
        if (nextX > x) return 'south';
        if (nextX < x) return 'north';
        if (nextY > y) return 'east';
        if (nextY < y) return 'west';
      }
    }

    // Edge point direction determination
    if (x === 0) return 'south'; // Top edge
    if (x === this.rows - 1) return 'north'; // Bottom edge
    if (y === 0) return 'east'; // Left edge
    if (y === this.columns - 1) return 'west'; // Right edge

    throw new Error('Start point must be on edge or corner of grid');
  }

  /**
   * Calculate direction between two points
   */
  private getDirectionBetweenPoints(from: [number, number], to: [number, number]): Direction {
    const [fromX, fromY] = from;
    const [toX, toY] = to;

    if (toX > fromX) return 'south';
    if (toX < fromX) return 'north';
    if (toY > fromY) return 'east';
    if (toY < fromY) return 'west';

    throw new Error('Points must be adjacent and different');
  }

  /**
   * Convert path points to directional segments
   */
  public calculateDirections(path: [number, number][], specifiedStartDirection?: Direction): MatrixDirectionsResponse {
    if (path.length === 0) {
      throw new Error('Path cannot be empty');
    }

    const startPoint = path[0];
    if (!this.isEdgeOrCorner(startPoint)) {
      throw new Error('First point must be edge or corner');
    }

    // Initialize directional matrix
    const matrix: string[][] = Array.from({ length: this.rows }, () => 
      Array(this.columns).fill('')
    );

    const directionMap: Record<Direction, [number, number][]> = {
      north: [],
      south: [],
      east: [],
      west: []
    };

    // Determine start direction
    let currentDirection = this.getStartDirection(
      startPoint, 
      path[1], 
      specifiedStartDirection
    );

    // Process path points
    for (let i = 0; i < path.length - 1; i++) {
      const currentPoint = path[i];
      const nextPoint = path[i + 1];

      // Calculate direction to next point
      const nextDirection = this.getDirectionBetweenPoints(currentPoint, nextPoint);

      // Add current point to current direction
      directionMap[currentDirection].push(currentPoint);
      matrix[currentPoint[0]][currentPoint[1]] = currentDirection;

      // If direction changes, update current direction
      if (nextDirection !== currentDirection) {
        currentDirection = nextDirection;
      }
    }

    // Add final point
    const lastPoint = path[path.length - 1];
    directionMap[currentDirection].push(lastPoint);
    matrix[lastPoint[0]][lastPoint[1]] = currentDirection;

    return {
      matrix,
      status: 'success',
      message: 'Directions calculated successfully'
    };
  }

  /**
   * Convert multiple paths to directional matrices
   */
  public calculateMultiplePathDirections(paths: Record<string, [number, number][]>): Record<string, MatrixDirectionsResponse> {
    const results: Record<string, MatrixDirectionsResponse> = {};
    
    for (const [pathId, path] of Object.entries(paths)) {
      try {
        results[pathId] = this.calculateDirections(path);
      } catch (error) {
        results[pathId] = {
          matrix: [],
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return results;
  }
}

/**
 * Utility function to merge path directions with icon matrix
 */
export function mergePathDirectionsWithIcons(
  iconMatrix: string[][],
  directionMatrix: string[][],
  pathPoints: [number, number][]
): string[][] {
  const mergedMatrix = iconMatrix.map(row => [...row]);

  pathPoints.forEach(([x, y]) => {
    const direction = directionMatrix[x]?.[y];
    if (direction) {
      // For road cells, append direction info
      if (mergedMatrix[x][y] === 'ROAD') {
        mergedMatrix[x][y] = `ROAD_${direction.toUpperCase()}`;
      }
    }
  });

  return mergedMatrix;
}
