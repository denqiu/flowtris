import { showToast } from "@devvit/web/client";
import React, { useEffect, useState, useMemo } from "react";
import { GridProps_A, GridProps_B, MatrixRequest_A, MatrixRequest_B, MatrixIconsRequest } from "../../shared/types/grid";
import { Box, Paper } from "@mui/material";
import { renderIcon } from "../utils/Icons";
import Spinner from "./Spinner";
import { useMatrixPaths_A, useMatrixPaths_B } from "../hooks/grid/useMatrixPaths";
import useMatrixIcons from "../hooks/grid/useMatrixIcons";
import { useMatrix_B } from "../hooks/grid/useMatrix";

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
 * Get background color for cell based on icon type
 */
const getCellBackgroundColor = (iconKey?: string): string => {
    if (iconKey?.startsWith('ROAD')) {
        return '#4a4a4a'; // Dark grey road color
    }
    return '#f5f5f5'; // Default light grey background
};

/**
 * Render grid with A* path if matrix and paths are provided. Otherwise don't update render.
 * Assume grid props to be already initialized.
 * 
 * @deprecated
 */
const CityGrid_A: React.FC<GridProps_A> = ({ 
    rows, columns, matrix, obstacles, paths // Required
}) => {
    const [error, setError] = useState<string | null>(null);
    const { updateMatrix, fetchMatrixPaths } = useMatrixPaths_A({ setError });
    const { matrixIcons, fetchMatrixIcons } = useMatrixIcons({ setError });
    useEffect(() => {
        void fetchMatrixPaths({matrix, paths} as MatrixRequest_A);
        void fetchMatrixIcons({ rows, columns, obstacles, } as MatrixIconsRequest);
    }, [fetchMatrixPaths, matrix, paths, fetchMatrixIcons, rows, columns, obstacles]);

    const getCells: React.ReactNode[] | null = useMemo(() => {
        if (!updateMatrix || !matrixIcons) {
            return null;
        }
        const cells: React.ReactNode[] = [];
        updateMatrix.forEach((row, rowIndex) => {
            row.forEach((cellValue, columnIndex) => {
                cells.push(
                    <Box key={`${rowIndex}-${columnIndex}`}> 
                        <Paper 
                            elevation={1} 
                            style={{ 
                                aspectRatio: '1 / 1', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                            }}
                        >
                            {renderIcon(matrixIcons[rowIndex]?.[columnIndex])}
                        </Paper>
                    </Box>
                );
            });
        });   
        return cells;
    }, [updateMatrix, matrixIcons]);

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
                gap: 0, // Set spacing to 0 as requested
                maxWidth: '600px', // Set max width
                margin: '0 auto'   // Center the grid
            }}>
                {getCells}
            </Box>
        </div>
    );
};


/**
 * Render grid with A* path if matrix, startPoint, and endPoint are provided. Otherwise don't update render.
 * Assume grid props to be already initialized.
 */
const CityGrid_B: React.FC<GridProps_B> = ({ 
    rows, columns, matrix, obstacles, startPoint, endPoint, // Required
    gameProgress, // Required
    isAutobahn // Optional
}) => {
    const { potholeCount } = gameProgress || {};
    const [error, setError] = useState<string | null>(null);
    const { updateMatrix, selectedPath, matrixIcons, fetchMatrix } = useMatrix_B({ setError });
    // const { updateMatrix, selectedPath, potholesForIcons, fetchMatrixPaths } = useMatrixPaths_B({ setError });
    // const { matrixIcons, fetchMatrixIcons } = useMatrixIcons({ setError });

    // fetch path animation here?

    // useEffect(() => {
    //     void fetchMatrixPaths({matrix, potholeCount: gameProgress?.potholeCount, startPoint, endPoint} as MatrixRequest_B);
    //     void fetchMatrixIcons({ rows, columns, obstacles, potholesForIcons } as MatrixIconsRequest);
    // }, [fetchMatrixPaths, matrix, startPoint, endPoint, gameProgress, matrixIcons, fetchMatrixIcons, rows, columns, obstacles, potholesForIcons, selectedPath]);

    useEffect(() => {
        if (error) {
            showToast({ text: error, appearance: 'neutral' });
        }
        void fetchMatrix({matrix, potholeCount, startPoint, endPoint, rows, columns, obstacles} as MatrixRequest_B & MatrixIconsRequest)
    }, [fetchMatrix, matrix, startPoint, endPoint, potholeCount, rows, columns, obstacles, error]);

    const getCells: React.ReactNode[] | null = useMemo(() => {
        if (!updateMatrix || !matrixIcons) {
            return null;
        }
        const cells: React.ReactNode[] = [];
        updateMatrix.forEach((row, rowIndex) => {
            row.forEach((cellValue, columnIndex) => {
                cells.push(
                    <Box key={`${rowIndex}-${columnIndex}`}> 
                        <Paper 
                            elevation={1} 
                            style={{ 
                                aspectRatio: '1 / 1', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                // backgroundColor: getCellBackgroundColor(matrixIcons[rowIndex]?.[columnIndex])
                            }}
                        >
                            {renderIcon(matrixIcons[rowIndex]?.[columnIndex])}
                        </Paper>
                    </Box>
                );
            });
        });   
        return cells;
    }, [updateMatrix, matrixIcons]);

    if (!updateMatrix) {
        return <div>Invalid arguments</div>;
    }
    if (!matrixIcons) {
        return <Spinner />;
    }
    return (
        <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${columns}, 1fr)`, 
            gap: 0, // Set spacing to 0 as requested
            maxWidth: '600px', // Set max width
            margin: '0 auto'   // Center the grid
        }}>
            {getCells}
        </Box>
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
                    <CityGrid_A {...grid} />
                )
            })}
        </React.Fragment>
    );
};

export { CityGrid_A, CityGrid_B, TestCityGrid };
