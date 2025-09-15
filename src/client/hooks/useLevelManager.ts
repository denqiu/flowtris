import { useState, useCallback, useEffect, useRef } from 'react';
import { LevelConfig, GameProgress, GameState, LevelStats, Difficulty } from '../../shared/types/level';
import { getLevelById } from '../../shared/data/levels';

interface LevelManagerState {
  currentLevel: LevelConfig | null;
  gameProgress: GameProgress | null;
  levelStats: Map<string, LevelStats>;
  totalStars: number;
  unlockedPacks: string[];
  selectedPack?: string;
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
    selectedPack: 'tutorial',
  });

  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedStats = localStorage.getItem(STORAGE_KEY);
    const savedStars = localStorage.getItem(STARS_KEY);
    
    if (savedStats) {
      try {
        const statsArray = JSON.parse(savedStats) as [string, LevelStats][];
        const statsMap = new Map<string, LevelStats>(statsArray);
        setState(prev => ({ ...prev, levelStats: statsMap } as LevelManagerState));
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

    // Clear any existing timer before starting new level
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }

    const baseProgress: Partial<GameProgress> = {
      currentLevel: levelId,
      score: 0,
      peopleTransported: 0,
      potholeCount: level.objectives.potholeCount || 0,
      movesUsed: 0,
      // initialize movesLeft from objectives.maxMoves (null = unlimited)
      movesLeft: level.objectives?.maxMoves ?? null,
      starsEarned: 0,
      gameState: 'playing',
      startTime: Date.now(),
    };

    const gameProgress: GameProgress = {
      ...(baseProgress as GameProgress),
      ...(level.timeLimit ? { timeRemaining: level.timeLimit } : {}),
    } as GameProgress;

    setState(prev => ({
      ...prev,
      currentLevel: level,
      gameProgress,
    } as LevelManagerState));

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
  const completeLevel = useCallback((finalScore: number, peopleTransported: number, potholeCount: number) => {
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
      if (potholeCount === 0 && starsEarned >= 2) {
        starsEarned = 3;
      }

      const newGameProgress: GameProgress = {
        ...gameProgress,
        score: finalScore,
        peopleTransported,
        potholeCount,
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

      return ({
        ...prev,
        gameProgress: newGameProgress,
        levelStats: newLevelStats,
        totalStars: newTotalStars,
        // persist last selected pack to keep user on same pack after completing
        selectedPack: currentLevel ? (currentLevel.difficulty === 'easy' ? 'tutorial' : (currentLevel.difficulty === 'medium' ? 'city' : (currentLevel.difficulty === 'hard' ? 'expert' : 'endless'))) : prev.selectedPack,
      } as LevelManagerState);
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
      // keep selectedPack as-is so UI can return to same pack
      selectedPack: prev.selectedPack,
    } as LevelManagerState));
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

  const setSelectedPack = useCallback((packId: string) => {
    setState(prev => ({ ...prev, selectedPack: packId } as LevelManagerState));
  }, []);

  return {
    // State
    currentLevel: state.currentLevel,
    gameProgress: state.gameProgress,
    totalStars: state.totalStars,
    levelStats: state.levelStats,
  selectedPack: state.selectedPack,
    
    // Actions
    startLevel,
    pauseLevel,
    resumeLevel,
    completeLevel,
    failLevel,
    returnToMenu,
    updateProgress,
  setSelectedPack,
    
    // Getters
    getLevelStats,
    isLevelUnlocked,
  };
};

