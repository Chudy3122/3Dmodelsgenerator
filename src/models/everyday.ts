// src/models/everyday.ts
import { Model3D } from '../types/models';

export const everydayModels: Model3D[] = [
  {
    id: 'daily_1',
    name: 'Kubek',
    category: 'everyday',
    geometry: {
      type: 'complexCup',
      parameters: {
        height: 1.4,          // Zwiększona wysokość
        topRadius: 0.4,       // Promień górny
        bottomRadius: 0.35,   // Lekko mniejszy promień dolny
        thickness: 0.05,      // Grubość ścianki
        handleSize: 0.4,      // Zmniejszony rozmiar uchwytu
        handleThickness: 0.06 // Cieńszy uchwyt
      },
    },
    material: {
      color: '#ffffff',
      metalness: 0,
      roughness: 0.5,
    },
    scale: { x: 1, y: 1, z: 1 },
    position: { x: 0, y: 0.7, z: 0 }, // Podniesiony do góry
    rotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'daily_2',
    name: 'Talerz',
    category: 'everyday',
    geometry: {
      type: 'complexPlate',
      parameters: {
        radius: 1.2,
        height: 0.1,
        rimHeight: 0.15,
        rimWidth: 0.2,
        bottomThickness: 0.05,
        segments: 64,
        detail: 32
      },
    },
    material: {
      color: '#ffffff',
      metalness: 0,
      roughness: 0.3,
    },
    scale: { x: 1, y: 1, z: 1 },
    position: { x: 0, y: 0.05, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  }
];