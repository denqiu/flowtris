import React from 'react';
import { IconDirection, IconType, IconKey, ICONS } from '../../shared/types/grid';
import * as MuiIcons from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName, findIconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * If icon is a component, use material-icons as a map. If symbol, link stylesheet in index.html is required before adding span element.
 */
const renderIcon = (iconKey?: IconKey, direction: IconDirection = 'down') => {
    if (!iconKey) {
        return null;
    }
    const icon: IconType = ICONS[iconKey];
    let transform: string | undefined = undefined;
    let iconName: string | undefined = undefined;
    if (icon.rotate) {
        if (icon.rotate === 'degree') {
            const degree = icon.directions?.[direction] as number;
            transform = `rotate(${degree}deg)`;
            iconName = icon.name;
        } else if (icon.rotate === 'image') {
            const value = icon.directions?.[direction] as { name: string; flip: boolean | null };
            iconName = value.name;
            if (value.flip) {
                transform = 'scaleX(-1)';
            }
        }
    } else {
        iconName = icon.name;
    }
    if (!iconName) {
        throw new Error(`Icon name missing for '${iconKey}'.`);
    }
    if (icon.type === 'component') {
        const MuiComponent = (MuiIcons as Record<string, React.ElementType>)[iconName];
        if (MuiComponent) {
            return <MuiComponent sx={transform && { transform: transform }} />;
        }
    } else if (icon.type === 'symbol-outline') {
        const props = {
            class: "material-symbols-outlined",
            transform: transform
        };
        return <span {...props}>{iconName}</span>;
    } else if (icon.type === 'font-awesome') {
        return <FontAwesomeIcon transform={transform} icon={findIconDefinition({ prefix: 'fas', iconName: iconName as IconName })} />
    }
    return null;
};

export { renderIcon };