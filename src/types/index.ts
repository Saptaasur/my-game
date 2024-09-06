// src/types/index.ts

// Type for the position of a 3D object
export type Position = [number, number, number];

// Type for a falling shape
export type FallingShape = {
  id: number;
  shape: 'box' | 'sphere' | 'pyramid';
  position: Position;
};

// Type for vehicle controls
export type VehicleControls = {
  forward: boolean;
  backward: boolean;
  turnLeft: boolean;
  turnRight: boolean;
};

// Type for a score entry
export type ScoreEntry = {
  id: number;
  score: number;
  created_at: string;
};
