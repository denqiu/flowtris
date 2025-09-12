import React from 'react';
import { IconKey, ICONS } from '../../shared/types/grid';
import * as MuiIcons from '@mui/icons-material';

/**
 * If icon is a component, use material-icons as a map. If symbol, link stylesheet in index.html is required before adding span element.
 */
const renderIcon = (iconKey?: IconKey, rotationDegree?: number) => {
    if (!iconKey) {
        return null;
    }
    rotationDegree = rotationDegree || 0;
    const icon = ICONS[iconKey];
    if (icon.type === 'component') {
        const MuiComponent = (MuiIcons as Record<string, React.ElementType>)[icon.name];
        if (MuiComponent) {
            return <MuiComponent sx={{ transform: `rotate(${rotationDegree}deg)` }} />;
        }
    } else if (icon.type === 'symbol-outline') {
        return <span 
            class="material-symbols-outlined"
            style={{ transform: `rotate(${rotationDegree}deg)` }}
        >{icon.name}</span>;
    }
    return null;
};

export { renderIcon };