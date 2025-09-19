import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Star,
  Score,
  Timer,
  People,
  Construction,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { GameProgress, LevelConfig } from '../../shared/types/level';

interface LevelCompleteDialogProps {
  open: boolean;
  gameProgress: GameProgress | null;
  level: LevelConfig | null;
  isNextLevelDisabled: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
  onReturnToMenu: () => void;
}

const LevelCompleteDialog: React.FC<LevelCompleteDialogProps> = ({
  open,
  gameProgress,
  level,
  isNextLevelDisabled,
  onNextLevel,
  onRetry,
  onReturnToMenu,
}) => {
  if (!gameProgress || !level) return null;

  const isCompleted = gameProgress.gameState === 'completed';
  const isFailed = gameProgress.gameState === 'failed';

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeUsed = (): number => {
    if (!gameProgress.startTime || !gameProgress.endTime) return 0;
    return Math.floor((gameProgress.endTime - gameProgress.startTime) / 1000);
  };

  const getEfficiencyRating = (): string => {
    if (!level.timeLimit) return 'N/A';
    
    const timeUsed = getTimeUsed();
    const efficiency = (timeUsed / level.timeLimit) * 100;
    
    if (efficiency < 50) return 'Excellent';
    if (efficiency < 70) return 'Good';
    if (efficiency < 90) return 'Fair';
    return 'Poor';
  };

  const renderStars = (stars: number, maxStars: number = 3) => {
    return Array.from({ length: maxStars }, (_, index) => (
      <Star
        key={index}
        sx={{
          color: index < stars ? '#ffd700' : '#e0e0e0',
          fontSize: '2rem',
        }}
      />
    ));
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isCompleted ? (
            <CheckCircle sx={{ color: 'success.main', fontSize: '2rem' }} />
          ) : (
            <Cancel sx={{ color: 'error.main', fontSize: '2rem' }} />
          )}
          <Typography variant="h4" component="h1">
            {isCompleted ? 'Level Complete!' : 'Level Failed'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Level Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {level.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {level.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Chip
                  label={level.difficulty}
                  color={
                    level.difficulty === 'easy' ? 'success' :
                    level.difficulty === 'medium' ? 'warning' :
                    level.difficulty === 'hard' ? 'error' :
                    'secondary'
                  }
                  size="small"
                />
                <Chip
                  label={level.gameMode}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Score */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Score color="primary" />
                    <Typography>Score</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {gameProgress.score.toLocaleString()}
                  </Typography>
                </Box>

                {/* Stars */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>Stars Earned</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {renderStars(gameProgress.starsEarned)}
                  </Box>
                </Box>

                {/* People Transported */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People fontSize="small" />
                    <Typography>People Transported</Typography>
                  </Box>
                  <Typography>
                    {gameProgress.peopleTransported} / {level.objectives.peopleToTransport}
                  </Typography>
                </Box>

                {/* Potholes Remaining */}
                {level.objectives.potholeCount && level.objectives.potholeCount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Construction fontSize="small" />
                      <Typography>Potholes Remaining</Typography>
                    </Box>
                    <Typography>
                      {gameProgress.potholeCount}
                    </Typography>
                  </Box>
                )}

                {/* Time Used */}
                {level.timeLimit && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Timer fontSize="small" />
                      <Typography>Time Used</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>
                        {formatTime(getTimeUsed())} / {formatTime(level.timeLimit)}
                      </Typography>
                      <Chip
                        label={getEfficiencyRating()}
                        size="small"
                        color={
                          getEfficiencyRating() === 'Excellent' ? 'success' :
                          getEfficiencyRating() === 'Good' ? 'primary' :
                          getEfficiencyRating() === 'Fair' ? 'warning' :
                          'error'
                        }
                      />
                    </Box>
                  </Box>
                )}

                {/* Moves Used */}
                {level.objectives.maxMoves && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>Moves Used</Typography>
                    <Typography>
                      {gameProgress.movesUsed} / {level.objectives.maxMoves}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Progress Bars */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Objectives Progress
            </Typography>
            
            {/* People Transport Progress */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">People Transported</Typography>
                <Typography variant="body2">
                  {gameProgress.peopleTransported} / {level.objectives.peopleToTransport}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(gameProgress.peopleTransported / level.objectives.peopleToTransport) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Potholes Progress */}
            {level.objectives.potholeCount && level.objectives.potholeCount > 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Potholes Remaining</Typography>
                  <Typography variant="body2">
                    {gameProgress.potholeCount}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onReturnToMenu}
          variant="outlined"
          fullWidth
        >
          Return to Menu
        </Button>
        
        {isCompleted ? (
          <Button
            onClick={onNextLevel}
            variant="contained"
            fullWidth
            startIcon={<CheckCircle />}
            disabled={isNextLevelDisabled}
            >
            Next Level
          </Button>
        ) : (
          <Button
            onClick={onRetry}
            variant="contained"
            color="error"
            fullWidth
          >
            Retry Level
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LevelCompleteDialog;

