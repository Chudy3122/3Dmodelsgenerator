// src/components/ModelViewer/geometries/DiceGeometry.ts
import * as THREE from 'three';

export const createDiceMesh = (params: {
  size: number;
  dotRadius: number;
  dotDepth: number;
  rounded: number;
}) => {
  const { size, dotRadius, dotDepth, rounded } = params;
  const mesh = new THREE.BufferGeometry();

  // Tworzymy podstawowy sześcian
  const boxGeometry = new THREE.BoxGeometry(size, size, size);

  // Tworzymy kropki dla każdej ściany
  const dotGeometry = new THREE.CircleGeometry(dotRadius, 32);
  const dotPositions = [
    [[0, 0, size/2]], // 1
    [[-0.3, 0.3, size/2], [0.3, -0.3, size/2]], // 2
    [[-0.3, 0.3, size/2], [0, 0, size/2], [0.3, -0.3, size/2]], // 3
    [[-0.3, 0.3, size/2], [-0.3, -0.3, size/2], [0.3, 0.3, size/2], [0.3, -0.3, size/2]], // 4
    [[-0.3, 0.3, size/2], [-0.3, -0.3, size/2], [0, 0, size/2], [0.3, 0.3, size/2], [0.3, -0.3, size/2]], // 5
    [[-0.3, 0.3, size/2], [-0.3, 0, size/2], [-0.3, -0.3, size/2], [0.3, 0.3, size/2], [0.3, 0, size/2], [0.3, -0.3, size/2]] // 6
  ];

  const mergedGeometry = boxGeometry;

  return mergedGeometry;
};