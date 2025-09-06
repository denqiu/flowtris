export type PathResponse = {
    status: string;
    path: number[][];
};

export type AStarRequest = {
    matrix: number[][];
    startPoint: [number, number];
    endPoint: [number, number];
};