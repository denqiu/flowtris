import { InitGridProps_A, InitGridProps_B } from '../types/grid';
import { LevelConfig, LevelPack, Difficulty, GameMode } from '../types/level';

// Predefined level configurations.
export const LEVELS: LevelConfig[] = [
  // Easy Levels
  {
    id: 'easy-1',
    name: 'First Steps',
    description: 'Learn the basics of road planning',
    difficulty: 'easy',
    gameMode: 'unlimited',
    gridProps: {
      rows: 6,
      columns: 8,
      obstacles: [
        { iconKey: 'POTHOLE', points: [[2, 3], [4,3], [5,5]] },
        // { iconKey: 'ROAD', points: [[1, 1], [1, 2], [1, 3]], direction: 'east' },
        // { iconKey: 'BUILDING', points: [[0, 0], [0, 7]] }
      ],
      // lanes: {
      //   fast: { startRow: 0, endRow: 2 },
      //   slow: { startRow: 3, endRow: 5 }
      // }
    },
    objectives: {
      peopleToTransport: 3,
      potholesToFill: null,
      maxMoves: null
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
    gridProps: { rows: 6, columns: 8 },
    objectives: {
      peopleToTransport: 2,
      potholesToFill: 1,
      maxMoves: null
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
    gridProps: { rows: 6, columns: 8 },
    objectives: {
      peopleToTransport: 4,
      potholesToFill: 1,
      maxMoves: null
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
    gridProps: { rows: 8, columns: 10 },
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
    gridProps: { 
      rows: 8, 
      columns: 12,
      // obstacles: [
      //   { iconKey: 'ROAD', points: [[1, 0], [1, 1], [1, 2], [1, 3]], direction: 'east' },
      //   { iconKey: 'ROAD', points: [[5, 8], [5, 9], [5, 10], [5, 11]], direction: 'east' },
      //   { iconKey: 'CAR', points: [[1, 0]], direction: 'east', lane: 'fast' },
      //   { iconKey: 'BUS', points: [[5, 8]], direction: 'east', lane: 'slow' },
      //   { iconKey: 'TREE', points: [[0, 6], [7, 6]] }
      // ],
      // lanes: {
      //   fast: { startRow: 0, endRow: 3 },
      //   slow: { startRow: 4, endRow: 7 }
      // }
    },
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
    gridProps: { rows: 10, columns: 12 },
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
    gridProps: { rows: 12, columns: 14 },
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
    gridProps: { rows: 8, columns: 10 },
    objectives: {
      peopleToTransport: 999, // High number for endless
      potholesToFill: null,
      maxMoves: null
    },
    potholePattern: 'random',
    potholeCount: 5,
    sandtrixTimeLimit: 20,
    rewards: { points: 0, stars: 0 }, // Dynamic scoring
  },
];

for (const level of LEVELS) {
  level.gridProps = InitGridProps_B(level.id, level.objectives.potholesToFill || 0, level.gridProps);
}

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

