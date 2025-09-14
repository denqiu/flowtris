import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Star,
  StarBorder,
  Lock,
  Timer,
  People,
  Construction,
  Info,
} from '@mui/icons-material';
import { LevelConfig, LevelPack, LevelStats, Difficulty } from '../../shared/types/level';
import { LEVEL_PACKS, getLevelsByPack } from '../../shared/data/levels';

interface LevelSelectorProps {
  onLevelSelect: (levelId: string) => void;
  levelStats: Map<string, LevelStats>;
  totalStars: number;
  isLevelUnlocked: (levelId: string) => boolean;
  selectedPack?: string;
  setSelectedPack?: (packId: string) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  onLevelSelect,
  levelStats,
  totalStars,
  selectedPack,
  isLevelUnlocked,
  setSelectedPack,
}) => {
  const [internalSelectedPack, setInternalSelectedPack] = useState<string>(selectedPack || 'tutorial');
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null);
  const [levelDetailsOpen, setLevelDetailsOpen] = useState(false);

  const getDifficultyColor = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      case 'endless': return '#9c27b0';
      default: return '#757575';
    }
  };

  const getDifficultyIcon = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      case 'endless': return '🟣';
      default: return '⚪';
    }
  };

  const renderStars = (stars: number, maxStars: number = 3) => {
    return Array.from({ length: maxStars }, (_, index) => (
      <Star
        key={index}
        sx={{
          color: index < stars ? '#ffd700' : '#e0e0e0',
          fontSize: '1.2rem',
        }}
      />
    ));
  };

  const handleLevelClick = (level: LevelConfig) => {
    if (!isLevelUnlocked(level.id)) return;
    
    setSelectedLevel(level);
    setLevelDetailsOpen(true);
  };

  const handleStartLevel = () => {
    if (selectedLevel) {
      onLevelSelect(selectedLevel.id);
      setLevelDetailsOpen(false);
    }
  };

  const getUnlockedPacks = (): LevelPack[] => {
    return LEVEL_PACKS.filter(pack => pack.requiredStars <= totalStars);
  };

  const getLevelsForPack = (packId: string): LevelConfig[] => {
    return getLevelsByPack(packId);
  };

  const getLevelProgress = (levelId: string): { completed: boolean; stars: number; bestScore: number } => {
    const stats = levelStats.get(levelId);
    return {
      completed: stats?.completed || false,
      stars: stats?.starsEarned || 0,
      bestScore: stats?.bestScore || 0,
    };
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Select Level
      </Typography>
      
      <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
        Total Stars: {totalStars} ⭐
      </Typography>

      {/* Pack Selection */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Level Packs
        </Typography>
        <Grid container spacing={2}>
          {getUnlockedPacks().map((pack) => (
            <Grid item xs={12} sm={6} md={3} key={pack.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: internalSelectedPack === pack.id ? 2 : 1,
                  borderColor: internalSelectedPack === pack.id ? 'primary.main' : 'divider',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
                onClick={() => {
                  setInternalSelectedPack(pack.id);
                  if (setSelectedPack) setSelectedPack(pack.id);
                }}
              >
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {pack.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {pack.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography variant="body2">
                      {pack.levels.length} levels
                    </Typography>
                    <Chip
                      label={`${pack.requiredStars}⭐`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Level Grid */}
      <Box>
        <Typography variant="h6" gutterBottom>
          {LEVEL_PACKS.find(pack => pack.id === internalSelectedPack)?.name} Levels
        </Typography>
        <Grid container spacing={2}>
          {getLevelsForPack(internalSelectedPack).map((level) => {
            const progress = getLevelProgress(level.id);
            const unlocked = isLevelUnlocked(level.id);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={level.id}>
                <Card
                  sx={{
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    opacity: unlocked ? 1 : 0.6,
                    border: progress.completed ? 2 : 1,
                    borderColor: progress.completed ? 'success.main' : 'divider',
                    '&:hover': unlocked ? {
                      boxShadow: 4,
                    } : {},
                  }}
                  onClick={() => handleLevelClick(level)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h3">
                        {level.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {unlocked ? (
                          <PlayArrow color="primary" />
                        ) : (
                          <Lock color="disabled" />
                        )}
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {level.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={level.difficulty}
                        size="small"
                        sx={{
                          backgroundColor: getDifficultyColor(level.difficulty),
                          color: 'white',
                        }}
                      />
                      <Typography variant="body2">
                        {getDifficultyIcon(level.difficulty)}
                      </Typography>
                    </Box>

                    {/* Level Stats */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <People fontSize="small" />
                          <Typography variant="body2">
                            {level.objectives.peopleToTransport}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {progress.completed ? progress.stars + ' stars' : `0`}
                        </Typography>
                      {level.objectives.potholesToFill && level.objectives.potholesToFill > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Construction fontSize="small" />
                          <Typography variant="body2">
                            {level.objectives.potholesToFill}
                          </Typography>
                        </Box>
                      )}
                      {level.timeLimit && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Timer fontSize="small" />
                          <Typography variant="body2">
                            {level.timeLimit}s
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Stars */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {renderStars(progress.stars)}
                      {progress.bestScore > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          Best: {progress.bestScore}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Level Details Dialog */}
      <Dialog
        open={levelDetailsOpen}
        onClose={() => setLevelDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedLevel?.name}
          <IconButton
            aria-label="info"
            sx={{ ml: 1 }}
          >
            <Info />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedLevel && (
            <Box>
              <Typography variant="body1" gutterBottom>
                {selectedLevel.description}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Objectives
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People />
                    <Typography>Transport {selectedLevel.objectives.peopleToTransport} people</Typography>
                  </Box>
                  {selectedLevel.objectives.potholesToFill && selectedLevel.objectives.potholesToFill > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Construction />
                      <Typography>Fill {selectedLevel.objectives.potholesToFill} potholes</Typography>
                    </Box>
                  )}
                  {selectedLevel.objectives.maxMoves && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>Use maximum {selectedLevel.objectives.maxMoves} moves</Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Level Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>Grid Size: {selectedLevel.gridProps.rows} × {selectedLevel.gridProps.columns}</Typography>
                  <Typography>Difficulty: {selectedLevel.difficulty}</Typography>
                  <Typography>Mode: {selectedLevel.gameMode}</Typography>
                  {selectedLevel.timeLimit && (
                    <Typography>Time Limit: {selectedLevel.timeLimit} seconds</Typography>
                  )}
                  {selectedLevel.sandtrixTimeLimit && (
                    <Typography>Sandtrix Time: {selectedLevel.sandtrixTimeLimit} seconds</Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Rewards
                </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography>Stars:</Typography>
                      {renderStars(getLevelProgress(selectedLevel.id).stars, selectedLevel.rewards.stars)}
                    </Box>
                    <Typography variant="body2" color="text.secondary">Best: {getLevelProgress(selectedLevel.id).bestScore || 0}</Typography>
                  </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLevelDetailsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleStartLevel}
            variant="contained"
            startIcon={<PlayArrow />}
          >
            Start Level
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LevelSelector;

