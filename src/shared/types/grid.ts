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