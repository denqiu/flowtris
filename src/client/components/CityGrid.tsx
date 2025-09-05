import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { GridProps } from "../props/GridProps";

// Issue observed: Cells not fixed in box or rectangle area.
const CityGrid: React.FC<GridProps> = ({ rows, columns }) => {
    const cells = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            cells.push(
                <Grid key={`${r}-${c}`}>
                    <Paper elevation={3} style={{ padding: '16px', textAlign: 'center' }}>
                        Cell: {r},{c}
                    </Paper>
                </Grid>
            );
        }
    }
    return (
        <Grid container spacing = {1}> 
            {cells}
        </Grid>
    );
}

export default CityGrid;