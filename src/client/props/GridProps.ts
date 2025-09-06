import type { AStarRequest } from "../../shared/types/grid-props";

// Partial applies ? to all fields in AStarRequest
export interface GridProps extends Partial<AStarRequest> {
  rows?: number;
  columns?: number;
}