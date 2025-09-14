import { useState, useCallback } from 'react';
import { IconKey, MatrixIconsRequest, MatrixIconsResponse } from '../../../shared/types/grid';
import { SharedGridState } from '../../../shared/state/grid';

const useMatrixIcons = ({ setError }: SharedGridState) => {
    const [matrixIcons, setMatrixIcons] = useState<IconKey[][] | null>(null);
    const fetchMatrixIcons = useCallback(
        async (potholes: [number, number][] | null, request: MatrixIconsRequest) => {
            try {
                if (potholes && request.obstacles) {
                    request.obstacles.push({ iconKey: 'POTHOLE', points: potholes, direction: null });
                }
                const res = await fetch('/api/grid/icons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(request),
                });
                const data: MatrixIconsResponse = await res.json();
                setMatrixIcons(data.matrix);
                setError(null);
            } catch (err) {
                console.error(`Failed to fetch icons for matrix`, err);
                setError("Error: Unable to load icons.");
            }
        }
    , [setError]);

    return { matrixIcons, fetchMatrixIcons } as const;
};

export default useMatrixIcons;