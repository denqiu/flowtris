import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { CityGrid_A, CityGrid_B } from './CityGrid';
import { GridProps_A, GridProps_B } from '../../shared/types/grid';

const FeatureDemo: React.FC = () => {
    const [vehicleType, setVehicleType] = useState<'car' | 'bus'>('car');
    const [selectedDemo, setSelectedDemo] = useState<string>('basic');

    const demos: Record<string, GridProps_B> = {
        basic: {
            rows: 6,
            columns: 8,
            startPoint: [0, 0],
            endPoint: [5, 7],
            obstacles: [
                { iconKey: 'POTHOLE', points: [[2, 3], [4, 3]], direction: null },
                { iconKey: 'ROAD', points: [[1, 1], [1, 2], [1, 3]], direction: 'east' },
                { iconKey: 'BUILDING', points: [[0, 7], [5, 0]], direction: null }
            ],
            // lanes: {
            //     fast: { startRow: 0, endRow: 2 },
            //     slow: { startRow: 3, endRow: 5 }
            // }
        },
        vehicles: {
            rows: 8,
            columns: 10,
            startPoint: [1, 0],
            endPoint: [6, 9],
            obstacles: [
                { iconKey: 'CAR', points: [[1, 0]], direction: 'east' },
                { iconKey: 'BUS', points: [[5, 0]], direction: 'east', },
                { iconKey: 'ROAD', points: [[1, 1], [1, 2], [1, 3]], direction: 'east' },
                { iconKey: 'ROAD', points: [[5, 1], [5, 2], [5, 3]], direction: 'east' },
                { iconKey: 'TREE', points: [[0, 5], [7, 5]], direction: null },
                { iconKey: 'CITY', points: [[0, 9], [7, 9]], direction: null }
            ],
            // lanes: {
            //     fast: { startRow: 0, endRow: 3 },
            //     slow: { startRow: 4, endRow: 7 }
            // }
        },
        directions: {
            rows: 6,
            columns: 8,
            startPoint: [0, 0],
            endPoint: [5, 7],
            obstacles: [
                { iconKey: 'ROAD', points: [[1, 1], [1, 2]], direction: 'east' },
                { iconKey: 'ROAD', points: [[2, 2], [3, 2]], direction: 'south' },
                { iconKey: 'ROAD', points: [[3, 3], [3, 4]], direction: 'east' },
                { iconKey: 'CAR', points: [[1, 1]], direction: 'east' },
                { iconKey: 'BUS', points: [[2, 2]], direction: 'south' }
            ],
            // lanes: {
            //     fast: { startRow: 0, endRow: 2 },
            //     slow: { startRow: 3, endRow: 5 }
            // }
        }
    };

    const currentDemo = demos[selectedDemo];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Flowtris Feature Demo
            </Typography>
            
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Demo Type</InputLabel>
                            <Select
                                value={selectedDemo}
                                onChange={(e) => setSelectedDemo(e.target.value)}
                            >
                                <MenuItem value="basic">Basic Icons</MenuItem>
                                <MenuItem value="vehicles">Vehicles & Lanes</MenuItem>
                                <MenuItem value="directions">Directional Icons</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Vehicle Type</InputLabel>
                            <Select
                                value={vehicleType}
                                onChange={(e) => setVehicleType(e.target.value as 'car' | 'bus')}
                            >
                                <MenuItem value="car">Car (Fast Lane)</MenuItem>
                                <MenuItem value="bus">Bus (Slow Lane)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Features Demonstrated:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    • Road icons with 4-direction rotation<br/>
                    • Pothole, car, and bus icons<br/>
                    • Lane system (blue = fast lane, purple = slow lane)<br/>
                    • Environmental elements (buildings, trees, city)<br/>
                    • Lane-specific pathfinding (cars use fast lane, buses use slow lane)
                </Typography>
            </Box>

            <CityGrid_B
                {...currentDemo}
                // Pass vehicle type for lane-specific pathfinding
                // This would need to be handled in the parent component
            />
        </Box>
    );
};

export default FeatureDemo;
