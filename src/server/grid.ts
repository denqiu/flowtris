import express from 'express';
import PF from 'pathfinding';
import { MatrixResponse, MatrixRequest } from '../shared/types/grid';

interface LaneAStarRequest extends MatrixRequest {
    vehicleType?: 'car' | 'bus';
    lanes?: {
        fast: { startRow: number; endRow: number };
        slow: { startRow: number; endRow: number };
    };
}

function AStar(router: express.Router) {
    router.post<
        Record<string, never>, // No URL parameters
        MatrixResponse | { status: string; message: string }, // Response type
        LaneAStarRequest // Request type
    >
    ('/api/grid/astar', async (req, res): Promise<void> => {
        try {
            const { matrix, startPoint, endPoint, vehicleType, lanes } = req.body;
            
            // Create a copy of the matrix to avoid modifying the original
            const workingMatrix = matrix.map(row => [...row]);
            
            // Apply lane restrictions based on vehicle type
            if (vehicleType && lanes) {
                const { fast, slow } = lanes;
                
                if (vehicleType === 'car') {
                    // Cars can only use fast lane - block slow lane
                    for (let row = slow.startRow; row <= slow.endRow; row++) {
                        for (let col = 0; col < workingMatrix[row].length; col++) {
                            if (workingMatrix[row][col] === 0) {
                                workingMatrix[row][col] = 1; // Block slow lane for cars
                            }
                        }
                    }
                } else if (vehicleType === 'bus') {
                    // Buses can only use slow lane - block fast lane
                    for (let row = fast.startRow; row <= fast.endRow; row++) {
                        for (let col = 0; col < workingMatrix[row].length; col++) {
                            if (workingMatrix[row][col] === 0) {
                                workingMatrix[row][col] = 1; // Block fast lane for buses
                            }
                        }
                    }
                }
            }
            
            const grid = new PF.Grid(workingMatrix);
            const finder = new PF.AStarFinder();
            const path = finder.findPath(...startPoint, ...endPoint, grid) as [number, number][];
            
            if (path.length === 0) {
                res.status(400).json({
                    status: 'error',
                    message: 'No path found with current lane restrictions',
                });
                return;
            }
            
            let pathCounter = 2;
            path.forEach(([y, x]) => {
                if (matrix[x]) {
                    matrix[x][y] = pathCounter++; 
                }
            });
            
            res.json({
                matrix: matrix,
                status: 'success',
                message: `Calculated A* path for ${vehicleType || 'default'} vehicle`,
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