import express from 'express';
import PF from 'pathfinding';
import { PathResponse, AStarRequest } from '../../shared/types/grid-props';

function AStarGrid(router: express.Router) {
    router.post<
        Record<string, never>, // No URL parameters
        PathResponse | { status: string; message: string }, // Response type
        AStarRequest // Request type
    >
    ('/grid/astar', async (req, res): Promise<void> => {
        try {
            const { matrix, startPoint, endPoint } = req.body;
            const grid = new PF.Grid(matrix);
            const finder = new PF.AStarFinder();
            const path = finder.findPath(...startPoint, ...endPoint, grid);
            res.json({
                status: 'success',
                path: path,
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

export default AStarGrid;