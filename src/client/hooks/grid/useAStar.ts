import { useState, useCallback } from 'react';
import type { MatrixResponse, MatrixRequest } from '../../../shared/types/grid';

/**
 * If success, update render with path in matrix. If error, don't update render and keep previous matrix with path if available.
 */
export const useAStar = () => {
    const [matrixWithPath, setMatrixWithPath] = useState<number[][]>([]);
    const [updateRender, setUpdateRender] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAStar = useCallback(
        async (request: Partial<MatrixRequest>) => {
            setUpdateRender(false);
            setError(null);
            setIsLoading(true);
            const { matrix, startPoint, endPoint } = request;
            try {
                if (matrix && startPoint && endPoint) {
                    const res = await fetch('/grid/astar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(request),
                    });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );
    return {
        matrixWithPath,
        updateRender,
        isLoading,
        error,
        fetchAStar
    } as const;
};