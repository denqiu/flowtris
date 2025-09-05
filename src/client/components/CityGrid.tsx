import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { GridProps } from "../props/GridProps";

const CityGrid: React.FC<GridProps> = ({ rows, columns }) => {
    const cells = [] as React.ReactNode[];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            cells.push(
                <Box key={`${r}-${c}`}> 
                    <Paper elevation={1} style={{ aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {r},{c}
                    </Paper>
                </Box>
            );
        }
    }
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
    return (
        <React.Fragment>
            <CityGrid rows={2} columns={2} />
            <CityGrid rows={3} columns={5} />
            <CityGrid rows={5} columns={8} />
            <CityGrid rows={10} columns={10} />
            <CityGrid rows={12} columns={13} />
        </React.Fragment>
    );
};

export default CityGrid;
export { SizeTest };