// src/components/ModelViewer/geometries/ComplexModels.ts
import * as THREE from 'three';

export const createComplexNut = (params: any): THREE.Group => {
  const group = new THREE.Group();

  // Tworzenie podstawowego sześciokątnego kształtu
  const nutShape = new THREE.Shape();
  for (let i = 0; i < params.corners; i++) {
    const angle = (i / params.corners) * Math.PI * 2;
    const radius = params.width / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) {
      nutShape.moveTo(x, y);
    } else {
      nutShape.lineTo(x, y);
    }
  }
  nutShape.closePath();

  // Dodanie fazowania
  const extrudeSettings = {
    steps: 1,
    depth: params.height,
    bevelEnabled: true,
    bevelThickness: params.chamfer,
    bevelSize: params.chamfer,
    bevelOffset: 0,
    bevelSegments: 5
  };

  // Tworzenie głównego kształtu nakrętki
  const geometry = new THREE.ExtrudeGeometry(nutShape, extrudeSettings);
  geometry.center();
  const material = new THREE.MeshStandardMaterial({
    color: params.color || '#808080',
    metalness: 0.8,
    roughness: 0.2
  });
  const mainBody = new THREE.Mesh(geometry, material);
  group.add(mainBody);

  // Tworzenie otworu
  const holeGeometry = new THREE.CylinderGeometry(
    params.holeRadius,
    params.holeRadius,
    params.height + 0.2,
    32
  );
  const holeMaterial = new THREE.MeshStandardMaterial({
    color: '#000000',
    metalness: 0.8,
    roughness: 0.2
  });
  const hole = new THREE.Mesh(holeGeometry, holeMaterial);
  hole.rotation.x = Math.PI / 2;
  group.add(hole);

  return group;
};

export const createComplexCup = (params: any): THREE.Group => {
  const group = new THREE.Group();

  // Główne ciało kubka
  const bodyGeometry = new THREE.CylinderGeometry(
    params.topRadius,
    params.bottomRadius,
    params.height,
    32,
    2,
    true
  );
  const material = new THREE.MeshStandardMaterial({
    color: params.color || '#ffffff',
    metalness: 0.1,
    roughness: 0.8,
    side: THREE.DoubleSide
  });
  const body = new THREE.Mesh(bodyGeometry, material);
  group.add(body);

  // Dno kubka
  const bottomGeometry = new THREE.CircleGeometry(params.bottomRadius, 32);
  const bottom = new THREE.Mesh(bottomGeometry, material);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = -params.height / 2;
  group.add(bottom);

  // Tworzenie uchwytu
  const handleCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(params.topRadius, params.height * 0.4, 0),
    new THREE.Vector3(params.topRadius + params.handleSize, params.height * 0.4, 0),
    new THREE.Vector3(params.topRadius + params.handleSize, -params.height * 0.4, 0),
    new THREE.Vector3(params.topRadius, -params.height * 0.4, 0)
  );

  const handleGeometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(handleCurve.getPoints(20)),
    20,
    params.handleThickness,
    8,
    false
  );
  const handle = new THREE.Mesh(handleGeometry, material);
  group.add(handle);

  return group;
};