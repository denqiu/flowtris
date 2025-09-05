import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { GridProps } from "../props/GridProps";

// Issue observed: Cells not fixed in box or rectangle area.
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
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 1 }}>
            {cells}
        </Box>
    );
}

export default CityGrid;