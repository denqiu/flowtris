import { GridProps } from './grid';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'endless';

export type GameMode = 'timed' | 'unlimited' | 'endless';

export type GameState = 'menu' | 'playing' | 'paused' | 'completed' | 'failed';

export interface LevelConfig {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  gameMode: GameMode;
  timeLimit?: number; // in seconds, undefined for unlimited
  gridProps: GridProps;
  objectives: {
    peopleToTransport: number;
    potholesToFill?: number;
    maxMoves?: number;
  };
  potholePattern: 'random' | 'fixed' | 'none';
  potholeCount: number;
  sandtrixTimeLimit?: number; // time for sandtrix mini-game
  rewards: {
    points: number;
    stars: number; // 1-3 stars based on performance
  };
}

export interface GameProgress {
  currentLevel: string;
  score: number;
  timeRemaining?: number;
  peopleTransported: number;
  potholesFilled: number;
  movesUsed: number;
  starsEarned: number;
  gameState: GameState;
  startTime: number;
  endTime?: number;
}

export interface LevelStats {
  levelId: string;
  bestScore: number;
  bestTime?: number;
  starsEarned: number;
  completed: boolean;
  attempts: number;
  lastPlayed: number;
}

export interface LevelPack {
  id: string;
  name: string;
  description: string;
  levels: LevelConfig[];
  unlocked: boolean;
  requiredStars: number; // stars needed to unlock this pack
}

