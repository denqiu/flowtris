import express from 'express';
import PF from 'pathfinding';
import { MatrixResponse, MatrixRequest_A, MatrixRequest_B, MatrixIconsResponse, MatrixIconsRequest, MatrixDirectionsRequest, MatrixDirectionsResponse, IconKey } from '../shared/types/grid';

/**
 * Note: Decision paralysis coming in. Rather than try to automate paths, try giving players more control over paths.
 * 
 * A* is used to calculate path from start to end points.
 * 
 * Paths are 1 lane by default so that represent small neighborhoods. 2 lanes for Autobahn represent cities/highways.
 * 
 * If isAutobahn === true, generate lane alongside the original path, either to the left or the right, to create 2 lanes.
 * 
 * Matrix and paths are required. No need to concern over whether paths are defined or not. If paths are not defined, nothing happens to matrix. That's handled in client hook.
 * 
 * 1. Given list of paths and selected path, animate matrix with selected path point by point.
 * 2. If multiple paths are provided, go through other paths and set their points to obstacles.
 * 3. Then set selected path points to open cells. If selected path has potholes, randomize pothole points depending on count and set them to obstacles.
 * 4. Server sends client 3 items: (1) Matrix with updated obstacles based on other paths and potholes, (2) selected path, (3) pothole coordinates for icon setup.
 * 5. While client displays selected path, server asynchronously builds matrices for other selected path possibilities.
 * 6. Key selected path to value { matrix and potholes } and store to sqlite.
 * 7. Next time, if selected path exists, return already created matrix.
 * 8. Use level id to determine whether to retrieve or create matrices.
 * 
 * @deprecated
 */
function MatrixPaths_A(router: express.Router) {
    const handlePaths = async (id: string, {matrix, paths}: Required<MatrixRequest_A>) => {
        const grid = new PF.Grid(matrix);

        paths.points.map(({ startPoint, endPoint }) => {
            if ([startPoint, endPoint].every(([x, y]) => grid.isInside(x, y) && grid.isWalkableAt(x, y))) {
                const finder = new PF.AStarFinder();
                const path = finder.findPath(...startPoint, ...endPoint, grid) as [number, number][];
                
            } else {
                throw new Error('Start point or end point is out of bounds.');
            }
        })

        // 2. Set paths other than selected path as obstacles.
        paths.points.filter((_, index) => index !== paths.selectedPathIndex).forEach(({ startPoint, endPoint }) => {
            if ([startPoint, endPoint].every(([x, y]) => grid.isInside(x, y) && grid.isWalkableAt(x, y))) {
                const finder = new PF.AStarFinder();
                const path = finder.findPath(...startPoint, ...endPoint, grid) as [number, number][];
                path.forEach(([y, x]) => {
                    if (matrix[x]) {
                        matrix[x][y] = 1; 
                    }
                });
            } else {
                throw new Error('Start point or end point is out of bounds.');
            }
        });

        // 3. Set selected path as open cells. Then if there are potholes set them as obstacles.
        const selectedPath = paths.points[paths.selectedPathIndex];
        if (selectedPath) {
            const { startPoint, endPoint, potholeCount } = selectedPath;
            if ([startPoint, endPoint].every(([x, y]) => grid.isInside(x, y) && grid.isWalkableAt(x, y))) {
                const finder = new PF.AStarFinder();
                const path = finder.findPath(...startPoint, ...endPoint, grid) as [number, number][];
                const potholes: [number, number][] = [];
                const indices: number[] = [];
                let randomIndex;
                for (let i = 0; i < potholeCount; i++) {
                    randomIndex = Math.floor(Math.random() * path.length);
                    indices.push(randomIndex);
                    const pothole = path[randomIndex];
                    if (pothole) {
                        potholes.push(pothole);
                    }
                }
                // Exclude pothole points on path. Set other points on path to 0 (open).
                path.filter((_, index) => !indices.includes(index)).forEach(([y, x]) => {
                    if (matrix[x]) {
                        matrix[x][y] = 0; 
                    }
                });
                potholes.forEach(([y, x]) => {
                    if (matrix[x]) {
                        matrix[x][y] = 1;
                    }
                });
                // 6. Store in sqlite.
                const result = {
                    matrix: matrix,
                    selectedPath: path,
                    potholes: potholes
                };
                return result;
            } else {
                throw new Error('Start point or end point is out of bounds.');
            }
        }
    };
    router.post<
        { id: string }, // URL parameters
        MatrixResponse | { status: string; }, // Response type
        Required<MatrixRequest_A> // Request type
    >
    ('/api/grid/paths/A', async (req, res): Promise<void> => {
        // 8. Use level id to retrieve matrix or if matrix doesn't exist continue to request body.
        const { id } = req.params;


        const { matrix, paths } = req.body;

        // 4. Send matrix, selected path, potholes to client.
        handlePaths(id, { matrix: matrix.map(row => [...row]), paths: paths}).then(fulfilled => {
            res.json({
                ...fulfilled,
                status: 'success',
                message: 'Successfully loaded path',
            });
        }, error => {
            console.error(`Error generating matrix for selected path at index ${paths.selectedPathIndex}`, error);
            res.status(400).json({
                status: 'error',
            });
        });

        // 5. Process other selected path indices asynchronously.
        const otherSelectedPathIndices = Array.from({ length: paths.points.length }, (_, index) => index).filter(index => index !== paths.selectedPathIndex);
        otherSelectedPathIndices.forEach(otherSelectedPathIndex => {
            handlePaths(id, { matrix: matrix.map(row => [...row]), paths: { points: paths.points, selectedPathIndex: otherSelectedPathIndex }})
            .then(() => {}, error => {
                const index = otherSelectedPathIndex;
                console.error(`Error generating matrix for other selected path at index ${index}`, error);
                res.status(400).json({
                    status: 'error'
                });
            });
        });
    });
}

/**
 * Don't have clear vision of game. Starting small, testing that, then expand and experiment from there. So many possibilities and wanted to ensure code doesn't become too simple and inflexible for supporting multiple options/paths.
 * 
 * 1. Calculate A* for one path.
 * 2. 
 */
function MatrixPaths_B(router: express.Router) {
    router.post<
        { id: string }, // URL parameters
        MatrixResponse | { status: string; }, // Response type
        Required<MatrixRequest_B> // Request type
    >
    ('/api/grid/paths/B', async (req, res): Promise<void> => {
        // Use level id to retrieve matrix or if matrix doesn't exist continue to request body.
        const { id } = req.params;

        const { matrix, startPoint, endPoint, potholeCount } = req.body;
        const grid = new PF.Grid(matrix);
        if ([startPoint, endPoint].every(([x, y]) => grid.isInside(x, y) && grid.isWalkableAt(x, y))) {
            const finder = new PF.AStarFinder();
            const path = finder.findPath(...startPoint, ...endPoint, grid) as [number, number][];
            const potholes: [number, number][] = [];
            const indices: number[] = [];
            let randomIndex;
            for (let i = 0; i < potholeCount; i++) {
                randomIndex = Math.floor(Math.random() * path.length);
                indices.push(randomIndex);
                const pothole = path[randomIndex];
                if (pothole) {
                    potholes.push(pothole);
                }
            }
            // Exclude pothole points on path. Set other points on path to 0 (open).
            path.filter((_, index) => !indices.includes(index)).forEach(([y, x]) => {
                if (matrix[x]) {
                    matrix[x][y] = 0; 
                }
            });
            potholes.forEach(([y, x]) => {
                if (matrix[x]) {
                    matrix[x][y] = 1;
                }
            });
            // Store in sqlite.
            const result = {
                matrix: matrix,
                selectedPath: path,
                potholes: potholes
            };
            res.json({
                ...result,
                status: 'success',
                message: 'Successfully loaded path',
            });
        } else {
            console.error('Start point or end point is out of bounds.');
            res.status(400).json({
                status: 'error'
            });
        }
    });
}

function MatrixIcons(router: express.Router) {
    router.post<
        { id: string }, // URL parameters
        MatrixIconsResponse | { status: string; message: string }, // Response type
        Required<MatrixIconsRequest> // Request type
    >
    ('/api/grid/icons', async (req, res): Promise<void> => {
        const { id } = req.params;
        
        const { rows, columns, obstacles } = req.body;
        const matrixIcons: IconKey[][] = Array.from({ length: rows }, () => Array(columns).fill('ROAD'));
        obstacles.forEach(obstacle => {
            obstacle.points.forEach(([y, x]) => {
                if (matrixIcons[x]) {
                    matrixIcons[x][y] = obstacle.iconKey;
                }
            });
        });
        res.json({
            matrix: matrixIcons,
            status: 'success',
            message: 'Successfully setup matrix icons',
        });
    });
}

function MatrixDirections(router: express.Router) {
    router.post<
        { id: string }, // URL parameters
        MatrixDirectionsResponse | { status: string; message: string }, // Response type
        Required<MatrixDirectionsRequest> // Request type
    >
    ('/api/grid/directions', async (req, res): Promise<void> => {

    });
}

export { MatrixPaths_A, MatrixPaths_B, MatrixIcons, MatrixDirections };