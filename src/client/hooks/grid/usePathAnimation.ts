import { useState, useEffect, useRef } from 'react';
import { GameState } from '../../../shared/types/level';

const usePathAnimation = (
  gameState: GameState,
  selectedPath: [number, number][] | null,
  speed: number
) => {
  const [currentPathIndex, setCurrentPathIndex] = useState<number | null>(
    selectedPath ? 0 : null
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // clear interval helper
  const clearAnimInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!selectedPath) {
      clearAnimInterval();
      setCurrentPathIndex(null);
      return;
    }

    if (gameState === 'paused') {
      clearAnimInterval();
      return;
    }

    if (gameState === 'playing') {
      clearAnimInterval();

      intervalRef.current = setInterval(() => {
        setCurrentPathIndex((prev) => {
          if (prev === null) return 0;
          if (prev < selectedPath.length) return prev + 1;
          clearAnimInterval();
          return prev;
        });
      }, speed);
    }

    return clearAnimInterval;
  }, [gameState, selectedPath, speed]);

  const animatedPath = selectedPath?.slice(0, currentPathIndex ?? 0) ?? [];

  return { currentPathIndex, animatedPath };
};