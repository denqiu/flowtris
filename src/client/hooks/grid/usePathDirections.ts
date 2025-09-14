import { useState, useCallback } from 'react';
import { MatrixDirectionsRequest, MatrixDirectionsResponse } from '../../../shared/types/grid';

interface UsePathDirectionsProps {
  setError: (error: string | null) => void;
}

interface UsePathDirectionsReturn {
  directionMatrix: string[][] | null;
  isLoading: boolean;
  fetchPathDirections: (paths: MatrixDirectionsRequest) => Promise<void>;
}

export const usePathDirections = ({ setError }: UsePathDirectionsProps): UsePathDirectionsReturn => {
  const [directionMatrix, setDirectionMatrix] = useState<string[][] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPathDirections = useCallback(async (paths: MatrixDirectionsRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/grid/directions/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paths),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MatrixDirectionsResponse = await response.json();
      
      if (data.status === 'success') {
        setDirectionMatrix(data.matrix);
      } else {
        throw new Error(data.message || 'Failed to calculate path directions');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      setDirectionMatrix(null);
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  return {
    directionMatrix,
    isLoading,
    fetchPathDirections,
  };
};
