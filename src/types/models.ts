// src/types/models.ts
export type ModelCategory = 'mechanical' | 'geometric' | 'everyday';
export type CategoryFilter = ModelCategory | 'all';
export type ExportFormat = 'stl' | 'obj' | 'fbx';

interface DiceCubeParameters {
  size: number;
  dotRadius: number;
  dotDepth: number;
  rounded: number;
}

interface BoxParameters {
  width: number;
  height: number;
  depth: number;
  chamfer?: number;
}

interface SphereParameters {
  radius: number;
  segments?: number;
}

interface CylinderParameters {
  height: number;
  radiusTop: number;
  radiusBottom: number;
  segments?: number;
}

interface ScrewParameters {
  shankLength: number;
  shankRadius: number;
  threadPitch: number;
  headHeight: number;
  headRadius: number;
  headType: number;
  threadDepth: number;
  threadAngle: number;
  chamferSize: number;  // Dodane
}

interface NutParameters {
  width: number;
  height: number;
  holeRadius: number;
  threadPitch: number;
  threadDepth: number;
  corners: number;
  chamfer: number;
  detail?: number;
  threadStart?: number;
}

interface CupParameters {
  topRadius: number;
  bottomRadius: number;
  height: number;
  thickness: number;
  handleSize: number;
  handleThickness: number;
}

interface PlateParameters {
  radius: number;
  height: number;
  rimHeight: number;
  rimWidth: number;
  bottomThickness: number;
  segments: number;
  detail: number;
}

export type GeometryType = 
  | 'diceCube' 
  | 'box' 
  | 'sphere' 
  | 'cylinder' 
  | 'complexScrew' 
  | 'complexNut'
  | 'complexCup'
  | 'complexPlate';

export type GeometryParameters = 
  | DiceCubeParameters 
  | BoxParameters 
  | SphereParameters 
  | CylinderParameters
  | ScrewParameters 
  | NutParameters
  | CupParameters
  | PlateParameters;

export interface Model3D {
  id: string;
  name: string;
  category: ModelCategory;
  geometry: {
    type: GeometryType;
    parameters: GeometryParameters;
  };
  material: {
    color: string;
    metalness?: number;
    roughness?: number;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}