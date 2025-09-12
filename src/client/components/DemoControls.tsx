import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { People, Construction, Directions } from '@mui/icons-material';

interface DemoControlsProps {
  onTransportPerson: () => void;
  onFillPothole: () => void;
  onUseMove: () => void;
  onComplete: () => void;
  onFail: () => void;
  disableTransport?: boolean;
  disablePothole?: boolean;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  onTransportPerson,
  onFillPothole,
  onUseMove,
  onComplete,
  onFail,
  disableTransport = false,
  disablePothole = false,
}) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        mb: 2, 
        backgroundColor: '#f5f5f5',
        border: '2px dashed #ccc'
      }}
    >
      <Typography variant="h6" gutterBottom color="primary">
        🎮 Demo Controls
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use these buttons to simulate game actions and test the level system
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<People />}
          onClick={onTransportPerson}
          size="small"
          sx={{ backgroundColor: 'var(--color-transport)', color: '#fff' }}
          disabled={disableTransport}
        >
          Transport Person
        </Button>
        
        <Button
          variant="contained"
          startIcon={<Construction />}
          onClick={onFillPothole}
          size="small"
          sx={{ backgroundColor: 'var(--color-pothole)', color: '#fff' }}
          disabled={disablePothole}
        >
          Fill Pothole
        </Button>
        
        <Button
          variant="contained"
          startIcon={<Directions />}
          onClick={onUseMove}
          size="small"
          sx={{ backgroundColor: 'var(--color-hint)', color: '#fff' }}
        >
          Hint
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onComplete}
          size="small"
          color="success"
        >
          Complete Level
        </Button>
        
        <Button
          variant="outlined"
          onClick={onFail}
          size="small"
          color="error"
        >
          Fail Level
        </Button>
      </Box>
    </Paper>
  );
};
