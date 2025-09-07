import type { MatrixRequest } from "../../shared/types/grid";

// Partial applies ? to all fields in MatrixRequest
export interface GridProps extends Partial<MatrixRequest> {
  rows?: number;
  columns?: number;
}