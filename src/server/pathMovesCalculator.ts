import { PathMovesCalculation } from '../shared/types/grid';
import { LevelConfig, GameProgress } from '../shared/types/level';

/**
 * Utility class for calculating moves from paths and integrating with level system
 */
export class PathMovesCalculator {
  
  /**
   * Calculate estimated moves required for a given path
   */
  static calculatePathMoves(
    path: [number, number][],
    potholes: [number, number][],
    peopleLocations: [number, number][],
    levelConfig: LevelConfig
  ): PathMovesCalculation {
    if (path.length === 0) {
      return {
        pathLength: 0,
        estimatedMoves: 0,
        efficiency: 0,
        alternativeRoutes: 0,
        moveBreakdown: {
          navigationMoves: 0,
          potholeRepairs: 0,
          peoplePickup: 0
        }
      };
    }

    // Basic navigation moves (path length - 1, since starting position doesn't count as a move)
    const navigationMoves = Math.max(0, path.length - 1);
    
    // Count potholes that intersect with the path
    const potholesOnPath = potholes.filter(pothole => 
      path.some(pathPoint => 
        pathPoint[0] === pothole[0] && pathPoint[1] === pothole[1]
      )
    );
    
    // Count people pickup points that intersect with the path
    const peopleOnPath = peopleLocations.filter(person => 
      path.some(pathPoint => 
        pathPoint[0] === person[0] && pathPoint[1] === person[1]
      )
    );

    // Calculate move costs
    const potholeRepairs = potholesOnPath.length; // 1 move per pothole
    const peoplePickup = peopleOnPath.length; // 1 move per person
    
    const totalEstimatedMoves = navigationMoves + potholeRepairs + peoplePickup;
    
    // Calculate efficiency (lower is better)
    const startPoint = path[0];
    const endPoint = path[path.length - 1];
    if (!startPoint || !endPoint) {
      return {
        pathLength: path.length,
        estimatedMoves: totalEstimatedMoves,
        efficiency: 0,
        alternativeRoutes: 0,
        moveBreakdown: {
          navigationMoves,
          potholeRepairs,
          peoplePickup
        }
      };
    }
    
    const theoreticalMinMoves = Math.abs(startPoint[0] - endPoint[0]) + 
                               Math.abs(startPoint[1] - endPoint[1]);
    const efficiency = theoreticalMinMoves > 0 ? theoreticalMinMoves / totalEstimatedMoves : 1;

    return {
      pathLength: path.length,
      estimatedMoves: totalEstimatedMoves,
      efficiency: Math.min(1, efficiency),
      alternativeRoutes: 0, // Will be calculated by PathfindingAlternatives
      moveBreakdown: {
        navigationMoves,
        potholeRepairs,
        peoplePickup
      }
    };
  }

  /**
   * Check if path is viable within level move constraints
   */
  static isPathViableForLevel(
    pathMoves: PathMovesCalculation,
    levelConfig: LevelConfig,
    currentProgress: GameProgress
  ): {
    viable: boolean;
    remainingMoves: number | null;
    recommendation: string;
  } {
    const maxMoves = levelConfig.objectives.maxMoves;
    
    // If unlimited moves, always viable
    if (maxMoves === null) {
      return {
        viable: true,
        remainingMoves: null,
        recommendation: "Unlimited moves available"
      };
    }

    const movesUsed = currentProgress.movesUsed;
    const movesRemaining = maxMoves - movesUsed;
    const viable = pathMoves.estimatedMoves <= movesRemaining;

    let recommendation: string;
    if (viable) {
      const movesAfterPath = movesRemaining - pathMoves.estimatedMoves;
      recommendation = `Path viable. ${movesAfterPath} moves remaining after completion.`;
    } else {
      const movesOver = pathMoves.estimatedMoves - movesRemaining;
      recommendation = `Path requires ${movesOver} more moves than available. Consider alternative route.`;
    }

    return {
      viable,
      remainingMoves: movesRemaining,
      recommendation
    };
  }

  /**
   * Calculate optimal path strategy for level objectives
   */
  static calculateOptimalStrategy(
    allPaths: Record<string, [number, number][]>,
    potholes: [number, number][],
    peopleLocations: [number, number][],
    levelConfig: LevelConfig
  ): {
    recommendedPath: string | null;
    pathAnalysis: Record<string, PathMovesCalculation>;
    strategy: string;
  } {
    const pathAnalysis: Record<string, PathMovesCalculation> = {};
    let bestPath: string | null = null;
    let bestEfficiency = 0;

    // Analyze each path
    Object.entries(allPaths).forEach(([pathId, path]) => {
      const analysis = this.calculatePathMoves(path, potholes, peopleLocations, levelConfig);
      pathAnalysis[pathId] = analysis;

      // Find most efficient viable path
      if (analysis.efficiency > bestEfficiency) {
        bestEfficiency = analysis.efficiency;
        bestPath = pathId;
      }
    });

    // Generate strategy recommendation
    let strategy = "No viable paths found.";
    if (bestPath && pathAnalysis[bestPath]) {
      const best = pathAnalysis[bestPath];
      if (best) {
        strategy = `Recommended path: ${bestPath}. ` +
                  `Estimated ${best.estimatedMoves} moves ` +
                  `(${best.moveBreakdown.navigationMoves} navigation, ` +
                  `${best.moveBreakdown.potholeRepairs} pothole repairs, ` +
                  `${best.moveBreakdown.peoplePickup} people pickup). ` +
                  `Efficiency: ${(best.efficiency * 100).toFixed(1)}%`;
      }
    }

    return {
      recommendedPath: bestPath,
      pathAnalysis,
      strategy
    };
  }

  /**
   * Update game progress based on path execution
   */
  static updateProgressForPathExecution(
    currentProgress: GameProgress,
    pathMoves: PathMovesCalculation,
    actualMovesUsed: number
  ): Partial<GameProgress> {
    const newMovesUsed = currentProgress.movesUsed + actualMovesUsed;
    const potholeFillsFromPath = pathMoves.moveBreakdown.potholeRepairs;
    const peoplePickupFromPath = pathMoves.moveBreakdown.peoplePickup;

    return {
      movesUsed: newMovesUsed,
      potholeCount: currentProgress.potholeCount + potholeFillsFromPath,
      peopleTransported: currentProgress.peopleTransported + peoplePickupFromPath,
      movesLeft: currentProgress.movesLeft !== null && currentProgress.movesLeft !== undefined ? 
        Math.max(0, currentProgress.movesLeft - actualMovesUsed) : null
    };
  }
}
