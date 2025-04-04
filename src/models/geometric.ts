// src/models/geometric.ts
import { Model3D } from '../types/models';

export const geometricModels: Model3D[] = [
  {
    id: 'geo_1',
    name: 'Kostka',
    category: 'geometric',
    geometry: {
      type: 'diceCube',
      parameters: {
        size: 1,
        dotRadius: 0.08,
        dotDepth: 0.1,
        rounded: 0.1
      },
    },
    material: {
      color: '#ffffff',
      metalness: 0,
      roughness: 0.5,
    },
    scale: { x: 1, y: 1, z: 1 },
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'geo_2',
    name: 'Sześcian',
    category: 'geometric',
    geometry: {
      type: 'box',
      parameters: {
        width: 1,
        height: 1,
        depth: 1,
        chamfer: 0.05
      },
    },
    material: {
      color: '#ff0000',
      metalness: 0,
      roughness: 0.5,
    },
    scale: { x: 1, y: 1, z: 1 },
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'geo_3',
    name: 'Kula',
    category: 'geometric',
    geometry: {
      type: 'sphere',
      parameters: {
        radius: 0.5,
        segments: 32
      },
    },
    material: {
      color: '#0000ff',
      metalness: 0.2,
      roughness: 0.3,
    },
    scale: { x: 1, y: 1, z: 1 },
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  }
];