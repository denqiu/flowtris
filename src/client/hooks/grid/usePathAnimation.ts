import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState } from '../../../shared/types/level';
import { IconDirection } from '../../../shared/types/grid';

export interface PathAnimationConfig {
  path: [number, number][];
  vehicleType: 'car' | 'bus';
  speed: number; // milliseconds between moves
  loop: boolean;
}

export interface VehiclePosition {
  position: [number, number];
  direction: IconDirection;
  vehicleType: 'car' | 'bus';
  isAnimating: boolean;
}

const usePathAnimation = (
  gameState: GameState,
  selectedPath: [number, number][] | null,
  speed: number
) => {
  const [currentPathIndex, setCurrentPathIndex] = useState<number | null>(
    selectedPath ? 0 : null
  );
  const [vehicles, setVehicles] = useState<Record<string, VehiclePosition>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // Calculate direction between two points
  const getDirection = useCallback((from: [number, number], to: [number, number]): IconDirection => {
    const [fromX, fromY] = from;
    const [toX, toY] = to;

    if (toX > fromX) return 'down';
    if (toX < fromX) return 'up';
    if (toY > fromY) return 'right';
    if (toY < fromY) return 'left';

    return 'down'; // default
  }, []);

  // clear interval helper
  const clearAnimInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start vehicle animation
  const startVehicleAnimation = useCallback((
    vehicleId: string, 
    config: PathAnimationConfig
  ) => {
    if (config.path.length === 0) return;

    // Clear any existing animation for this vehicle
    if (animationRefs.current[vehicleId]) {
      clearInterval(animationRefs.current[vehicleId]);
    }

    let currentIndex = 0;
    const startPosition = config.path[0];
    if (!startPosition) return; // Guard against undefined position

    const direction = config.path.length > 1 && config.path[1] ? 
      getDirection(startPosition, config.path[1]) : 'down';

    // Set initial vehicle position
    setVehicles(prev => ({
      ...prev,
      [vehicleId]: {
        position: startPosition,
        direction,
        vehicleType: config.vehicleType,
        isAnimating: true
      }
    }));

    // Start animation
    const animationInterval = setInterval(() => {
      currentIndex++;

      if (currentIndex >= config.path.length) {
        // Animation complete
        if (config.loop) {
          currentIndex = 0; // Reset for loop
        } else {
          clearInterval(animationRefs.current[vehicleId]);
          delete animationRefs.current[vehicleId];
          
          setVehicles(prev => {
            const existingVehicle = prev[vehicleId];
            if (!existingVehicle) return prev;
            
            return {
              ...prev,
              [vehicleId]: {
                position: existingVehicle.position,
                direction: existingVehicle.direction,
                vehicleType: existingVehicle.vehicleType,
                isAnimating: false
              }
            };
          });
          return;
        }
      }

      const currentPosition = config.path[currentIndex];
      if (!currentPosition) return; // Guard against undefined position
      
      const nextPosition = config.path[currentIndex + 1];
      const currentDirection = nextPosition ? 
        getDirection(currentPosition, nextPosition) : direction;

      setVehicles(prev => {
        const existingVehicle = prev[vehicleId];
        return {
          ...prev,
          [vehicleId]: {
            position: currentPosition,
            direction: currentDirection,
            vehicleType: existingVehicle?.vehicleType || 'car',
            isAnimating: true
          }
        };
      });
    }, config.speed);

    animationRefs.current[vehicleId] = animationInterval;
  }, [getDirection]);

  const stopVehicleAnimation = useCallback((vehicleId: string) => {
    if (animationRefs.current[vehicleId]) {
      clearInterval(animationRefs.current[vehicleId]);
      delete animationRefs.current[vehicleId];
    }
    
    setVehicles(prev => {
      const existingVehicle = prev[vehicleId];
      if (!existingVehicle) return prev;
      
      return {
        ...prev,
        [vehicleId]: {
          position: existingVehicle.position,
          direction: existingVehicle.direction,
          vehicleType: existingVehicle.vehicleType,
          isAnimating: false
        }
      };
    });
  }, []);

  useEffect(() => {
    const currentIntervals = animationRefs.current;
    
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

    return () => {
      clearAnimInterval();
      // Cleanup vehicle animations using captured reference
      const intervals = Object.values(currentIntervals);
      intervals.forEach(interval => {
        clearInterval(interval);
      });
    };
  }, [gameState, selectedPath, speed]);

  const animatedPath = selectedPath?.slice(0, currentPathIndex ?? 0) ?? [];

  return { 
    currentPathIndex, 
    animatedPath, 
    vehicles,
    startVehicleAnimation,
    stopVehicleAnimation
  };
};

export default usePathAnimation;
