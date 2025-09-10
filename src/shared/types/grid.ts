/**
 * icon type refers to <Icon> element and component type refers to component from @mui/icons-material.
 */
export const ICONS = {
    ROAD: { type: 'component', name: 'RoadIcon', directions: ['north', 'south', 'east', 'west'] },
    POTHOLE: { type: 'component', name: 'BrightnessOutlinedIcon' },
    CAR: { type: 'component', name: 'DirectionsCarIcon', directions: ['north', 'south', 'east', 'west'] },
    BUS: { type: 'component', name: 'DirectionsBusIcon', directions: ['north', 'south', 'east', 'west'] },
    BUILDING: { type: 'component', name: 'BusinessIcon' },
    TREE: { type: 'component', name: 'ParkIcon' },
    CITY: { type: 'component', name: 'LocationCityIcon' }
};

export type IconKey = keyof typeof ICONS;

export type MatrixResponse = {
    matrix: number[][];
    status: string;
    message: string;
};

export type MatrixRequest = {
    matrix?: number[][];
    startPoint?: [number, number];
    endPoint?: [number, number];
};
export interface GridProps extends Partial<MatrixRequest> {
    rows?: number;
    columns?: number;
    obstacles?: { iconKey: IconKey; points: [number, number][]; direction?: string; lane?: 'fast' | 'slow' }[];
    lanes?: {
        fast: { startRow: number; endRow: number };
        slow: { startRow: number; endRow: number };
    };
}

/**
 * Ensure that grid props has defined rows, columns, and matrix. obstacles, startPoint and endPoint are left as is. Otherwise leave props as is.
 * 0 = Open cell (Walkable), 1 = Closed cell (Obstacle), 2+ = Path cell from start to finish (in server/grid)
 */
export const InitGridProps = (props: GridProps) => {
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
        return props;
    }
    props.obstacles?.flatMap(obstacle => obstacle.points).forEach(([y, x]) => {
        if (matrix[x]) {
            matrix[x][y] = 1; 
        }
    });
    return {
        rows,
        columns,
        matrix,
        obstacles: props.obstacles,
        startPoint: props.startPoint,
        endPoint: props.endPoint
    } as GridProps;
};