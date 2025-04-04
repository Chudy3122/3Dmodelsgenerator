// src/components/ModelViewer/geometries/ScrewGeometry.ts
import * as THREE from 'three';

export const createScrewMesh = (params: any) => {
  const {
    shankLength,
    shankRadius,
    threadPitch,
    headHeight,
    headRadius,
    headType,
    threadDepth,
    threadAngle
  } = params;

  const group = new THREE.Group();

  // Tworzenie łba śruby
  const headGeometry = new THREE.CylinderGeometry(
    headRadius,
    headRadius,
    headHeight,
    headType === 'hex' ? 6 : 32
  );
  const head = new THREE.Mesh(headGeometry);
  head.position.y = shankLength / 2 + headHeight / 2;
  group.add(head);

  // Tworzenie trzpienia
  const shankGeometry = new THREE.CylinderGeometry(
    shankRadius,
    shankRadius,
    shankLength,
    32
  );
  const shank = new THREE.Mesh(shankGeometry);
  group.add(shank);

  // Tworzenie gwintu
  const helixPoints = [];
  const turns = Math.floor(shankLength / threadPitch);
  const pointsPerTurn = 32;
  
  for (let i = 0; i <= turns * pointsPerTurn; i++) {
    const angle = (i / pointsPerTurn) * Math.PI * 2;
    const y = (i / pointsPerTurn) * threadPitch - shankLength / 2;
    const radius = shankRadius + threadDepth * Math.sin(angle);
    helixPoints.push(
      new THREE.Vector3(
        radius * Math.cos(angle),
        y,
        radius * Math.sin(angle)
      )
    );
  }

  const helixGeometry = new THREE.BufferGeometry().setFromPoints(helixPoints);
  const helix = new THREE.Line(helixGeometry);
  group.add(helix);

  return group;
};