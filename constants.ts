
import { NodeData, LinkData } from './types';

export const GAME_CONFIG = {
  COLS: 13,
  ROWS: 13,
};

// INITIAL_DATA provides the starting nodes and links for the 3D graph visualization in ThreeScene.tsx
export const INITIAL_DATA: { nodes: NodeData[]; links: LinkData[] } = {
  nodes: [
    { id: '1', x: 0, y: 0, z: 0, size: 1, color: '#4f46e5', label: 'Central Hub' },
    { id: '2', x: 5, y: 2, z: -2, size: 0.8, color: '#10b981', label: 'Compute A' },
    { id: '3', x: -4, y: 3, z: 3, size: 0.8, color: '#f59e0b', label: 'Storage B' },
    { id: '4', x: 2, y: -5, z: 1, size: 0.7, color: '#ef4444', label: 'Network C' },
    { id: '5', x: -3, y: -2, z: -4, size: 0.6, color: '#8b5cf6', label: 'Edge D' },
  ],
  links: [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '1', target: '4' },
    { source: '1', target: '5' },
    { source: '2', target: '3' },
    { source: '3', target: '5' },
  ],
};
