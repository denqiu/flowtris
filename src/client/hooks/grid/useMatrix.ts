import { useState, useCallback } from 'react';
import { MatrixResponse, MatrixRequest_B, MatrixIconsRequest, IconKey } from '../../../shared/types/grid';
import { SharedGridState } from "../../../shared/state/grid";

const useMatrix_B = ({ setError }: SharedGridState) => {
    const [updateMatrix, setUpdateMatrix] = useState<number[][] | null>([]);
    const [selectedPath, setSelectedPath] = useState<[number, number][] | null>(null);
    const [matrixIcons, setMatrixIcons] = useState<IconKey[][] | null>(null);
    const fetchMatrix = useCallback(
        async (request: Partial<MatrixRequest_B> & Partial<MatrixIconsRequest>) => {
            const { matrix, startPoint, endPoint } = request;
            try {
                if (matrix) {
                    setUpdateMatrix(matrix);
                    setSelectedPath(null);
                    setMatrixIcons(null);
                    if (startPoint && endPoint) {
                        const res = await fetch('/api/grid/B', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(request)
                        });
                        const data: MatrixResponse = await res.json();
                        setUpdateMatrix(data.matrix);
                        setSelectedPath(data.selectedPath);
                        setMatrixIcons(data.matrixIcons);
                    }
                    setError(null);
                } else {
                    setUpdateMatrix(null);
                    setSelectedPath(null);
                    setMatrixIcons(null);
                    setError("Error: Matrix is required.");
                }
            } catch (err) {
                console.error(err);
                setUpdateMatrix(null);
                setSelectedPath(null);
                setMatrixIcons(null);
                setError("Error: Grid failed to load.");
            }
        }
    , [setError]);
    
    return { updateMatrix, selectedPath, matrixIcons, fetchMatrix } as const;
};

export { useMatrix_B };