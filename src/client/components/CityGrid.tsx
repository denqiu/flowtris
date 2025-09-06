import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { GridProps } from "../props/GridProps";
import { useAStarGrid } from '../hooks/useAStarGrid';

const CityGrid: React.FC<GridProps> = ({ rows, columns, matrix, startPoint, endPoint }) => {
    const { path, isLoading, error, fetchAStar } = useAStarGrid();
    useEffect(() => {
        if (matrix && startPoint && endPoint) {
            void fetchAStar({matrix, startPoint, endPoint});
        }
    }, [fetchAStar, matrix, startPoint, endPoint]);
    if (rows && columns) {
        matrix = Array.from({ length: rows }, () => Array(columns).fill(0));
    }
    if (!matrix) {
        return <div>Invalid arguments</div>;
    }
    const cells = [] as React.ReactNode[];
    matrix.forEach((row, rowIndex) => {
        row.forEach((cellValue, columnIndex) => {
            cells.push(
                <Box key={`${rowIndex}-${columnIndex}`}> 
                    <Paper elevation={1} style={{ aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {path.includes([rowIndex, columnIndex]) ? 1 : cellValue}
                    </Paper>
                </Box>
            );
        });
    });   
    return (
        <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${columns}, 1fr)`, 
            gap: 1,
            maxWidth: '600px', // Set max width
            margin: '0 auto'   // Center the grid
        }}>
            {cells}
        </Box>
    );
};

/**
 * Grids at different row and column counts should maintain same size. See https://github.com/denqiu/flowtris/wiki/Grid-Size-Test.
 */
const SizeTest: React.FC = () => {
    const grids = [
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
            {grids.map(grid => (<CityGrid {...grid} />))}
        </React.Fragment>
    );
};

export default CityGrid;
export { SizeTest };