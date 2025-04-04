import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Model3D } from '../../types/models';

interface ModelObjectProps {
  model: Model3D;
}

// Konfiguracja pozycjonowania
const MODEL_CONFIG = {
  MIN_HEIGHT: 0.01,     // Minimalna wysokość nad siatką
  CENTER_Y_MODELS: true, // Czy wyśrodkować modele w osi Y
  // Specjalne przesunięcia dla poszczególnych typów modeli
  OFFSETS: {
    complexCup: 0,      // Kubek powinien stać na siatce
    complexPlate: 0.05, // Talerz potrzebuje mniejszego przesunięcia
    diceCube: 0.0,      // Kostka powinna stać na siatce
    sphere: 0.5         // Kula powinna być wyżej (połowa promienia)
  }
};

export const ModelObject: React.FC<ModelObjectProps> = ({ model }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Funkcja do aktualizacji materiałów w grupie
  const updateGroupMaterials = (group: THREE.Group, material: THREE.Material) => {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        // Sprawdzamy, czy materiał jest typu MeshStandardMaterial
        if (child.material instanceof THREE.MeshStandardMaterial &&
            child.material.color.getHexString() !== '000000') {
          child.material = material.clone();
        }
      }
    });
  };

  // Hook do aktualizacji materiałów
  useEffect(() => {
    const ref = groupRef.current;
    if (ref) {
      const material = new THREE.MeshStandardMaterial({
        color: model.material.color,
        metalness: model.material.metalness || 0,
        roughness: model.material.roughness || 0.5,
      });
      updateGroupMaterials(ref, material);
    }
  }, [model.material]);

  // Hook do aktualizacji transformacji
  useEffect(() => {
    const ref = groupRef.current || meshRef.current;
    if (ref) {
      // Zapewniamy minimalną wysokość nad siatką
      const yPosition = correctedYPosition();
      
      ref.position.set(model.position.x, yPosition, model.position.z);
      ref.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z);
      ref.scale.set(model.scale.x, model.scale.y, model.scale.z);
    }
  }, [model.position, model.rotation, model.scale]);

  // Główne właściwości materiału
  const standardMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: model.material.color,
    metalness: model.material.metalness || 0,
    roughness: model.material.roughness || 0.5,
  }), [model.material]);

  // Materiał dla czarnych elementów (np. kropki na kostce)
  const blackMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#000000',
    metalness: 0,
    roughness: 0.9,
  }), []);

  // Funkcja do tworzenia kostki do gry
  const createDiceMesh = (params: any): THREE.Group => {
    const group = new THREE.Group();

    // Główny sześcian
    const boxGeometry = new THREE.BoxGeometry(params.size, params.size, params.size);
    const box = new THREE.Mesh(boxGeometry, standardMaterial);
    
    // Nie przesuwamy kostki w górę - powinna stać na siatce
    // box.position.y = params.size / 2; // Usuwamy to przesunięcie
    
    group.add(box);

    // Funkcja pomocnicza do tworzenia kropek
    const createDot = (x: number, y: number, z: number) => {
      const dotGeometry = new THREE.SphereGeometry(params.dotRadius, 16, 16);
      const dot = new THREE.Mesh(dotGeometry, blackMaterial);
      
      // Bez dodatkowego przesunięcia
      dot.position.set(x, y, z);
      
      return dot;
    };

    // Parametry kropek
    const s = params.size / 2; 
    const d = params.size * 0.3;

    // Ścianka 1 (jedna kropka - przód)
    group.add(createDot(0, 0, s));

    // Ścianka 2 (dwie kropki - tył)
    group.add(createDot(-d, d, -s));
    group.add(createDot(d, -d, -s));

    // Ścianka 3 (trzy kropki - prawa)
    group.add(createDot(s, d, d));
    group.add(createDot(s, 0, 0));
    group.add(createDot(s, -d, -d));

    // Ścianka 4 (cztery kropki - lewa)
    group.add(createDot(-s, -d, -d));
    group.add(createDot(-s, -d, d));
    group.add(createDot(-s, d, -d));
    group.add(createDot(-s, d, d));

    // Ścianka 5 (pięć kropek - góra)
    group.add(createDot(0, s, 0));     // środek
    group.add(createDot(-d, s, -d));   // lewy górny
    group.add(createDot(d, s, d));     // prawy dolny
    group.add(createDot(-d, s, d));    // lewy dolny
    group.add(createDot(d, s, -d));    // prawy górny

    // Ścianka 6 (sześć kropek - dół)
    for (let x of [-d, d]) {
      for (let z of [-d, 0, d]) {
        group.add(createDot(x, -s, z));
      }
    }

    return group;
  };

  // Funkcja do tworzenia śruby
  const createScrewMesh = (params: any): THREE.Group => {
    const group = new THREE.Group();

    // Łeb śruby (sześciokątny)
    const headGeometry = new THREE.CylinderGeometry(
      params.headRadius,
      params.headRadius,
      params.headHeight,
      6, // sześciokąt
      1, // jeden segment wysokości
      false
    );
    
    const head = new THREE.Mesh(headGeometry, standardMaterial);
    head.position.y = params.shankLength / 2 + params.headHeight / 2;
    group.add(head);

    // Trzon śruby
    const shankGeometry = new THREE.CylinderGeometry(
      params.shankRadius,
      params.shankRadius,
      params.shankLength,
      32
    );
    const shank = new THREE.Mesh(shankGeometry, standardMaterial);
    group.add(shank);

    // Gwint śruby
    const threadPoints: THREE.Vector3[] = [];
    const turns = Math.floor(params.shankLength / params.threadPitch);
    const pointsPerTurn = 64;

    for (let i = 0; i <= turns * pointsPerTurn; i++) {
      const angle = (i / pointsPerTurn) * Math.PI * 2;
      const y = (i / pointsPerTurn) * params.threadPitch - params.shankLength / 2;
      const radius = params.shankRadius + params.threadDepth * Math.sin(angle);
      threadPoints.push(
        new THREE.Vector3(
          radius * Math.cos(angle),
          y,
          radius * Math.sin(angle)
        )
      );
    }

    const threadGeometry = new THREE.BufferGeometry().setFromPoints(threadPoints);
    const threadMaterial = new THREE.LineBasicMaterial({ 
      color: model.material.color,
      linewidth: 2
    });
    const thread = new THREE.Line(threadGeometry, threadMaterial);
    group.add(thread);

    if (MODEL_CONFIG.CENTER_Y_MODELS) {
      // Śruba powinna stać na siatce - przesuwamy ją w górę o połowę wysokości trzonu
      group.position.y = params.shankLength / 2;
    }

    return group;
  };

  // Funkcja do tworzenia nakrętki
  const createComplexNut = (params: any): THREE.Group => {
    const group = new THREE.Group();

    // Tworzymy kształt sześciokąta
    const shape = new THREE.Shape();
    const size = params.width / 2;

    // Rysujemy sześciokąt
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = size * Math.cos(angle);
      const y = size * Math.sin(angle);
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();

    // Tworzymy otwór w kształcie koła
    const hole = new THREE.Path();
    hole.absarc(0, 0, params.holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    // Tworzymy geometrię przez wyciągnięcie kształtu
    const extrudeSettings = {
      depth: params.height,
      bevelEnabled: false
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(-Math.PI / 2); // Obracamy, żeby nakrętka była w odpowiedniej orientacji
    
    const nut = new THREE.Mesh(geometry, standardMaterial);
    
    // Przesuwamy do góry, ale tylko jeśli nie włączono opcji centrowania
    if (!MODEL_CONFIG.CENTER_Y_MODELS) {
      nut.position.y = params.height / 2;
    }
    
    group.add(nut);

    return group;
  };

  // Funkcja do tworzenia kubka
  const createComplexCup = (params: any): THREE.Group => {
    const group = new THREE.Group();

    // Parametry kubka
    const thickness = params.thickness;
    const height = params.height;
    const radius = params.topRadius;

    // Profil kubka - punkty definiujące przekrój
    const points = [];
    points.push(new THREE.Vector2(0, 0));                      // Środek dna
    points.push(new THREE.Vector2(radius, 0));                 // Zewnętrzna krawędź dna
    points.push(new THREE.Vector2(radius, height));            // Góra zewnętrznej ścianki
    points.push(new THREE.Vector2(radius - thickness, height)); // Góra wewnętrznej ścianki
    points.push(new THREE.Vector2(radius - thickness, thickness)); // Wewnętrzna ścianka przy dnie
    points.push(new THREE.Vector2(0, thickness));             // Środek wewnętrznego dna

    // Tworzymy kubek poprzez obrót profilu
    const cupGeometry = new THREE.LatheGeometry(points, 32);
    const cup = new THREE.Mesh(cupGeometry, standardMaterial);
    
    // Nie przesuwamy indywidualnych meshy
    group.add(cup);

    // Kubek musi być na siatce - to kluczowa zmiana
    group.position.y = 0;

    return group;
  };

  // Funkcja do tworzenia talerza
  const createComplexPlate = (params: any): THREE.Group => {
    const group = new THREE.Group();

    // Kształt profilu talerza
    const plateShape = new THREE.Shape();
    
    // Tworzymy kształt przekroju talerza z zaokrągleniami
    plateShape.moveTo(0, 0);
    plateShape.lineTo(params.radius - params.rimWidth, 0);
    plateShape.bezierCurveTo(
      params.radius - params.rimWidth * 0.8, 0,
      params.radius - params.rimWidth * 0.2, params.bottomThickness * 0.1,
      params.radius, params.bottomThickness
    );
    plateShape.lineTo(params.radius, params.bottomThickness + params.rimHeight);
    plateShape.bezierCurveTo(
      params.radius - params.rimWidth * 0.2, params.bottomThickness + params.rimHeight,
      params.radius - params.rimWidth * 0.8, params.bottomThickness + params.rimHeight * 0.9,
      params.radius - params.rimWidth, params.bottomThickness
    );
    plateShape.lineTo(0, params.bottomThickness);
    plateShape.lineTo(0, 0);

    // Tworzymy bryłę obrotową z profilu
    const plateGeometry = new THREE.LatheGeometry(
      plateShape.getPoints(64),
      64 // Segmenty obwodu
    );
    const plate = new THREE.Mesh(plateGeometry, standardMaterial);
    
    // Nie przesuwamy meshy
    group.add(plate);

    // Dekoracyjne okręgi na powierzchni
    const ringRadii = [0.3, 0.6, 0.8];
    ringRadii.forEach(radiusRatio => {
      const ringGeometry = new THREE.TorusGeometry(
        params.radius * radiusRatio,
        0.01,
        16,
        64
      );
      const ring = new THREE.Mesh(ringGeometry, standardMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = params.bottomThickness + 0.01;
      group.add(ring);
    });

    // Talerz musi stać na siatce
    group.position.y = 0;

    return group;
  };

  // Funkcja tworząca geometrię na podstawie typu modelu
  const createGeometry = (model: Model3D): THREE.Group | THREE.BufferGeometry => {
    switch (model.geometry.type) {
      case 'diceCube':
        return createDiceMesh(model.geometry.parameters);
      case 'complexScrew':
        return createScrewMesh(model.geometry.parameters);
      case 'complexNut':
        return createComplexNut(model.geometry.parameters);
      case 'complexCup':
        return createComplexCup(model.geometry.parameters);
      case 'complexPlate':
        return createComplexPlate(model.geometry.parameters);
      case 'box':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'sphere':
        return new THREE.SphereGeometry(0.5, 32, 32);
      case 'cylinder':
        const params = model.geometry.parameters as any;
        return new THREE.CylinderGeometry(
          params.radiusTop,
          params.radiusBottom,
          params.height,
          params.segments || 32
        );
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  };

  // Generowanie geometrii
  const geometry = useMemo(() => createGeometry(model), [model.geometry]);

  // Korekta pozycji Y dla modelu z uwzględnieniem typu
  const correctedYPosition = () => {
    // Początkowa minimalna wysokość
    let baseHeight = MODEL_CONFIG.MIN_HEIGHT;
    
    // Dodajemy specjalne przesunięcie zależne od typu modelu
    if (model.geometry.type in MODEL_CONFIG.OFFSETS) {
      baseHeight += MODEL_CONFIG.OFFSETS[model.geometry.type as keyof typeof MODEL_CONFIG.OFFSETS];
    } else if (model.geometry.type === 'box') {
      // Dla pudełka przesuwamy o połowę wysokości
      const params = model.geometry.parameters as any;
      baseHeight += (params?.height || 1) / 2;
    } else if (model.geometry.type === 'cylinder') {
      // Dla cylindra, przesuwamy o połowę wysokości
      const params = model.geometry.parameters as any;
      baseHeight += (params?.height || 1) / 2;
    }
    
    // Dla kostki specjalne traktowanie
    if (model.geometry.type === 'diceCube') {
      const params = model.geometry.parameters as any;
      baseHeight = (params?.size || 1) / 2;
    }
    
    // Dla kubka osobne traktowanie
    if (model.geometry.type === 'complexCup') {
      return model.position.y; // Używamy pozycji z modelu bez modyfikacji
    }
    
    // Zwracamy maksimum z pozycji modelu i minimalnej wysokości
    return Math.max(model.position.y, baseHeight);
  };

  // Renderowanie modelu
  if (geometry instanceof THREE.Group) {
    // Dla kubka i talerza używamy innej strategii
    if (model.geometry.type === 'complexCup' || model.geometry.type === 'complexPlate') {
      return (
        <group
          ref={groupRef}
          position={[model.position.x, model.position.y, model.position.z]}
          rotation={[model.rotation.x, model.rotation.y, model.rotation.z]}
          scale={[model.scale.x, model.scale.y, model.scale.z]}
        >
          <primitive 
            object={geometry}
            castShadow
            receiveShadow
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
            }}
          />
        </group>
      );
    }
    
    // Dla innych złożonych modeli
    return (
      <group
        ref={groupRef}
        position={[model.position.x, correctedYPosition(), model.position.z]}
        rotation={[model.rotation.x, model.rotation.y, model.rotation.z]}
        scale={[model.scale.x, model.scale.y, model.scale.z]}
      >
        <primitive 
          object={geometry}
          castShadow
          receiveShadow
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
          }}
        />
      </group>
    );
  }

  // Przypadek dla standardowych geometrii
  return (
    <mesh
      ref={meshRef}
      position={[model.position.x, correctedYPosition(), model.position.z]}
      rotation={[model.rotation.x, model.rotation.y, model.rotation.z]}
      scale={[model.scale.x, model.scale.y, model.scale.z]}
      geometry={geometry as THREE.BufferGeometry}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={model.material.color}
        metalness={model.material.metalness || 0}
        roughness={model.material.roughness || 0.5}
      />
    </mesh>
  );
}