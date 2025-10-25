
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  label: 'FIRE' | 'SMOKE';
  box: BoundingBox;
}

export type ProcessingState = 'idle' | 'processing' | 'done' | 'error';

export interface Progress {
  current: number;
  total: number;
  percentage: number;
}
