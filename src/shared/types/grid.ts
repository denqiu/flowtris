import { GameState } from "./level";

export type IconDirection = 'up' | 'down' | 'left' | 'right' | 'north' | 'south' | 'east' | 'west';

export type LaneConfig = {
  id: string;
  startRow: number;
  endRow: number;
  vehicleType: 'car' | 'bus';
  startPoints: [number, number][];
  endPoints: [number, number][];
};

export type MultiLaneGridConfig = {
  lanes: LaneConfig[];
  selectedLaneId?: string;
};

export type IconType = {
    type: 'component' | 'symbol-outline' | 'font-awesome';
    rotate: 'degree' | 'image' | null;
    name: string | undefined;
    directions: Partial<Record<IconDirection, number | { name: string; flip: boolean | null }>> | null
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
    ROAD_NORTH: {
        type: 'symbol-outline',
        rotate: 'degree',
        name: 'arrow_upward',
        directions: {
            'up': 0,
            'down': 180,
            'left': 270,
            'right': 90
        }
    },
    ROAD_SOUTH: {
        type: 'symbol-outline',
        rotate: 'degree',
        name: 'arrow_downward',
        directions: {
            'up': 180,
            'down': 0,
            'left': 90,
            'right': 270
        }
    },
    ROAD_EAST: {
        type: 'symbol-outline',
        rotate: 'degree',
        name: 'arrow_forward',
        directions: {
            'up': 270,
            'down': 90,
            'left': 180,
            'right': 0
        }
    },
    ROAD_WEST: {
        type: 'symbol-outline',
        rotate: 'degree',
        name: 'arrow_back',
        directions: {
            'up': 90,
            'down': 270,
            'left': 0,
            'right': 180
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
    BUS: {
        type: 'font-awesome',
        rotate: 'image',
        name: undefined,
        directions: {
            'up': {
                name: 'bus-simple',
                flip: null
            },
            'down': {
                name: 'bus-simple',
                flip: null
            },
            'left': {
                name: 'bus-simple',
                flip: true
            },
            'right': {
                name: 'bus-simple',
                flip: false
            }
        },
    },
    BUILDING: {
        type: 'component',
        rotate: null,
        name: 'Business',
        directions: null
    },
    TREE: {
        type: 'component',
        rotate: null,
        name: 'Park',
        directions: null
    },
    CITY: {
        type: 'component',
        rotate: null,
        name: 'LocationCity',
        directions: null
    },
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
    gameState?: GameState;
    multiLane?: MultiLaneGridConfig;
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
 * Ensure that grid props has defined id, rows, columns, obstacles, matrix, and potholes.
 * 
 * Start point, end point, and is Autobahn are optional.
 * 
 * 0 = Open cell (Walkable), 1 = Closed cell (Obstacle), 2+ = Path cell from start to finish (in server/grid)
 */
export const InitGridProps_B = (id: string, totalPotholes: number, props: GridProps_B) => {
    let { rows, columns, matrix, potholeCount } = props;
    const { startPoint, endPoint } = props;
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
    if (startPoint && endPoint) {
        // Randomize path's pothole count, decrease total, and repeat.
        potholeCount = (totalPotholes <= 1) ? totalPotholes : Math.floor(Math.random() * totalPotholes) + 1;
    }
    return {
        // Required
        id,
        rows,
        columns,
        matrix,
        potholeCount,
        obstacles: props.obstacles || [],
        // Optional
        startPoint: props.startPoint,
        endPoint: props.endPoint,
        isAutobahn: props.isAutobahn
    } as GridProps_B;
};
