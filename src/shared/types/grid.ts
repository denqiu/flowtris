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
 */
export const ICONS = {
    // ROAD: { type: 'component', name: 'RoadIcon', directions: ['north', 'south', 'east', 'west'] },
    ROAD: { type: 'symbol-outline', name: 'road' },
    POTHOLE: { type: 'component', name: 'RadioButtonUnchecked' },
    // CAR: { type: 'component', name: 'DirectionsCarIcon', directions: ['north', 'south', 'east', 'west'] },
    // BUS: { type: 'component', name: 'DirectionsBusIcon', directions: ['north', 'south', 'east', 'west'] },
    // BUILDING: { type: 'component', name: 'BusinessIcon' },
    // TREE: { type: 'component', name: 'ParkIcon' },
    // CITY: { type: 'component', name: 'LocationCityIcon' }
};

export type IconKey = keyof typeof ICONS;

export type MatrixPath = {
    startPoint: [number, number];
    endPoint: [number, number];
    potholeCount: number;
    isAutobahn: boolean;
};

export type MatrixRequest = {
    matrix?: number[][];
    paths?: {
        points: MatrixPath[];
        selectedPathIndex: number;
    }
};

export type MatrixResponse = {
    matrix: number[][];
    selectedPath: [number, number][];
    potholes: [number, number][];
    status: string;
    message: string;
};

export type MatrixObstacle = {
    iconKey: IconKey;
    points: [number, number][];
    direction?: string;
    // lane?: 'fast' | 'slow';
};

export type MatrixIconsRequest = {
    rows?: number;
    columns?: number;
    obstacles?: MatrixObstacle[];
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

export interface GridProps extends Partial<MatrixRequest>, Partial<MatrixIconsRequest> {
    id?: string;
    // obstacles?: { iconKey: IconKey; points: [number, number][]; direction?: string; lane?: 'fast' | 'slow' }[];
    // lanes?: {
    //     fast: { startRow: number; endRow: number };
    //     slow: { startRow: number; endRow: number };
    // };
}

/**
 * Ensure that grid props has defined id, rows, columns, obstacles, matrix, and paths.
 * 0 = Open cell (Walkable), 1 = Closed cell (Obstacle), 2+ = Path cell from start to finish (in server/grid)
 */
export const InitGridProps = (id: string, totalPotholes: number, props: GridProps) => {
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
    } as GridProps;
};