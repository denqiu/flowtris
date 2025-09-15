import React from "react";
import { Box } from "@mui/material";

/**
 * See css in index.css.
 * Centered spinner component that fits the grid size (600px max width)
 */
const Spinner: React.FC = () => {
    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            maxWidth: '600px', // Match grid max width
            minHeight: '300px', // Provide adequate height
            margin: '0 auto',   // Center the spinner container
            gap: 2
        }}>
            <p>Loading...Please wait a moment!</p>
            <span className="material-symbols-outlined spinner">progress_activity</span>
        </Box>
    );
};

export default Spinner;
