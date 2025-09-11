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
export const useAStar = ({ setError }: SharedGridState) => {
    const [updateMatrix, setUpdateMatrix] = useState<number[][] | undefined>([]);
    const fetchAStar = useCallback(
        // async (request: Partial<LaneAStarRequest>) => {
        async (request: Partial<MatrixRequest>) => {
            // const { matrix, startPoint, endPoint, vehicleType, lanes } = request;
            const { matrix, startPoint, endPoint } = request;
            try {
                if (matrix) {
                    setUpdateMatrix(matrix);
                    if (startPoint && endPoint) {
                        const res = await fetch('/api/grid/astar', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            // body: JSON.stringify({ matrix, startPoint, endPoint, vehicleType, lanes }),
                            body: JSON.stringify(request)
                        });
                        const data: MatrixResponse = await res.json();
                        setUpdateMatrix(data.matrix);
                        setError(null);
                    }
                } else {
                    setUpdateMatrix([]);
                    setError("Error: Matrix is required.")
                }
            } catch (err) {
                console.error("Failed to fetch A* path", err);
                setUpdateMatrix(matrix);
                setError("Error: Grid failed to load.");
            }
        }
    , [setError]);
    return { updateMatrix, fetchAStar } as const;
};