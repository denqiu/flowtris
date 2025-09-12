import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Card, CardContent } from '@mui/material';
import { PlayArrow, Star, Construction, People } from '@mui/icons-material';
import { useLevelManager } from './hooks/useLevelManager';
import LevelSelector from './components/LevelSelector';
import GameHUD from './components/GameHUD';
import CityGrid from './components/CityGrid';
import LevelCompleteDialog from './components/LevelCompleteDialog';
import { DemoControls } from './components/DemoControls';
import { GameState } from './shared/types/level';

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

  const handleNextLevel = () => {
    // For now, just return to menu. In a real implementation, you'd load the next level
    handleReturnToMenu();
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
      const mockPotholes = currentLevel.objectives.potholesToFill || 0;
      
      completeLevel(mockScore, mockPeople, mockPotholes);
    }
  };

  const handleMockFail = () => {
    failLevel();
  };

  // Show level selector
  if (showLevelSelector) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <LevelSelector
          onLevelSelect={handleLevelSelect}
          levelStats={levelStats}
          totalStars={totalStars}
          isLevelUnlocked={isLevelUnlocked}
          // keep the UI on the last selected pack if available
          selectedPack={selectedPack}
          setSelectedPack={setSelectedPack}
        />
      </Box>
    );
  }

  // Show game interface
  if (currentLevel && gameProgress) {
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
              <CityGrid
                rows={currentLevel.gridSize.rows}
                columns={currentLevel.gridSize.columns}
              />
            </Box>

            {/* Demo Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <DemoControls
                onTransportPerson={() => updateProgress({ 
                  peopleTransported: gameProgress.peopleTransported + 1,
                  score: gameProgress.score + 100 
                })}
                onFillPothole={() => updateProgress({ 
                  potholesFilled: gameProgress.potholesFilled + 1,
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
                disablePothole={currentLevel ? (currentLevel.objectives.potholesToFill ? gameProgress.potholesFilled >= currentLevel.objectives.potholesToFill : false) : false}
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
      <Typography variant="h6">Loading...</Typography>
    </Box>
  );
};
