import express from 'express';
import PF from 'pathfinding';
import { MatrixResponse, MatrixRequest } from '../shared/types/grid';

function AStar(router: express.Router) {
    router.post<
        Record<string, never>, // No URL parameters
        MatrixResponse | { status: string; message: string }, // Response type
        Required<MatrixRequest> // Request type
    >
    ('/grid/astar', async (req, res): Promise<void> => {
        try {
            const { matrix, startPoint, endPoint } = req.body;
            const grid = new PF.Grid(matrix);
            const finder = new PF.AStarFinder();
            const path = finder.findPath(...startPoint, ...endPoint, grid) as [number, number][];
            path.forEach(([x, y]) => {
                if (matrix[x]) {
                    matrix[x][y] = 0; 
                }
            });
            res.json({
                matrix: matrix,
                status: 'success',
                message: 'Calculated A* path',
            });
        } catch (error) {
            console.error("Failed to calculate A*:", error);
            res.status(400).json({
                status: 'error',
                message: 'Failed to calculate A*',
            });
        }
    });
}

export { AStar };