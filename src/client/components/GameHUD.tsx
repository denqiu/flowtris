import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Pause,
  PlayArrow,
  Home,
  People,
  Construction,
  Timer,
  Star,
  Score,
} from '@mui/icons-material';
import { GameProgress, GameState } from '../../shared/types/level';
import { renderIcon } from '../utils/Icons';

interface GameHUDProps {
  gameProgress: GameProgress;
  onPause: () => void;
  onResume: () => void;
  onReturnToMenu: () => void;
  gameState: GameState;
}

const GameHUD: React.FC<GameHUDProps> = ({
  gameProgress,
  onPause,
  onResume,
  onReturnToMenu,
  gameState,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (timeRemaining?: number, timeLimit?: number): 'primary' | 'success' | 'warning' | 'error' => {
    if (!timeRemaining || !timeLimit) return 'primary';
    
    const percentage = timeRemaining / timeLimit;
    if (percentage > 0.5) return 'success';
    if (percentage > 0.25) return 'warning';
    return 'error';
  };

  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box sx={{ p: 2, maxWidth: '1200px', margin: '0 auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {/* Game State Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Return to Menu">
              <IconButton onClick={onReturnToMenu} color="primary">
                <Home />
              </IconButton>
            </Tooltip>
            
            {gameState === 'playing' && (
              <Tooltip title="Pause Game">
                <IconButton onClick={onPause} color="primary">
                  <Pause />
                </IconButton>
              </Tooltip>
            )}
            
            {gameState === 'paused' && (
              <Tooltip title="Resume Game">
                <IconButton onClick={onResume} color="primary">
                  <PlayArrow />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Game Title */}
          <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold' }}>
            Flowtris
          </Typography>

          {/* Score */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Score color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {gameProgress.score.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Progress Bars */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {/* People Transport Progress */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <People fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  People Transported
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {gameProgress.peopleTransported} / {gameProgress.currentLevel ? 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (gameProgress.currentLevel as any).objectives?.peopleToTransport || 0 : 0}
              </Typography>
            </Box>
      <LinearProgress
              variant="determinate"
              value={gameProgress.currentLevel ? 
                getProgressPercentage(
                  gameProgress.peopleTransported,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (gameProgress.currentLevel as any).objectives?.peopleToTransport || 1
                ) : 0
              }
        sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: 'var(--color-transport)' } }}
            />
          </Box>

          {/* Potholes Filled Progress */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {renderIcon('POTHOLE')}
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Potholes Filled
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {gameProgress.potholesFilled} / {gameProgress.currentLevel ? 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (gameProgress.currentLevel as any).objectives?.potholesToFill || 0 : 0}
              </Typography>
            </Box>
      <LinearProgress
              variant="determinate"
              value={gameProgress.currentLevel ? 
                getProgressPercentage(
                  gameProgress.potholesFilled,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (gameProgress.currentLevel as any).objectives?.potholesToFill || 1
                ) : 0
              }
        sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: 'var(--color-pothole)' } }}
            />
          </Box>
        </Box>

        {/* Bottom Info Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Time Remaining */}
          {gameProgress.timeRemaining !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer color={getTimeColor(gameProgress.timeRemaining, gameProgress.currentLevel ? 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (gameProgress.currentLevel as any).timeLimit : undefined)} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: getTimeColor(gameProgress.timeRemaining, gameProgress.currentLevel ? 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (gameProgress.currentLevel as any).timeLimit : undefined) === 'error' ? 'error.main' : 'text.primary'
                }}
              >
                {formatTime(gameProgress.timeRemaining)}
              </Typography>
            </Box>
          )}

          {/* Game State Indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Moves Left (Hints) */}
              <Typography variant="body2" color="text.secondary">
                Moves left: {gameProgress.movesLeft === null || gameProgress.movesLeft === undefined ? '∞' : gameProgress.movesLeft}
              </Typography>
            </Box>

          {/* Stars Earned */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Stars:
            </Typography>
            {Array.from({ length: 3 }, (_, index) => (
              <Star
                key={index}
                sx={{
                  color: index < gameProgress.starsEarned ? '#ffd700' : '#e0e0e0',
                  fontSize: '1.2rem',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GameHUD;

