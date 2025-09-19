import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { CityGrid_B } from './CityGrid';
import { PathSelectionUI, PathOption } from './PathSelectionUI';
import { GridProps_B, MultiLaneGridConfig, LaneConfig } from '../../shared/types/grid';
import { LevelConfig, GameProgress } from '../../shared/types/level';

export interface MultiLaneCityGridProps {
  levelConfig: LevelConfig;
  gameProgress: GameProgress;
  onPathSelect: (pathId: string) => void;
  onStartAnimation: (pathId: string) => void;
  onGameProgressUpdate?: (progress: Partial<GameProgress>) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lane-tabpanel-${index}`}
      aria-labelledby={`lane-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Multi-Lane CityGrid Display Component
 * Handles displaying multiple lanes simultaneously with path visualization
 */
export const MultiLaneCityGrid: React.FC<MultiLaneCityGridProps> = ({
  levelConfig,
  gameProgress,
  onPathSelect,
  onStartAnimation,
  onGameProgressUpdate
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [showAllLanes, setShowAllLanes] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<Record<string, string>>({});
  const [pathOptions, setPathOptions] = useState<PathOption[]>([]);

  // Mock multi-lane configuration based on difficulty
  const multiLaneConfig = useMemo((): MultiLaneGridConfig => {
    const baseGridProps = levelConfig.gridProps;
    
    // Provide defaults for optional properties
    const rows = baseGridProps.rows || 8;
    const columns = baseGridProps.columns || 8;
    const startPoint = baseGridProps.startPoint || [0, 0] as [number, number];
    const endPoint = baseGridProps.endPoint || [rows - 1, columns - 1] as [number, number];
    
    if (levelConfig.difficulty === 'easy') {
      // Single lane for easy difficulty
      return {
        lanes: [{
          id: 'main',
          startRow: 0,
          endRow: rows - 1,
          vehicleType: 'car',
          startPoints: [startPoint],
          endPoints: [endPoint]
        }],
        selectedLaneId: 'main'
      };
    } else if (levelConfig.difficulty === 'medium') {
      // Two lanes for medium difficulty
      const midRow = Math.floor(rows / 2);
      return {
        lanes: [
          {
            id: 'fast',
            startRow: 0,
            endRow: midRow - 1,
            vehicleType: 'car',
            startPoints: [[0, 0]],
            endPoints: [[midRow - 1, columns - 1]]
          },
          {
            id: 'slow',
            startRow: midRow,
            endRow: rows - 1,
            vehicleType: 'bus',
            startPoints: [[midRow, 0]],
            endPoints: [endPoint]
          }
        ],
        selectedLaneId: 'fast'
      };
    } else {
      // Three lanes for hard difficulty
      const thirdRow = Math.floor(rows / 3);
      return {
        lanes: [
          {
            id: 'express',
            startRow: 0,
            endRow: thirdRow - 1,
            vehicleType: 'car',
            startPoints: [[0, 0]],
            endPoints: [[thirdRow - 1, columns - 1]]
          },
          {
            id: 'regular',
            startRow: thirdRow,
            endRow: thirdRow * 2 - 1,
            vehicleType: 'car',
            startPoints: [[thirdRow, 0]],
            endPoints: [[thirdRow * 2 - 1, columns - 1]]
          },
          {
            id: 'local',
            startRow: thirdRow * 2,
            endRow: rows - 1,
            vehicleType: 'bus',
            startPoints: [[thirdRow * 2, 0]],
            endPoints: [endPoint]
          }
        ],
        selectedLaneId: 'express'
      };
    }
  }, [levelConfig]);

  // Generate path options for current lane configuration
  useEffect(() => {
    const generatePathOptions = () => {
      const options: PathOption[] = [];
      
      multiLaneConfig.lanes.forEach((lane) => {
        // Generate sample paths for each lane
        const samplePaths = generateSamplePaths(lane, levelConfig.gridProps);
        
        samplePaths.forEach((path, pathIndex) => {
          options.push({
            id: `${lane.id}-path-${pathIndex}`,
            name: `${lane.id.charAt(0).toUpperCase() + lane.id.slice(1)} Route ${pathIndex + 1}`,
            path,
            vehicleType: lane.vehicleType,
            moves: {
              pathLength: path.length,
              estimatedMoves: path.length - 1,
              efficiency: 0.8 - (pathIndex * 0.1),
              alternativeRoutes: samplePaths.length - 1,
              moveBreakdown: {
                navigationMoves: path.length - 1,
                potholeRepairs: Math.floor(Math.random() * 3),
                peoplePickup: Math.floor(Math.random() * 2)
              }
            },
            color: getLaneColor(lane.id),
            description: `${lane.vehicleType} route through ${lane.id} lane`
          });
        });
      });
      
      setPathOptions(options);
    };

    generatePathOptions();
  }, [multiLaneConfig, levelConfig]);

  const generateSamplePaths = (lane: LaneConfig, _gridProps: GridProps_B): [number, number][][] => {
    // Simple path generation for demonstration
    const paths: [number, number][][] = [];
    
    lane.startPoints.forEach(startPoint => {
      lane.endPoints.forEach(endPoint => {
        // Simple path from start to end with some variation
        for (let i = 0; i < 2; i++) {
          const path: [number, number][] = [];
          const current = [...startPoint] as [number, number];
          
          // Simple path from start to end with some randomness
          while (current[0] !== endPoint[0] || current[1] !== endPoint[1]) {
            path.push([...current] as [number, number]);
            
            // Move towards end point with some randomness
            if (current[0] < endPoint[0] && (Math.random() > 0.3 || current[1] === endPoint[1])) {
              current[0]++;
            } else if (current[0] > endPoint[0] && (Math.random() > 0.3 || current[1] === endPoint[1])) {
              current[0]--;
            } else if (current[1] < endPoint[1]) {
              current[1]++;
            } else if (current[1] > endPoint[1]) {
              current[1]--;
            }
          }
          
          path.push(endPoint);
          paths.push(path);
        }
      });
    });
    
    return paths;
  };

  const getLaneColor = (laneId: string): string => {
    const colors: Record<string, string> = {
      main: '#2196f3',
      fast: '#f44336',
      slow: '#4caf50',
      express: '#9c27b0',
      regular: '#ff9800',
      local: '#607d8b'
    };
    return colors[laneId] || '#757575';
  };

  const handlePathSelect = (pathId: string) => {
    // Determine which lane this path belongs to
    const lane = multiLaneConfig.lanes.find(l => pathId.startsWith(l.id));
    if (lane) {
      setSelectedPaths(prev => ({
        ...prev,
        [lane.id]: pathId
      }));
      onPathSelect(pathId);
    }
  };

  const handleStartAnimation = (pathId: string) => {
    onStartAnimation(pathId);
  };

  const getGridPropsForLane = (lane: LaneConfig): GridProps_B => {
    const baseGridProps = levelConfig.gridProps;
    const startPoint = lane.startPoints[0] || [0, 0] as [number, number];
    const endPoint = lane.endPoints[0] || [baseGridProps.rows || 8 - 1, baseGridProps.columns || 8 - 1] as [number, number];
    
    return {
      ...baseGridProps,
      startPoint,
      endPoint,
    };
  };

  const filteredPathOptions = useMemo(() => {
    if (showAllLanes) {
      return pathOptions;
    }
    const currentLane = multiLaneConfig.lanes[selectedTab];
    return pathOptions.filter(option => option.id.startsWith(currentLane?.id || ''));
  }, [pathOptions, showAllLanes, selectedTab, multiLaneConfig.lanes]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Multi-Lane Traffic System
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showAllLanes}
                onChange={(e) => setShowAllLanes(e.target.checked)}
              />
            }
            label="Show All Lanes"
          />
        </Box>
        
        {levelConfig.difficulty !== 'easy' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {levelConfig.difficulty === 'medium' ? 
              '🚗 Medium difficulty: Fast lane (cars) and slow lane (buses)' :
              '🚦 Hard difficulty: Express, regular, and local lanes with different vehicle restrictions'
            }
          </Alert>
        )}
      </Paper>

      {/* Lane Tabs */}
      {multiLaneConfig.lanes.length > 1 && !showAllLanes && (
        <Paper sx={{ mb: 2 }}>
          <Tabs 
            value={selectedTab} 
            onChange={(_, newValue) => setSelectedTab(newValue)}
            variant="fullWidth"
          >
            {multiLaneConfig.lanes.map((lane) => (
              <Tab 
                key={lane.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label={lane.vehicleType}
                      sx={{ bgcolor: getLaneColor(lane.id), color: 'white' }}
                    />
                    {lane.id.charAt(0).toUpperCase() + lane.id.slice(1)}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>
      )}

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Grid Display */}
        <Box sx={{ flex: 2 }}>
          {showAllLanes ? (
            // Show all lanes simultaneously
            <Box>
              <Typography variant="h6" gutterBottom>
                All Lanes View
              </Typography>
              {multiLaneConfig.lanes.map((lane) => (
                <Card key={lane.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {lane.id.charAt(0).toUpperCase() + lane.id.slice(1)} Lane
                    </Typography>
                    <CityGrid_B {...getGridPropsForLane(lane)} />
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            // Show individual lane tabs
            <Box>
              {multiLaneConfig.lanes.map((lane, laneIndex) => (
                <TabPanel key={lane.id} value={selectedTab} index={laneIndex}>
                  <CityGrid_B {...getGridPropsForLane(lane)} />
                </TabPanel>
              ))}
            </Box>
          )}
        </Box>

        {/* Path Selection Panel */}
        <Box sx={{ flex: 1 }}>
          <PathSelectionUI
            availablePaths={filteredPathOptions}
            selectedPathId={Object.values(selectedPaths)[selectedTab] || null}
            onPathSelect={handlePathSelect}
            onStartAnimation={handleStartAnimation}
            maxMoves={levelConfig.objectives.maxMoves}
            currentMoves={gameProgress.movesUsed}
            disabled={gameProgress.gameState !== 'playing'}
          />
        </Box>
      </Box>

      {/* Lane Information */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Lane Configuration
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {multiLaneConfig.lanes.map((lane) => (
            <Box key={lane.id} sx={{ minWidth: 300, flex: '1 1 300px' }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      size="small"
                      label={lane.vehicleType}
                      sx={{ bgcolor: getLaneColor(lane.id), color: 'white' }}
                    />
                    <Typography variant="subtitle2">
                      {lane.id.charAt(0).toUpperCase() + lane.id.slice(1)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Rows: {lane.startRow} - {lane.endRow}<br/>
                    Start Points: {lane.startPoints.length}<br/>
                    End Points: {lane.endPoints.length}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default MultiLaneCityGrid;
