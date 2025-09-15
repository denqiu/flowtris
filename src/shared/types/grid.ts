import { GameProgress } from "./level";

export type IconDirection = 'up' | 'down' | 'left' | 'right';

export type IconType = {
    type: 'component' | 'symbol-outline' | 'font-awesome';
    rotate: 'degree' | 'image' | null;
    name: string | undefined;
    directions: Record<IconDirection, number | { name: string; flip: boolean | null }> | null
};

/**
 * symbol type refers to <span> element symbol and component type refers to component from mui/icons-material.
 * 
 * Use MuiIcons in CityGrid to find actual name for icon components. It looks like name doesn't need to end with 'Icon'.
 * 
 * See ./src/client/utils/Icons.tsx.
 * 
 * References:
 * @link Symbols {https://fonts.google.com/icons}
 * @link Components {https://mui.com/material-ui/material-icons/}
 * @link Font Awesome {https://fontawesome.com/search?ic=free&o=r}
 */
export const ICONS = {
    ROAD: {
        type: 'symbol-outline',
        rotate: 'degree',
        name: 'road',
        directions: {
            'up': 0,
            'down': 0,
            'left': 90,
            'right': 90
        }
    },
    POTHOLE: {
        type: 'component',
        rotate: null,
        name: 'RadioButtonUnchecked',
        directions: null
    },
    CAR: {
        type: 'font-awesome',
        rotate: 'image',
        name: undefined,
        directions: {
            'up': {
                name: 'car-rear',
                flip: null
            },
            'down': {
                name: 'car',
                flip: null
            },
            'left': {
                name: 'car-side',
                flip: true
            },
            'right': {
                name: 'car-side',
                flip: false
            }
        },
    },
    // BUS: { type: 'component', name: 'DirectionsBusIcon', directions: ['north', 'south', 'east', 'west'] },
    // BUILDING: { type: 'component', name: 'BusinessIcon' },
    // TREE: { type: 'component', name: 'ParkIcon' },
    // CITY: { type: 'component', name: 'LocationCityIcon' }
    HOME: {
        type: 'component',
        rotate: null,
        name: 'Home',
        directions: null
    }
} satisfies Record<string, IconType>;

export type IconKey = keyof typeof ICONS;

export type MatrixPath = {
    startPoint: [number, number];
    endPoint: [number, number];
    potholeCount: number;
    isAutobahn: boolean;
};

export type MatrixRequest_A = {
    matrix?: number[][];
    paths?: {
        points: MatrixPath[];
        selectedPathIndex: number;
    }
};

export type MatrixRequest_B = MatrixPath & {
    matrix?: number[][];
};

export type MatrixResponse = {
    matrix: number[][];
    selectedPath: [number, number][];
    potholes: [number, number][];
    matrixIcons: IconKey[][];
    status: string;
    message: string;
};

export type MatrixObstacle = {
    iconKey: IconKey;
    points: [number, number][];
    direction: IconDirection | null;
};

export type MatrixIconsRequest = {
    rows?: number;
    columns?: number;
    obstacles?: MatrixObstacle[];
    potholesForIcons?: [number, number][];
}

export type MatrixIconsResponse = {
    matrix: IconKey[][];
    status: string;
    message: string;
};

export type MatrixDirectionsRequest = Record<string, [number, number][]>;

export type MatrixDirectionsResponse = {
    matrix: string[][];
    status: string;
    message: string;
}

/**
 * @deprecated
 */
export interface GridProps_A extends Partial<MatrixRequest_A>, Partial<MatrixIconsRequest> {
    id?: string;
}

export interface GridProps_B extends Partial<MatrixRequest_B>, Partial<MatrixIconsRequest> {
    id?: string;
    gameProgress?: GameProgress;
}

/**
 * Ensure that grid props has defined id, rows, columns, obstacles, matrix, and paths.
 * 0 = Open cell (Walkable), 1 = Closed cell (Obstacle)
 * 
 * @deprecated
 */
export const InitGridProps_A = (id: string, totalPotholes: number, props: GridProps_A) => {
    let { rows, columns, matrix } = props;
    const { paths } = props;
    if (matrix) {
        rows = matrix.length;
        if (matrix[0]) {
            columns = matrix[0].length; 
        }
    }
    if (!matrix && rows && columns) {
        matrix = Array.from({ length: rows }, () => Array(columns).fill(0));
    }
    if (!matrix) {
        // Leave props as is. Let CityGrid use !matrix.
        return props;
    }
    props.obstacles?.flatMap(obstacle => obstacle.points).forEach(([y, x]) => {
        // For pathfinding lib to register point as obstacle. It considers everything else not 1's as walkable. 2+ for path is my own idea, not from author of pathfinding.
        if (matrix[x]) {
            matrix[x][y] = 1; 
        }
    });
    if (paths) {
        // Randomize path's pothole count, decrease total, and repeat.
        for (const path of paths.points) {
            path.potholeCount = (totalPotholes <= 1) ? totalPotholes : Math.floor(Math.random() * totalPotholes) + 1;
            totalPotholes -= path.potholeCount;
        }
    }
    return {
        id,
        rows,
        columns,
        matrix,
        obstacles: props.obstacles || [],
        paths: paths || { points: [], selectedPathIndex: -1 }
    } as GridProps_A;
};

/**
 * Ensure that grid props has defined id, rows, columns, obstacles, matrix, startPoint, endPoint.
 * 
 * No need to config potholes. Let GameProgress handle that.
 * 
 * isAutobahn are optional.
 * 
 * 0 = Open cell (Walkable), 1 = Closed cell (Obstacle), 2+ = Path cell from start to finish (in server/grid)
 */
export const InitGridProps_B = (id: string, props: GridProps_B) => {
    let { rows, columns, matrix } = props;
    if (matrix) {
        rows = matrix.length;
        if (matrix[0]) {
            columns = matrix[0].length; 
        }
    }
    if (!matrix && rows && columns) {
        matrix = Array.from({ length: rows }, () => Array(columns).fill(0));
    }
    if (!matrix) {
        // Leave props as is. Let CityGrid use !matrix.
        return props;
    }
    props.obstacles?.flatMap(obstacle => obstacle.points).forEach(([y, x]) => {
        // For pathfinding lib to register point as obstacle. It considers everything else not 1's as walkable. 2+ for path is my own idea, not from author of pathfinding.
        if (matrix[x]) {
            matrix[x][y] = 1; 
        }
    });
    return {
        // Required
        id,
        rows,
        columns,
        matrix,
        obstacles: props.obstacles || [],
        startPoint: props.startPoint || [0,0],
        endPoint: props.endPoint || [columns && columns-1, rows && rows-1],
        // Optional
        isAutobahn: props.isAutobahn
    } as GridProps_B;
};