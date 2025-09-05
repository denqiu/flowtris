import { useState, useCallback, useEffect, useRef } from 'react';
import { LevelConfig, GameProgress, GameState, LevelStats, Difficulty } from '../../shared/types/level';
import { getLevelById } from '../../shared/data/levels';

interface LevelManagerState {
  currentLevel: LevelConfig | null;
  gameProgress: GameProgress | null;
  levelStats: Map<string, LevelStats>;
  totalStars: number;
  unlockedPacks: string[];
}

const STORAGE_KEY = 'flowtris-level-stats';
const STARS_KEY = 'flowtris-total-stars';

export const useLevelManager = () => {
  const [state, setState] = useState<LevelManagerState>({
    currentLevel: null,
    gameProgress: null,
    levelStats: new Map(),
    totalStars: 0,
    unlockedPacks: ['tutorial'], // Tutorial pack always unlocked
  });

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedStats = localStorage.getItem(STORAGE_KEY);
    const savedStars = localStorage.getItem(STARS_KEY);
    
    if (savedStats) {
      try {
        const statsArray = JSON.parse(savedStats);
        const statsMap = new Map(statsArray);
        setState(prev => ({ ...prev, levelStats: statsMap }));
      } catch (error) {
        console.error('Failed to load level stats:', error);
      }
    }

    if (savedStars) {
      try {
        const totalStars = parseInt(savedStars, 10);
        setState(prev => ({ ...prev, totalStars }));
      } catch (error) {
        console.error('Failed to load total stars:', error);
      }
    }
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((stats: Map<string, LevelStats>) => {
    const statsArray = Array.from(stats.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statsArray));
  }, []);

  // Save total stars to localStorage
  const saveTotalStars = useCallback((stars: number) => {
    localStorage.setItem(STARS_KEY, stars.toString());
  }, []);

  // Start a new level
  const startLevel = useCallback((levelId: string) => {
    const level = getLevelById(levelId);
    if (!level) {
      console.error(`Level ${levelId} not found`);
      return false;
    }

    const gameProgress: GameProgress = {
      currentLevel: levelId,
      score: 0,
      timeRemaining: level.timeLimit,
      peopleTransported: 0,
      potholesFilled: 0,
      movesUsed: 0,
      starsEarned: 0,
      gameState: 'playing',
      startTime: Date.now(),
    };

    setState(prev => ({
      ...prev,
      currentLevel: level,
      gameProgress,
    }));

    // Start timer if level has time limit
    if (level.timeLimit) {
      gameTimerRef.current = setInterval(() => {
        setState(prev => {
          if (!prev.gameProgress || prev.gameProgress.gameState !== 'playing') {
            return prev;
          }

          const newTimeRemaining = (prev.gameProgress.timeRemaining || 0) - 1;
          
          if (newTimeRemaining <= 0) {
            // Time's up - fail the level
            return {
              ...prev,
              gameProgress: {
                ...prev.gameProgress,
                gameState: 'failed',
                timeRemaining: 0,
                endTime: Date.now(),
              },
            };
          }

          return {
            ...prev,
            gameProgress: {
              ...prev.gameProgress,
              timeRemaining: newTimeRemaining,
            },
          };
        });
      }, 1000);
    }

    return true;
  }, []);

  // Pause the current level
  const pauseLevel = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }

    setState(prev => {
      if (!prev.gameProgress || prev.gameProgress.gameState !== 'playing') {
        return prev;
      }

      return {
        ...prev,
        gameProgress: {
          ...prev.gameProgress,
          gameState: 'paused',
        },
      };
    });
  }, []);

  // Resume the current level
  const resumeLevel = useCallback(() => {
    setState(prev => {
      if (!prev.gameProgress || prev.gameProgress.gameState !== 'paused') {
        return prev;
      }

      const gameProgress = {
        ...prev.gameProgress,
        gameState: 'playing',
      };

      // Restart timer if needed
      if (prev.currentLevel?.timeLimit && gameProgress.timeRemaining && gameProgress.timeRemaining > 0) {
        gameTimerRef.current = setInterval(() => {
          setState(currentState => {
            if (!currentState.gameProgress || currentState.gameProgress.gameState !== 'playing') {
              return currentState;
            }

            const newTimeRemaining = (currentState.gameProgress.timeRemaining || 0) - 1;
            
            if (newTimeRemaining <= 0) {
              return {
                ...currentState,
                gameProgress: {
                  ...currentState.gameProgress,
                  gameState: 'failed',
                  timeRemaining: 0,
                  endTime: Date.now(),
                },
              };
            }

            return {
              ...currentState,
              gameProgress: {
                ...currentState.gameProgress,
                timeRemaining: newTimeRemaining,
              },
            };
          });
        }, 1000);
      }

      return {
        ...prev,
        gameProgress,
      };
    });
  }, []);

  // Complete the current level
  const completeLevel = useCallback((finalScore: number, peopleTransported: number, potholesFilled: number) => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }

    setState(prev => {
      if (!prev.currentLevel || !prev.gameProgress) {
        return prev;
      }

      const { currentLevel, gameProgress } = prev;
      const endTime = Date.now();
      const totalTime = endTime - gameProgress.startTime;
      
      // Calculate stars based on performance
      let starsEarned = 0;
      const objectives = currentLevel.objectives;
      
      // Base star for completing
      if (peopleTransported >= objectives.peopleToTransport) {
        starsEarned = 1;
      }
      
      // Second star for efficiency (time or moves)
      if (currentLevel.timeLimit) {
        const timeUsed = totalTime / 1000;
        const timeEfficiency = timeUsed / currentLevel.timeLimit;
        if (timeEfficiency < 0.7) starsEarned = 2; // Used less than 70% of time
      } else if (objectives.maxMoves && gameProgress.movesUsed <= objectives.maxMoves) {
        starsEarned = 2; // Used moves efficiently
      }
      
      // Third star for bonus objectives
      if (potholesFilled >= (objectives.potholesToFill || 0) && starsEarned >= 2) {
        starsEarned = 3;
      }

      const newGameProgress: GameProgress = {
        ...gameProgress,
        score: finalScore,
        peopleTransported,
        potholesFilled,
        starsEarned,
        gameState: 'completed',
        endTime,
      };

      // Update level stats
      const levelId = currentLevel.id;
      const existingStats = prev.levelStats.get(levelId) || {
        levelId,
        bestScore: 0,
        bestTime: undefined,
        starsEarned: 0,
        completed: false,
        attempts: 0,
        lastPlayed: 0,
      };

      const newStats: LevelStats = {
        ...existingStats,
        bestScore: Math.max(existingStats.bestScore, finalScore),
        bestTime: currentLevel.timeLimit 
          ? Math.min(existingStats.bestTime || Infinity, totalTime / 1000)
          : existingStats.bestTime,
        starsEarned: Math.max(existingStats.starsEarned, starsEarned),
        completed: true,
        attempts: existingStats.attempts + 1,
        lastPlayed: endTime,
      };

      const newLevelStats = new Map(prev.levelStats);
      newLevelStats.set(levelId, newStats);

      // Calculate new total stars
      const newTotalStars = Array.from(newLevelStats.values())
        .reduce((total, stats) => total + stats.starsEarned, 0);

      // Save to localStorage
      saveStats(newLevelStats);
      saveTotalStars(newTotalStars);

      return {
        ...prev,
        gameProgress: newGameProgress,
        levelStats: newLevelStats,
        totalStars: newTotalStars,
      };
    });
  }, [saveStats, saveTotalStars]);

  // Fail the current level
  const failLevel = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }

    setState(prev => {
      if (!prev.currentLevel || !prev.gameProgress) {
        return prev;
      }

      const newGameProgress: GameProgress = {
        ...prev.gameProgress,
        gameState: 'failed',
        endTime: Date.now(),
      };

      // Update attempts count
      const levelId = prev.currentLevel.id;
      const existingStats = prev.levelStats.get(levelId) || {
        levelId,
        bestScore: 0,
        bestTime: undefined,
        starsEarned: 0,
        completed: false,
        attempts: 0,
        lastPlayed: 0,
      };

      const newStats: LevelStats = {
        ...existingStats,
        attempts: existingStats.attempts + 1,
        lastPlayed: Date.now(),
      };

      const newLevelStats = new Map(prev.levelStats);
      newLevelStats.set(levelId, newStats);

      saveStats(newLevelStats);

      return {
        ...prev,
        gameProgress: newGameProgress,
        levelStats: newLevelStats,
      };
    });
  }, [saveStats]);

  // Return to menu
  const returnToMenu = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }

    setState(prev => ({
      ...prev,
      currentLevel: null,
      gameProgress: null,
    }));
  }, []);

  // Update game progress
  const updateProgress = useCallback((updates: Partial<GameProgress>) => {
    setState(prev => {
      if (!prev.gameProgress) return prev;

      return {
        ...prev,
        gameProgress: {
          ...prev.gameProgress,
          ...updates,
        },
      };
    });
  }, []);

  // Get level stats
  const getLevelStats = useCallback((levelId: string): LevelStats | undefined => {
    return state.levelStats.get(levelId);
  }, [state.levelStats]);

  // Check if level is unlocked
  const isLevelUnlocked = useCallback((levelId: string): boolean => {
    const level = getLevelById(levelId);
    if (!level) return false;

    // Tutorial levels are always unlocked
    if (level.difficulty === 'easy') return true;

    // Check if previous levels in the same difficulty are completed
    const sameDifficultyLevels = state.levelStats;
    // This is a simplified check - in a real implementation, you'd check prerequisites
    return true; // For now, all levels are unlocked
  }, [state.levelStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    currentLevel: state.currentLevel,
    gameProgress: state.gameProgress,
    totalStars: state.totalStars,
    levelStats: state.levelStats,
    
    // Actions
    startLevel,
    pauseLevel,
    resumeLevel,
    completeLevel,
    failLevel,
    returnToMenu,
    updateProgress,
    
    // Getters
    getLevelStats,
    isLevelUnlocked,
  };
};
