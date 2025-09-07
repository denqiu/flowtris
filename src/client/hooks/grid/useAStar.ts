import { useState, useCallback } from 'react';
import type { MatrixResponse, MatrixRequest } from '../../../shared/types/grid';

/**
 * If success, update render with path in matrix. If error, don't update render and keep previous matrix with path if available.
 */
export const useAStar = () => {
    const [matrixWithPath, setMatrixWithPath] = useState<number[][]>([]);
    const [updateRender, setUpdateRender] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAStar = useCallback(
        async (request: Partial<MatrixRequest>) => {
            setUpdateRender(false);
            setError(null);
            const { matrix, startPoint, endPoint } = request;
            try {
                if (matrix && startPoint && endPoint) {
                    const res = await fetch('/api/grid/astar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(request),
                    });
                    const data: MatrixResponse = await res.json();
                    setMatrixWithPath(data.matrix);
                    setUpdateRender(true);
                    setError(null);
                } else {
                    setUpdateRender(false);
                }
            } catch (err) {
                console.error(`Failed to fetch A* path`, err);
                setUpdateRender(false);
                setError(JSON.stringify((err as Error).stack));
            }
        },
        []
    );
    return {
        matrixWithPath,
        updateRender,
        error,
        fetchAStar
    } as const;
};