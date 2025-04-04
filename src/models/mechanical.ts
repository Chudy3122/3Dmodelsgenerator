// src/models/mechanical.ts
import { Model3D } from '../types/models';

export const mechanicalModels: Model3D[] = [
  {
    id: 'mech_1',
    name: 'Śruba M8',
    category: 'mechanical',
    geometry: {
      type: 'complexScrew',
      parameters: {
        shankLength: 1.0,      // Długość trzpienia
        shankRadius: 0.2,      // Promień trzpienia
        threadPitch: 0.05,     // Odstęp między zwojami gwintu
        headHeight: 0.2,       // Wysokość łba (zmniejszona)
        headRadius: 0.4,       // Promień łba (dopasowany)
        headType: 6,           // Sześciokątny
        threadDepth: 0.03,     // Głębokość gwintu
        threadAngle: 60,       // Kąt gwintu
        chamferSize: 0.02      // Wielkość fazowania
      },
    },
    material: {
      color: '#808080',
      metalness: 0.8,
      roughness: 0.2,
    },
    scale: { x: 1, y: 1, z: 1 },
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'mech_2',
    name: 'Nakrętka M8',
    category: 'mechanical',
    geometry: {
      type: 'complexNut',
      parameters: {
        width: 0.8,           // Szerokość nakrętki
        height: 0.2,          // Wysokość nakrętki (zmniejszona)
        holeRadius: 0.2,      // Promień otworu (dopasowany do śruby)
        threadPitch: 0.05,    // Odstęp między zwojami (jak w śrubie)
        threadDepth: 0.03,    // Głębokość gwintu
        corners: 6,           // Liczba boków (sześciokąt)
        chamfer: 0.04,        // Fazowanie krawędzi
        detail: 32,           // Detale geometrii
        threadStart: 0.02     // Początek gwintu
      },
    },
    material: {
      color: '#808080',
      metalness: 0.8,
      roughness: 0.2,
    },
    scale: { x: 1, y: 1, z: 1 },
    position: { x: 0, y: 0.1, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  }
];