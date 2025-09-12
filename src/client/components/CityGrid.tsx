import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useAStar } from "../hooks/grid/useAStar";
import { GridProps, MatrixRequest, ICONS } from "../../shared/types/grid";

/**
 * Render grid with A* path if matrix, startPoint, and endPoint are provided. Otherwise don't update render.
 * Assume grid props to be already initialized.
 */
const CityGrid: React.FC<GridProps> = ({ rows, columns, matrix, obstacles, startPoint, endPoint }) => {
    const { matrixWithPath, updateRender, error, fetchAStar } = useAStar();
    useEffect(() => {
        void fetchAStar({matrix, startPoint, endPoint} as MatrixRequest);
    }, [fetchAStar, matrix, startPoint, endPoint]);
    if (!matrix) {
        return <div>Invalid arguments</div>;
    }
    // probably move matrixIcons to server side or IntiGridProps
    const matrixIcons: object[][] = Array.from({ length: rows }, () => Array(columns).fill(''));
    obstacles?.forEach(obstacle => {
        const icon = ICONS[obstacle.iconKey];
        obstacle.points.forEach(([y, x]) => {
            if (matrixIcons[x]) {
                matrixIcons[x][y] = icon; 
            }
        });
    });
    const cells = [] as React.ReactNode[];
    (updateRender ? matrixWithPath : matrix).forEach((row, rowIndex) => {
        row.forEach((cellValue, columnIndex) => {
            cells.push(
                <Box key={`${rowIndex}-${columnIndex}`}> 
                    <Paper elevation={1} style={{ aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {matrixIcons[columnIndex][rowIndex] ? 'get <Icon> or Mui Icon' : cellValue}
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