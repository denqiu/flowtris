import { useState, useCallback } from 'react';
import type { MatrixResponse, MatrixRequest } from '../../../shared/types/grid';
import { SharedGridState } from "../../../shared/state/grid"

// interface LaneAStarRequest extends MatrixRequest {
//     vehicleType?: 'car' | 'bus';
//     lanes?: {
//         fast: { startRow: number; endRow: number };
//         slow: { startRow: number; endRow: number };
//     };
// }

/**
 * If success, update render with path in matrix. If error, don't update render and keep previous matrix with path if available.
 */
const useMatrixPaths = ({ setError }: SharedGridState) => {
    const [updateMatrix, setUpdateMatrix] = useState<number[][] | null>([]);
    const [selectedPath, setSelectedPath] = useState<[number, number][]>([]);
    const fetchMatrixPaths = useCallback(
        // async (request: Partial<LaneAStarRequest>) => {
        async (request: Partial<MatrixRequest>) => {
            // const { matrix, startPoint, endPoint, vehicleType, lanes } = request;
            const { matrix, paths } = request;
            try {
                if (matrix) {
                    setUpdateMatrix(matrix);
                    if (paths && paths.selectedPathIndex >= 0 && paths.selectedPathIndex < paths.points.length) {
                        const res = await fetch('/api/grid/paths', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            // body: JSON.stringify({ matrix, startPoint, endPoint, vehicleType, lanes }),
                            body: JSON.stringify(request)
                        });
                        const data: MatrixResponse = await res.json();
                        setUpdateMatrix(data.matrix);
                    }
                    setError(null);
                } else {
                    setUpdateMatrix(null);
                    setError("Error: Matrix is required.");
                }
            } catch (err) {
                console.error(err);
                setUpdateMatrix(null);
                setError("Error: Grid failed to load paths.");
            }
        }
    , [setError]);
    return { updateMatrix, fetchMatrixPaths } as const;
};

export default useMatrixPaths;