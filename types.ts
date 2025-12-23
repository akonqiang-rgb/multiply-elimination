
export interface Cell {
  r: number;
  c: number;
  value: number;
}

// NodeData defines the structure for a 3D graph node as used in Node.tsx
export interface NodeData {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  label: string;
}

// LinkData defines the structure for an edge between two nodes as used in ThreeScene.tsx
export interface LinkData {
  source: string;
  target: string;
}
