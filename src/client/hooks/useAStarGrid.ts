import { useState, useCallback } from 'react';
import type { PathResponse, AStarRequest } from '../../shared/types/grid-props';

export const useAStarGrid = () => {
    const [path, setPath] = useState<number[][]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAStar = useCallback(
        async (request: AStarRequest) => {
            setPath([]);
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch('/grid/astar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(request),
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: PathResponse = await res.json();
                setPath(data.path);
            } catch (err) {
                console.error(`Failed to fetch A* path`, err);
                setPath([]);
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );
    return {
        path,
        isLoading,
        error,
        fetchAStar
    } as const;
};