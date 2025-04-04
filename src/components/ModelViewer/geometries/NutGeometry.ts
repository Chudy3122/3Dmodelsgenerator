// src/components/ModelViewer/geometries/NutGeometry.ts
import * as THREE from 'three';

export const createNutMesh = (params: any) => {
  const {
    width,
    height,
    holeRadius,
    threadPitch,
    threadDepth,
    corners,
    chamfer
  } = params;

  const group = new THREE.Group();

  // Tworzenie głównego kształtu nakrętki (sześciokąt)
  const nutShape = new THREE.Shape();
  for (let i = 0; i < corners; i++) {
    const angle = (i / corners) * Math.PI * 2;
    const x = width * Math.cos(angle);
    const y = width * Math.sin(angle);
    if (i === 0) {
      nutShape.moveTo(x, y);
    } else {
      nutShape.lineTo(x, y);
    }
  }
  nutShape.closePath();

  // Tworzenie geometrii nakrętki przez wyciągnięcie kształtu
  const extrudeSettings = {
    depth: height,
    bevelEnabled: Boolean(chamfer),
    bevelThickness: chamfer || 0,
    bevelSize: chamfer || 0,
    bevelSegments: 3
  };

  const nutGeometry = new THREE.ExtrudeGeometry(nutShape, extrudeSettings);
  const nut = new THREE.Mesh(nutGeometry);
  nut.position.z = -height / 2;
  group.add(nut);

  // Tworzenie otworu
  const holeGeometry = new THREE.CylinderGeometry(
    holeRadius,
    holeRadius,
    height + 0.2,
    32
  );
  const hole = new THREE.Mesh(holeGeometry);
  hole.rotation.x = Math.PI / 2;
  group.add(hole);

  // Dodawanie gwintu wewnętrznego
  const helixPoints = [];
  const turns = Math.floor(height / threadPitch);
  const pointsPerTurn = 32;

  for (let i = 0; i <= turns * pointsPerTurn; i++) {
    const angle = (i / pointsPerTurn) * Math.PI * 2;
    const z = (i / pointsPerTurn) * threadPitch - height / 2;
    const radius = holeRadius - threadDepth * Math.sin(angle);
    helixPoints.push(
      new THREE.Vector3(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        z
      )
    );
  }

  const helixGeometry = new THREE.BufferGeometry().setFromPoints(helixPoints);
  const helix = new THREE.Line(helixGeometry);
  group.add(helix);

  // Tworzenie grup CSG dla odjęcia otworu od nakrętki
  return group;
};