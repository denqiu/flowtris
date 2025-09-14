import { useState, useCallback } from 'react';
import type { MatrixResponse, MatrixRequest_A, MatrixRequest_B } from '../../../shared/types/grid';
import { SharedGridState } from "../../../shared/state/grid"

/**
 * If success, update render with path in matrix. If error, don't update render and keep previous matrix with path if available.
 * 
 * @deprecated
 */
const useMatrixPaths_A = ({ setError }: SharedGridState) => {
    const [updateMatrix, setUpdateMatrix] = useState<number[][] | null>([]);
    const [selectedPath, setSelectedPath] = useState<[number, number][]>([]);
    const fetchMatrixPaths = useCallback(
        async (request: Partial<MatrixRequest_A>) => {
            const { matrix, paths } = request;
            try {
                if (matrix) {
                    setUpdateMatrix(matrix);
                    if (paths && paths.selectedPathIndex >= 0 && paths.selectedPathIndex < paths.points.length) {
                        const res = await fetch('/api/grid/paths/A', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
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


/**
 * If success, update render with path in matrix. If error, don't update render and keep previous matrix with path if available.
 */
const useMatrixPaths_B = ({ setError }: SharedGridState) => {
    const [updateMatrix, setUpdateMatrix] = useState<number[][] | null>([]);
    const [selectedPath, setSelectedPath] = useState<[number, number][] | null>(null);
    const [potholes, setPotholes] = useState<[number, number][] | null>(null);
    const fetchMatrixPaths = useCallback(
        async (request: Partial<MatrixRequest_B>) => {
            const { matrix, startPoint, endPoint } = request;
            try {
                if (matrix) {
                    setUpdateMatrix(matrix);
                    setSelectedPath(null);
                    setPotholes(null);
                    if (startPoint && endPoint) {
                        const res = await fetch('/api/grid/paths/B', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(request)
                        });
                        const data: MatrixResponse = await res.json();
                        setUpdateMatrix(data.matrix);
                        setSelectedPath(data.selectedPath);
                        setPotholes(data.potholes);
                    }
                    setError(null);
                } else {
                    setUpdateMatrix(null);
                    setSelectedPath(null);
                    setPotholes(null);
                    setError("Error: Matrix is required.");
                }
            } catch (err) {
                console.error(err);
                setUpdateMatrix(null);
                setSelectedPath(null);
                setPotholes(null);
                setError("Error: Grid failed to load paths.");
            }
        }
    , [setError]);
    return { updateMatrix, selectedPath, potholes, fetchMatrixPaths } as const;
};

export { useMatrixPaths_A, useMatrixPaths_B };