// src/models/index.ts
import { mechanicalModels } from './mechanical';
import { geometricModels } from './geometric';
import { everydayModels } from './everyday';
import { Model3D } from '../types/models';

// Eksportujemy wszystkie modele
export const allModels: Model3D[] = [
  ...mechanicalModels,
  ...geometricModels,
  ...everydayModels
];

// Eksportujemy modele według kategorii
export {
  mechanicalModels,
  geometricModels,
  everydayModels
};