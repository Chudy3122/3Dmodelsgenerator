import React from 'react';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';

interface DimensionLineProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  offset?: number;
  value: number;
  unit?: string;
}

export const DimensionLine: React.FC<DimensionLineProps> = ({
  start,
  end,
  offset = 0.5,
  value,
  unit = 'mm'
}) => {
  // Obliczamy kierunek wymiaru
  const direction = new THREE.Vector3().subVectors(end, start).normalize();
  const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);

  // Punkty dla linii wymiarowej
  const offsetStart = start.clone().add(perpendicular.multiplyScalar(offset));
  const offsetEnd = end.clone().add(perpendicular.multiplyScalar(offset));

  // Punkty dla linii pomocniczych
  const extensionPoints = [
    start,
    offsetStart,
    offsetEnd,
    end
  ];

  // Punkt środkowy dla tekstu
  const textPosition = new THREE.Vector3().addVectors(offsetStart, offsetEnd).multiplyScalar(0.5);

  return (
    <group>
      {/* Linie pomocnicze */}
      <Line
        points={extensionPoints}
        color="black"
        lineWidth={1}
        dashed={false}
      />
      
      {/* Strzałki wymiarowe */}
      <group position={offsetStart.toArray()}>
        <mesh>
          <coneGeometry args={[0.05, 0.1, 8]} />
          <meshBasicMaterial color="black" />
        </mesh>
      </group>
      
      <group position={offsetEnd.toArray()}>
        <mesh rotation={[0, Math.PI, 0]}>
          <coneGeometry args={[0.05, 0.1, 8]} />
          <meshBasicMaterial color="black" />
        </mesh>
      </group>

      {/* Tekst wymiaru */}
      <Text
        position={textPosition.toArray()}
        color="black"
        fontSize={0.2}
        anchorX="center"
        anchorY="middle"
      >
        {`${value}${unit}`}
      </Text>
    </group>
  );
};

interface ModelDimensionsProps {
  model: any; // Tu dodaj odpowiedni typ dla modelu
  scale?: number;
}

export const ModelDimensions: React.FC<ModelDimensionsProps> = ({ model, scale = 1 }) => {
  // Funkcja do pobierania wymiarów z modelu
  const getDimensions = () => {
    const dimensions = [];
    
    // Przykład dla nakrętki
    if (model.geometry.type === 'complexNut') {
      const params = model.geometry.parameters;
      dimensions.push({
        start: new THREE.Vector3(-params.width/2, 0, 0),
        end: new THREE.Vector3(params.width/2, 0, 0),
        value: params.width * scale,
        offset: params.width
      });
      dimensions.push({
        start: new THREE.Vector3(0, 0, 0),
        end: new THREE.Vector3(0, params.height, 0),
        value: params.height * scale,
        offset: params.width/2
      });
    }
    // Dodaj podobne warunki dla innych typów modeli
    
    return dimensions;
  };

  const dimensions = getDimensions();

  return (
    <group>
      {dimensions.map((dim, index) => (
        <DimensionLine
          key={index}
          start={dim.start}
          end={dim.end}
          offset={dim.offset}
          value={Math.round(dim.value * 10) / 10}
        />
      ))}
    </group>
  );
};