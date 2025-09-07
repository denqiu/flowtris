# Flowtris Level System

## Overview
The level system provides a comprehensive game progression framework with multiple difficulty modes, time limits, objectives, and star-based scoring.

## Features

### 🎯 Level Types
- **Easy**: Tutorial levels with unlimited time
- **Medium**: Timed levels with moderate complexity
- **Hard**: Challenging levels with strict time limits
- **Endless**: Unlimited gameplay mode

### ⭐ Star System
- **1 Star**: Complete basic objectives
- **2 Stars**: Complete efficiently (time/moves)
- **3 Stars**: Complete all bonus objectives

### 🎮 Game Modes
- **Timed**: Complete within time limit
- **Unlimited**: No time pressure
- **Endless**: Continuous gameplay

### 📊 Progress Tracking
- Persistent level statistics
- Best scores and times
- Star collection
- Level pack unlocking

## Components

### LevelSelector
- Visual level selection interface
- Pack-based organization
- Progress indicators
- Difficulty color coding

### GameHUD
- Real-time game state display
- Progress bars for objectives
- Timer countdown
- Score and star tracking

### LevelCompleteDialog
- Results summary
- Star rating display
- Performance metrics
- Next level/retry options

### useLevelManager Hook
- Game state management
- Timer handling
- Progress tracking
- Local storage persistence

## Level Configuration

Each level includes:
- **Objectives**: People to transport, potholes to fill
- **Constraints**: Time limits, move limits
- **Rewards**: Points and stars
- **Grid Size**: Customizable dimensions
- **Pothole Pattern**: Random, fixed, or none

## Usage

```typescript
// Start a level
const success = startLevel('easy-1');

// Update progress
updateProgress({
  peopleTransported: 5,
  score: 1000
});

// Complete level
completeLevel(finalScore, peopleTransported, potholesFilled);
```

## Data Persistence

- Level statistics saved to localStorage
- Total stars tracked across sessions
- Best scores and times preserved
- Level pack unlock status maintained

## Future Enhancements

- [ ] Level editor for custom levels
- [ ] Achievement system
- [ ] Leaderboards
- [ ] Daily challenges
- [ ] Level sharing
