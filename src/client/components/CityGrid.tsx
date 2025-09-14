import React, { useEffect, useState, useMemo } from "react";
import { GridProps, MatrixRequest, MatrixIconsRequest } from "../../shared/types/grid";
import { Box, Paper } from "@mui/material";
import { renderIcon } from "../utils/Icons";
import Spinner from "./Spinner";
import useMatrixPaths from "../hooks/grid/useMatrixPaths";
import useMatrixIcons from "../hooks/grid/useMatrixIcons";

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
const CityGrid: React.FC<GridProps> = ({ 
    rows, columns, matrix, obstacles, paths // Required
}) => {
    const [error, setError] = useState<string | null>(null);
    const { updateMatrix, fetchMatrixPaths } = useMatrixPaths({ setError });
    const { matrixIcons, fetchMatrixIcons } = useMatrixIcons({ setError });
    useEffect(() => {
        void fetchMatrixPaths({matrix, paths} as MatrixRequest);
        void fetchMatrixIcons({ rows, columns, obstacles } as MatrixIconsRequest);
    }, [fetchMatrixPaths, matrix, paths, fetchMatrixIcons, rows, columns, obstacles]);

    const getCells: React.ReactNode[] | null = useMemo(() => {
        if (!updateMatrix || !matrixIcons) {
            return null;
        }
        const cells: React.ReactNode[] = [];
        updateMatrix.forEach((row, rowIndex) => {
            row.forEach((cellValue, columnIndex) => {
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

                            {renderIcon(matrixIcons[rowIndex]?.[columnIndex])}
                        </Paper>
                    </Box>
                );
            });
        });   
        return cells;
    }, [updateMatrix, matrixIcons]);

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
    
    if (!updateMatrix) {
        return <div>Invalid arguments</div>;
    }
    if (!matrixIcons) {
        return <Spinner />;
    }
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
                {getCells}
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