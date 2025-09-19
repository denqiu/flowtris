
import { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

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
    nextLevelState,
    setNextLevelState,
  } = useLevelManager();

  const [showLevelSelector, setShowLevelSelector] = useState(true);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showFeatureDemo, setShowFeatureDemo] = useState(false);
  const [showNextLevelNotice, setShowNextLevelNotice] = useState(false);

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
      setNextLevel({ nextLevelIndex: nextLevelState.nextIndex + 1 });
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
  const setNextLevel = (props: {nextLevelIndex?: number, packId?: string}) => {
    setNextLevelState(prev => {
      const nextIndex = props.packId ? 0 : (props.nextLevelIndex || prev.nextIndex);
      return {
        ...prev,
        nextIndex: nextIndex,
        // isDisabled: nextIndex === getLevelsByPack(props.packId || selectedPack || 'tutorial').length
        isDisabled: false
      };
    });
    // console.log(props.packId || selectedPack || 'tutorial', nextLevelState, getLevelsByPack(props.packId || selectedPack || 'tutorial').length)
  };

  const handleNextLevel = () => {
    setShowNextLevelNotice(true);
    return;
    if (nextLevelState.isDisabled) {
      return;
    }
    const nextLevel = getLevelsByPack(selectedPack || 'tutorial')[nextLevelState.nextIndex];
    if (nextLevel) {
      handleLevelSelect(nextLevel.id);
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
      const mockScore = gameProgress.score;
      const mockPeople = gameProgress.peopleTransported;
      const mockPotholes = gameProgress.potholeCount;
      
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
        {/* <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
          <Button 
            variant="outlined" 
            onClick={() => setShowFeatureDemo(false)}
            sx={{ mr: 1 }}
          >
            View Feature Demo
          </Button>
        </Box> */}
        <LevelSelector
          onLevelSelect={handleLevelSelect}
          levelStats={levelStats}
          totalStars={totalStars}
          isLevelUnlocked={isLevelUnlocked}
          // keep the UI on the last selected pack if available
          selectedPack={selectedPack}
          setSelectedPack={setSelectedPack}
          setNextLevel={setNextLevel}
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
          currentLevel={currentLevel}
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
              <CityGrid_B 
                gameProgress={gameProgress}
                {...currentLevel.gridProps} 
              />
              {/* <TestCityGrid /> */}
            </Box>

            {/* Demo Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <DemoControls
                onTransportBus={() => updateProgress({ 
                  peopleTransported: gameProgress.peopleTransported + 1,
                  score: gameProgress.score + 100 
                })}
                onTransportCar={() => updateProgress({ 
                  peopleTransported: gameProgress.peopleTransported + 1,
                  score: gameProgress.score + 150 
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
          isNextLevelDisabled={nextLevelState.isDisabled}
          onNextLevel={handleNextLevel}
          onRetry={handleRetryLevel}
          onReturnToMenu={handleReturnToMenu}
        />
        <Dialog
          open={showNextLevelNotice}
          maxWidth="sm"
          fullWidth
          disableEscapeKeyDown
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" component="h1">Notice for Next Level</Typography>
            </Box>
          </DialogTitle>
    
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notice: Next Level logic is not working correctly. Clicking the button will not crash the UI. For now, return to menu to select the next level.
              </Typography>
            </Box>
          </DialogContent>
    
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => setShowNextLevelNotice(false)}
              variant="contained"
              fullWidth
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Fallback
  return <Spinner />;
};
