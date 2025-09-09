import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useAStar } from "../hooks/grid/useAStar";
import { GridProps, MatrixRequest, ICONS, IconKey } from "../../shared/types/grid";
import * as MuiIcons from '@mui/icons-material';

/**
 * Render icon component based on icon configuration
 */
const renderIcon = (iconKey: IconKey, direction?: string) => {
    const icon = ICONS[iconKey];
    if (icon.type === 'component') {
        const IconComponent = (MuiIcons as any)[icon.name];
        if (IconComponent) {
            const rotation = direction ? getRotationForDirection(direction) : 0;
            return <IconComponent sx={{ transform: `rotate(${rotation}deg)` }} />;
        }
    }
    return icon.name || iconKey;
};

/**
 * Get rotation angle for direction
 */
const getRotationForDirection = (direction: string): number => {
    switch (direction) {
        case 'north': return 0;
        case 'east': return 90;
        case 'south': return 180;
        case 'west': return 270;
        default: return 0;
    }
};

/**
 * Render grid with A* path if matrix, startPoint, and endPoint are provided. Otherwise don't update render.
 * Assume grid props to be already initialized.
 */
// const CityGrid: React.FC<GridProps> = ({ rows, columns, matrix, obstacles, startPoint, endPoint, lanes }) => {
const CityGrid: React.FC<GridProps> = ({ rows, columns, matrix, obstacles, startPoint, endPoint }) => {
    const { matrixWithPath, updateRender, error, fetchAStar } = useAStar();
    useEffect(() => {
        void fetchAStar({matrix, startPoint, endPoint} as MatrixRequest);
    }, [fetchAStar, matrix, startPoint, endPoint]);
    if (!matrix) {
        return <div>Invalid arguments</div>;
    }
    // Create matrix for icons with proper coordinate mapping
    // const matrixIcons: (object | null)[][] = Array.from({ length: rows }, () => Array(columns).fill(null));
    // obstacles?.forEach(obstacle => {
    //     obstacle.points.forEach(([row, col]) => {
    //         if (matrixIcons[row] && matrixIcons[row][col] !== undefined) {
    //             matrixIcons[row][col] = {
    //                 iconKey: obstacle.iconKey,
    //                 direction: obstacle.direction,
    //                 lane: obstacle.lane
    //             }; 
    //         }
    //     });
    // });
    const cells = [] as React.ReactNode[];
    (updateRender ? matrixWithPath : matrix).forEach((row, rowIndex) => {
        row.forEach((cellValue, columnIndex) => {
            // const iconData = matrixIcons[rowIndex][columnIndex] as any;
            // const isInFastLane = lanes?.fast && rowIndex >= lanes.fast.startRow && rowIndex <= lanes.fast.endRow;
            // const isInSlowLane = lanes?.slow && rowIndex >= lanes.slow.startRow && rowIndex <= lanes.slow.endRow;
            
            // Determine cell background color based on lane
            // let backgroundColor = '#f5f5f5'; // Default
            // if (isInFastLane) backgroundColor = '#e3f2fd'; // Light blue for fast lane
            // if (isInSlowLane) backgroundColor = '#f3e5f5'; // Light purple for slow lane
            
            cells.push(
                <Box key={`${rowIndex}-${columnIndex}`}> 
                    <Paper 
                        elevation={1} 
                        style={{ 
                            aspectRatio: '1 / 1', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            // backgroundColor: backgroundColor,
                            // border: cellValue >= 2 ? '2px solid #4caf50' : '1px solid #ddd' // Green border for path
                        }}
                    >
                        {/* {iconData ? renderIcon(iconData.iconKey, iconData.direction) : 
                         cellValue >= 2 ? '🚗' : cellValue === 1 ? '🚧' : ''} */}

                         {/* {matrixIcons[columnIndex][rowIndex] ? 'get <Icon> or Mui Icon' : cellValue} */}

                         {cellValue}
                    </Paper>
                </Box>
            );
        });
    });   
    return (
        <div>
            {error && <p>{error}</p>}
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${columns}, 1fr)`, 
                gap: 1,
                maxWidth: '600px', // Set max width
                margin: '0 auto'   // Center the grid
            }}>
                {cells}
            </Box>
        </div>
        
    );
};

/**
 * Grids at different row and column counts should maintain same size. See https://github.com/denqiu/flowtris/wiki/Grid-Size-Test.
 */
const TestCityGrid: React.FC = () => {
    const grids = [
        {},
        // { rows: 6, columns: 4, startPoint: [0, 3], endPoint: [3, 0] },
        { rows: 6, columns: 4, startPoint: [0, 3], endPoint: [3, 0], obstacles: [
            [0, 0], [1, 1]
        ]},
        { rows: 2, columns: 2 },
        { rows: 3, columns: 5 },
        { rows: 5, columns: 8 },
        { rows: 10, columns: 10 },
        { rows: 12, columns: 13 },
        { matrix: [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]},
    ];
    return (
        <React.Fragment>
            {grids.map(grid => {
                return (
                    <CityGrid {...grid} />
                )
            })}
        </React.Fragment>
    );
};

export default CityGrid;
export { TestCityGrid };