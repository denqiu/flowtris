import { LevelConfig, LevelPack, Difficulty, GameMode } from '../types/level';

// Predefined level configurations
export const LEVELS: LevelConfig[] = [
  // Easy Levels
  {
    id: 'easy-1',
    name: 'First Steps',
    description: 'Learn the basics of road planning',
    difficulty: 'easy',
    gameMode: 'unlimited',
    gridSize: { rows: 6, columns: 8 },
    objectives: {
      peopleToTransport: 3,
      potholesToFill: 0,
    },
    potholePattern: 'none',
    potholeCount: 0,
    rewards: { points: 100, stars: 1 },
  },
  {
    id: 'easy-2',
    name: 'Pothole Patrol',
    description: 'Fill your first pothole',
    difficulty: 'easy',
    gameMode: 'unlimited',
    gridSize: { rows: 6, columns: 8 },
    objectives: {
      peopleToTransport: 2,
      potholesToFill: 1,
    },
    potholePattern: 'fixed',
    potholeCount: 1,
    sandtrixTimeLimit: 30,
    rewards: { points: 150, stars: 1 },
  },
  {
    id: 'easy-3',
    name: 'Time Pressure',
    description: 'Complete the route in time',
    difficulty: 'easy',
    gameMode: 'timed',
    timeLimit: 60,
    gridSize: { rows: 6, columns: 8 },
    objectives: {
      peopleToTransport: 4,
      potholesToFill: 1,
    },
    potholePattern: 'random',
    potholeCount: 2,
    sandtrixTimeLimit: 20,
    rewards: { points: 200, stars: 2 },
  },

  // Medium Levels
  {
    id: 'medium-1',
    name: 'City Rush',
    description: 'Navigate through a busy city',
    difficulty: 'medium',
    gameMode: 'timed',
    timeLimit: 90,
    gridSize: { rows: 8, columns: 10 },
    objectives: {
      peopleToTransport: 6,
      potholesToFill: 3,
      maxMoves: 15,
    },
    potholePattern: 'random',
    potholeCount: 4,
    sandtrixTimeLimit: 25,
    rewards: { points: 300, stars: 2 },
  },
  {
    id: 'medium-2',
    name: 'Highway Challenge',
    description: 'Master the fast lane',
    difficulty: 'medium',
    gameMode: 'timed',
    timeLimit: 120,
    gridSize: { rows: 8, columns: 12 },
    objectives: {
      peopleToTransport: 8,
      potholesToFill: 5,
      maxMoves: 20,
    },
    potholePattern: 'random',
    potholeCount: 6,
    sandtrixTimeLimit: 20,
    rewards: { points: 400, stars: 3 },
  },

  // Hard Levels
  {
    id: 'hard-1',
    name: 'Autobahn Master',
    description: 'The ultimate test of your skills',
    difficulty: 'hard',
    gameMode: 'timed',
    timeLimit: 150,
    gridSize: { rows: 10, columns: 12 },
    objectives: {
      peopleToTransport: 12,
      potholesToFill: 8,
      maxMoves: 25,
    },
    potholePattern: 'random',
    potholeCount: 10,
    sandtrixTimeLimit: 15,
    rewards: { points: 600, stars: 3 },
  },
  {
    id: 'hard-2',
    name: 'Night Shift',
    description: 'Navigate in the dark with limited visibility',
    difficulty: 'hard',
    gameMode: 'timed',
    timeLimit: 180,
    gridSize: { rows: 12, columns: 14 },
    objectives: {
      peopleToTransport: 15,
      potholesToFill: 12,
      maxMoves: 30,
    },
    potholePattern: 'random',
    potholeCount: 15,
    sandtrixTimeLimit: 12,
    rewards: { points: 800, stars: 3 },
  },

  // Endless Mode
  {
    id: 'endless-1',
    name: 'Endless Journey',
    description: 'See how far you can go!',
    difficulty: 'endless',
    gameMode: 'endless',
    gridSize: { rows: 8, columns: 10 },
    objectives: {
      peopleToTransport: 999, // High number for endless
    },
    potholePattern: 'random',
    potholeCount: 5,
    sandtrixTimeLimit: 20,
    rewards: { points: 0, stars: 0 }, // Dynamic scoring
  },
];

// Level packs for progression
export const LEVEL_PACKS: LevelPack[] = [
  {
    id: 'tutorial',
    name: 'Tutorial Pack',
    description: 'Learn the basics of Flowtris',
    levels: LEVELS.filter(level => level.difficulty === 'easy'),
    unlocked: true,
    requiredStars: 0,
  },
  {
    id: 'city',
    name: 'City Pack',
    description: 'Navigate through urban challenges',
    levels: LEVELS.filter(level => level.difficulty === 'medium'),
    unlocked: false,
    requiredStars: 3, // Need 3 stars from tutorial pack
  },
  {
    id: 'expert',
    name: 'Expert Pack',
    description: 'Master the Autobahn',
    levels: LEVELS.filter(level => level.difficulty === 'hard'),
    unlocked: false,
    requiredStars: 9, // Need 9 stars from previous packs
  },
  {
    id: 'endless',
    name: 'Endless Mode',
    description: 'Unlimited challenges',
    levels: LEVELS.filter(level => level.difficulty === 'endless'),
    unlocked: false,
    requiredStars: 15, // Need 15 stars total
  },
];

// Helper functions
export const getLevelById = (id: string): LevelConfig | undefined => {
  return LEVELS.find(level => level.id === id);
};

export const getLevelsByDifficulty = (difficulty: Difficulty): LevelConfig[] => {
  return LEVELS.filter(level => level.difficulty === difficulty);
};

export const getLevelsByPack = (packId: string): LevelConfig[] => {
  const pack = LEVEL_PACKS.find(pack => pack.id === packId);
  return pack ? pack.levels : [];
};

export const getUnlockedPacks = (totalStars: number): LevelPack[] => {
  return LEVEL_PACKS.filter(pack => pack.requiredStars <= totalStars);
};

