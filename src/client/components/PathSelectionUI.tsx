import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  Route as RouteIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { PathMovesCalculation } from '../../shared/types/grid';

export interface PathOption {
  id: string;
  name: string;
  path: [number, number][];
  vehicleType: 'car' | 'bus';
  moves: PathMovesCalculation;
  color: string;
  description?: string;
}

export interface PathSelectionUIProps {
  availablePaths: PathOption[];
  selectedPathId: string | null;
  onPathSelect: (pathId: string) => void;
  onStartAnimation: (pathId: string) => void;
  maxMoves: number | null;
  currentMoves: number;
  disabled?: boolean;
}

/**
 * Algorithm B: Player Path Selection UI
 * Gives players manual control over path selection and execution
 */
export const PathSelectionUI: React.FC<PathSelectionUIProps> = ({
  availablePaths,
  selectedPathId,
  onPathSelect,
  onStartAnimation,
  maxMoves,
  currentMoves,
  disabled = false
}) => {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const getPathViability = (moves: PathMovesCalculation) => {
    if (maxMoves === null) {
      return { viable: true, percentage: 100, status: 'unlimited' };
    }
    
    const remainingMoves = maxMoves - currentMoves;
    const viable = moves.estimatedMoves <= remainingMoves;
    const percentage = (remainingMoves / maxMoves) * 100;
    
    return {
      viable,
      percentage,
      status: viable ? 'viable' : 'over-limit'
    };
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 0.8) return '#4caf50'; // Green
    if (efficiency >= 0.6) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const selectedPath = availablePaths.find(p => p.id === selectedPathId);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Path Selection & Control
      </Typography>
      
      {/* Current Status */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle2" color="text.secondary">
          Current Status
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
          <Typography variant="body2">
            Moves Used: {currentMoves} {maxMoves && `/ ${maxMoves}`}
          </Typography>
          {maxMoves && (
            <LinearProgress 
              variant="determinate" 
              value={(currentMoves / maxMoves) * 100}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
            />
          )}
        </Box>
      </Paper>

      {/* Path Options */}
      <Typography variant="subtitle1" gutterBottom>
        Available Paths
      </Typography>
      
      <List sx={{ mb: 2 }}>
        {availablePaths.map((pathOption) => {
          const viability = getPathViability(pathOption.moves);
          const isSelected = pathOption.id === selectedPathId;
          const isHovered = pathOption.id === hoveredPath;
          
          return (
            <ListItem key={pathOption.id} disablePadding sx={{ mb: 1 }}>
              <Card 
                sx={{ 
                  width: '100%',
                  border: isSelected ? `2px solid ${pathOption.color}` : '1px solid #e0e0e0',
                  bgcolor: isHovered ? '#f8f9fa' : 'white',
                  opacity: disabled ? 0.6 : 1
                }}
              >
                <ListItemButton
                  onClick={() => !disabled && onPathSelect(pathOption.id)}
                  disabled={disabled}
                  onMouseEnter={() => setHoveredPath(pathOption.id)}
                  onMouseLeave={() => setHoveredPath(null)}
                >
                  <CardContent sx={{ width: '100%', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip
                        icon={<RouteIcon />}
                        label={pathOption.name}
                        size="small"
                        sx={{ 
                          bgcolor: pathOption.color,
                          color: 'white',
                          mr: 1
                        }}
                      />
                      <Chip
                        label={pathOption.vehicleType}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      {!viability.viable && (
                        <Chip
                          label="Over Limit"
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                      {isSelected && (
                        <CheckIcon color="primary" sx={{ ml: 'auto' }} />
                      )}
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 1 }}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Est. Moves
                          </Typography>
                          <Typography variant="h6" color={viability.viable ? 'text.primary' : 'error.main'}>
                            {pathOption.moves.estimatedMoves}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Efficiency
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ color: getEfficiencyColor(pathOption.moves.efficiency) }}
                          >
                            {(pathOption.moves.efficiency * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Distance
                          </Typography>
                          <Typography variant="h6">
                            {pathOption.moves.pathLength}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Move Breakdown */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<TimelineIcon />}
                        label={`${pathOption.moves.moveBreakdown.navigationMoves} nav`}
                        size="small"
                        variant="outlined"
                      />
                      {pathOption.moves.moveBreakdown.potholeRepairs > 0 && (
                        <Chip
                          label={`${pathOption.moves.moveBreakdown.potholeRepairs} potholes`}
                          size="small"
                          variant="outlined"
                          color="warning"
                        />
                      )}
                      {pathOption.moves.moveBreakdown.peoplePickup > 0 && (
                        <Chip
                          label={`${pathOption.moves.moveBreakdown.peoplePickup} people`}
                          size="small"
                          variant="outlined"
                          color="info"
                        />
                      )}
                    </Box>

                    {pathOption.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {pathOption.description}
                      </Typography>
                    )}
                  </CardContent>
                </ListItemButton>
              </Card>
            </ListItem>
          );
        })}
      </List>

      {/* Action Buttons */}
      {selectedPath && (
        <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Path: {selectedPath.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SpeedIcon />}
              onClick={() => onStartAnimation(selectedPath.id)}
              disabled={disabled || !getPathViability(selectedPath.moves).viable}
            >
              Start Animation
            </Button>
            <Button
              variant="outlined"
              onClick={() => onPathSelect('')}
              disabled={disabled}
            >
              Deselect
            </Button>
          </Box>
          
          {!getPathViability(selectedPath.moves).viable && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              ⚠️ This path exceeds your remaining move limit. 
              Consider selecting a more efficient route.
            </Typography>
          )}
        </Paper>
      )}

      {/* Legend */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary">
        💡 Tip: Higher efficiency means fewer wasted moves. 
        Consider paths that collect people and fill potholes along the way.
      </Typography>
    </Box>
  );
};

export default PathSelectionUI;
