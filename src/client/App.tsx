import { navigateTo } from '@devvit/web/client';
import { useCounter } from './hooks/useCounter';
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Card, CardContent } from '@mui/material';
import { PlayArrow, Star, Construction, People } from '@mui/icons-material';
import { useLevelManager } from './hooks/useLevelManager';
import LevelSelector from './components/LevelSelector';
import GameHUD from './components/GameHUD';
import { CityGrid_A, CityGrid_B, TestCityGrid } from './components/CityGrid';
import Spinner from './components/Spinner';
import LevelCompleteDialog from './components/LevelCompleteDialog';
import { DemoControls } from './components/DemoControls';
import FeatureDemo from './components/FeatureDemo';
import { LevelConfig } from '../shared/types/level';
import { getLevelsByPack } from '../shared/data/levels';

export const App = () => {
  const {
    currentLevel,
    gameProgress,
    totalStars,
    levelStats,
    startLevel,
    pauseLevel,
    resumeLevel,
    completeLevel,
    failLevel,
    returnToMenu,
    updateProgress,
    getLevelStats,
    isLevelUnlocked,
  selectedPack,
  setSelectedPack,
  } = useLevelManager();

  const [showLevelSelector, setShowLevelSelector] = useState(true);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showFeatureDemo, setShowFeatureDemo] = useState(false);

  // Moved LevelSelector state vars to App to make Next Level button work properly.
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig | undefined>(undefined);
  const [internalSelectedPack, setInternalSelectedPack] = useState<string>('tutorial');
  // New level state var for Next Level button
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(0);

  // Show completion dialog when level is completed or failed
  useEffect(() => {
    if (gameProgress && (gameProgress.gameState === 'completed' || gameProgress.gameState === 'failed')) {
      setShowCompletionDialog(true);
    }
  }, [gameProgress]);

  const handleLevelSelect = (levelId: string) => {
    const success = startLevel(levelId);
    if (success) {
      setShowLevelSelector(false);
      setShowCompletionDialog(false);
    }
  };

  const handleReturnToMenu = () => {
    returnToMenu();
    setShowLevelSelector(true);
    setShowCompletionDialog(false);
  };

  const handlePause = () => {
    pauseLevel();
  };

  const handleResume = () => {
    resumeLevel();
  };

  /**
   * Increment level index and load from the pack.
   * 
   * Doesn't check if level index is out of bounds. That is handled by completion dialog, which disables Next Level button if index === pack.length - 1.
   * 
   * References:
   * @link {https://stackoverflow.com/questions/64311416/whats-the-difference-between-setcountprev-prev-1-and-setcountcount-1}
   */
  const handleNextLevel = () => {
    setSelectedLevelIndex(selectedLevelIndex + 1);
    setSelectedLevel(getLevelsByPack(internalSelectedPack)[selectedLevelIndex]);
    if (selectedLevel) {
      handleLevelSelect(selectedLevel.id);
    }
  };

  const handleRetryLevel = () => {
    if (currentLevel) {
      startLevel(currentLevel.id);
      setShowCompletionDialog(false);
    }
  };

  // Mock game actions for demonstration
  const handleMockComplete = () => {
    if (currentLevel && gameProgress) {
      const mockScore = Math.floor(Math.random() * 1000) + 500;
      const mockPeople = currentLevel.objectives.peopleToTransport;
      const mockPotholes = currentLevel.objectives.potholeCount || 0;
      
      completeLevel(mockScore, mockPeople, mockPotholes);
    }
  };

  const handleMockFail = () => {
    failLevel();
  };

  // Show feature demo
  if (showFeatureDemo) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <FeatureDemo />
        <Box sx={{ position: 'fixed', top: 16, left: 16 }}>
          <Button 
            variant="contained" 
            onClick={() => setShowFeatureDemo(false)}
          >
            Back to Game
          </Button>
        </Box>
      </Box>
    );
  }

  // Show level selector
  if (showLevelSelector) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
          <Button 
            variant="outlined" 
            onClick={() => setShowFeatureDemo(true)}
            sx={{ mr: 1 }}
          >
            View Feature Demo
          </Button>
        </Box>
        <LevelSelector
          onLevelSelect={handleLevelSelect}
          levelStats={levelStats}
          totalStars={totalStars}
          isLevelUnlocked={isLevelUnlocked}
          // keep the UI on the last selected pack if available
          selectedPack={selectedPack}
          setSelectedPack={setSelectedPack}
          // State vars moved to App for Next Level button
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          internalSelectedPack={internalSelectedPack}
          setInternalSelectedPack={setInternalSelectedPack}
          // New state var for Next Level button. Only need to pass setter, no need to pass getter.
          setSelectedLevelIndex={setSelectedLevelIndex}
        />
      </Box>
    );
  }

  // Show game interface
  if (currentLevel && gameProgress) {
    currentLevel.gridProps.gameProgress = gameProgress;
  return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <GameHUD
          gameProgress={gameProgress}
          onPause={handlePause}
          onResume={handleResume}
          onReturnToMenu={handleReturnToMenu}
          gameState={gameProgress.gameState}
        />
        
        {/* Game Area */}
        <Box sx={{ pt: 12, pb: 4 }}>
          <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" align="center" gutterBottom>
                {currentLevel.name}
              </Typography>
              <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
                {currentLevel.description}
              </Typography>
            </Box>

            {/* Game Grid */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <CityGrid_B {...currentLevel.gridProps} />
              {/* <TestCityGrid /> */}
            </Box>

            {/* Demo Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <DemoControls
                onTransportPerson={() => updateProgress({ 
                  peopleTransported: gameProgress.peopleTransported + 1,
                  score: gameProgress.score + 100 
                })}
                onFillPothole={() => updateProgress({ 
                  potholeCount: gameProgress.potholeCount - 1,
                  score: gameProgress.score + 50 
                })}
                onUseMove={() => {
                  // treat as hint: decrement movesLeft if limited and increment movesUsed
                  const movesLeft = gameProgress.movesLeft ?? null;
                  if (movesLeft === null) {
                    updateProgress({ movesUsed: gameProgress.movesUsed + 1 });
                  } else if (movesLeft > 0) {
                    updateProgress({ movesUsed: gameProgress.movesUsed + 1, movesLeft: movesLeft - 1 });
                  }
                }}
                onComplete={handleMockComplete}
                onFail={handleMockFail}
                disableTransport={currentLevel ? gameProgress.peopleTransported >= currentLevel.objectives.peopleToTransport : false}
                disablePothole={currentLevel ? gameProgress.potholeCount === 0 : false}
              />
            </Box>

            {/* Removed redundant Current Game State card - GameHUD displays this info */}
          </Container>
        </Box>

        {/* Level Completion Dialog */}
        <LevelCompleteDialog
          open={showCompletionDialog}
          gameProgress={gameProgress}
          level={currentLevel}
          isNextLevelDisabled={() => selectedLevelIndex === getLevelsByPack(internalSelectedPack).length - 1}
          onNextLevel={handleNextLevel}
          onRetry={handleRetryLevel}
          onReturnToMenu={handleReturnToMenu}
        />
      </Box>
    );
  }

  // Fallback
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </Box>
  );
};
