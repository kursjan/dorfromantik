import { HexCoordinate } from '../models/HexCoordinate';

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface MouseState {
  isDragging: boolean;
  startX: number;
  startY: number;
}
