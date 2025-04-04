// src/components/ModelViewer/ModelViewer.tsx
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  Environment, 
  SoftShadows, 
  ContactShadows,
  Line,
  Html
} from '@react-three/drei';
import { Model3D } from '../../types/models';
import { ModelObject } from './ModelObject';
import * as THREE from 'three';

interface ModelViewerProps {
  model: Model3D | null;
}

interface DimensionLineProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  label: string;
  offset?: number;
  color?: string;
  position?: 'front' | 'side' | 'top';
}

interface Dimension extends DimensionLineProps {
  position?: 'front' | 'side' | 'top';
}

// Improved HTML label component
const HtmlLabel: React.FC<{ position: THREE.Vector3; children: React.ReactNode }> = ({ position, children }) => {
  return (
    <Html position={position} center style={{
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '3px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: 'black',
      pointerEvents: 'none',
      userSelect: 'none',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    }}>
      {children}
    </Html>
  );
};

// Improved dimensional line with arrows
const DimensionLine: React.FC<DimensionLineProps> = ({ 
  start, 
  end, 
  label, 
  offset = 0.2,
  color = '#000000',
  position = 'front'
}) => {
  // Use useFrame to update the label position in sync with the camera
  const htmlRef = useRef<THREE.Group>(null);
  
  // Calculate direction and positioning for the dimension line
  const direction = end.clone().sub(start).normalize();
  const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
  
  const startPoint = start.clone().add(perpendicular.multiplyScalar(offset));
  const endPoint = end.clone().add(perpendicular.multiplyScalar(offset));
  const center = startPoint.clone().add(endPoint).multiplyScalar(0.5);

  // Fixed arrow size that doesn't scale with zoom
  const arrowSize = 0.05;
  const arrowAngle = Math.PI / 6; // 30 degrees
  
  const lineDirection = endPoint.clone().sub(startPoint).normalize();
  const arrowLeft = lineDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), arrowAngle);
  const arrowRight = lineDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -arrowAngle);
  
  const startArrow1 = startPoint.clone().add(arrowLeft.multiplyScalar(arrowSize));
  const startArrow2 = startPoint.clone().add(arrowRight.multiplyScalar(arrowSize));
  
  // Reverse direction for end arrow
  const endLineDirection = startPoint.clone().sub(endPoint).normalize();
  const endArrowLeft = endLineDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), arrowAngle);
  const endArrowRight = endLineDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -arrowAngle);
  
  const endArrow1 = endPoint.clone().add(endArrowLeft.multiplyScalar(arrowSize));
  const endArrow2 = endPoint.clone().add(endArrowRight.multiplyScalar(arrowSize));
  
  // Make sure labels always face the camera
  useFrame(({ camera }) => {
    if (htmlRef.current) {
      htmlRef.current.lookAt(camera.position);
    }
  });

  return (
    <group renderOrder={2}>
      {/* Extension lines from model to dimension line */}
      <Line
        points={[start, startPoint]}
        color={color}
        lineWidth={1}
        renderOrder={3}
      />
      <Line
        points={[endPoint, end]}
        color={color}
        lineWidth={1}
        renderOrder={3}
      />
      
      {/* Main dimension line */}
      <Line
        points={[startPoint, endPoint]}
        color={color}
        lineWidth={1.5}
        renderOrder={3}
      />
      
      {/* Arrow heads for dimension line */}
      <Line
        points={[startPoint, startArrow1]}
        color={color}
        lineWidth={1}
        renderOrder={3}
      />
      <Line
        points={[startPoint, startArrow2]}
        color={color}
        lineWidth={1}
        renderOrder={3}
      />
      <Line
        points={[endPoint, endArrow1]}
        color={color}
        lineWidth={1}
        renderOrder={3}
      />
      <Line
        points={[endPoint, endArrow2]}
        color={color}
        lineWidth={1}
        renderOrder={3}
      />
      
      {/* Label */}
      <group ref={htmlRef}>
        <HtmlLabel position={center}>
          {label}
        </HtmlLabel>
      </group>
    </group>
  );
};

const ModelDimensions: React.FC<{ model: Model3D }> = ({ model }) => {
  const roundTo1 = (num: number) => Math.round(num * 10) / 10;
  const [measurements, setMeasurements] = useState<Dimension[]>([]);
  
  // Camera position tracking without useFrame to prevent rapid re-renders
  const { camera } = useThree();
  
  // Call this only on mount and when model.geometry changes
  useEffect(() => {
    const params = model.geometry.parameters as any;
    const scaleFactor = Math.max(model.scale.x, model.scale.y, model.scale.z);
    const offsetBase = 0.15 * scaleFactor;
    
    const dimensions: Dimension[] = [];
    
    const createDimension = (start: THREE.Vector3, end: THREE.Vector3, value: number, unit: string = 'mm', options = {}) => {
      const defaultOptions = {
        offset: offsetBase,
        color: '#0066cc',
        isDiameter: false,
        position: 'front' as 'front' | 'side' | 'top'
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      const prefix = mergedOptions.isDiameter ? '⌀' : '';
      const roundedValue = roundTo1(value);
      
      dimensions.push({
        start: start,
        end: end,
        label: `${prefix}${roundedValue}${unit}`,
        offset: mergedOptions.offset,
        color: mergedOptions.color,
        position: mergedOptions.position
      });
    };
    
    switch (model.geometry.type) {
      case 'complexNut': {
        // Width dimension
        createDimension(
          new THREE.Vector3(-params.width/2, 0, -params.width/2 - offsetBase),
          new THREE.Vector3(params.width/2, 0, -params.width/2 - offsetBase),
          params.width * 10 * scaleFactor,
          'mm',
          { position: 'front', color: '#0066cc' }
        );
        
        // Height dimension
        createDimension(
          new THREE.Vector3(params.width/2 + offsetBase, 0, 0),
          new THREE.Vector3(params.width/2 + offsetBase, params.height, 0),
          params.height * 10 * scaleFactor,
          'mm',
          { position: 'side', color: '#cc3300' }
        );
        
        // Hole dimension
        if (params.holeRadius) {
          createDimension(
            new THREE.Vector3(-params.holeRadius, params.height/2, 0),
            new THREE.Vector3(params.holeRadius, params.height/2, 0),
            params.holeRadius * 20 * scaleFactor,
            'mm',
            { position: 'top', color: '#009933', isDiameter: true }
          );
        }
        break;
      }
      
      case 'complexScrew': {
        // Total length
        const totalLength = params.shankLength + params.headHeight;
        
        createDimension(
          new THREE.Vector3(params.headRadius + offsetBase, 0, 0),
          new THREE.Vector3(params.headRadius + offsetBase, totalLength, 0),
          totalLength * 10 * scaleFactor,
          'mm',
          { position: 'side', color: '#cc3300' }
        );
        
        // Head diameter
        createDimension(
          new THREE.Vector3(-params.headRadius, totalLength - params.headHeight/2, 0),
          new THREE.Vector3(params.headRadius, totalLength - params.headHeight/2, 0),
          params.headRadius * 20 * scaleFactor,
          'mm',
          { position: 'top', color: '#0066cc', isDiameter: true }
        );
        
        // Shank diameter
        createDimension(
          new THREE.Vector3(-params.shankRadius, params.shankLength/2, 0),
          new THREE.Vector3(params.shankRadius, params.shankLength/2, 0),
          params.shankRadius * 20 * scaleFactor,
          'mm',
          { position: 'front', color: '#009933', isDiameter: true }
        );
        break;
      }

      case 'complexCup': {
        // Diameter
        createDimension(
          new THREE.Vector3(-params.topRadius, params.height, 0),
          new THREE.Vector3(params.topRadius, params.height, 0),
          params.topRadius * 20 * scaleFactor,
          'mm',
          { position: 'top', color: '#0066cc', isDiameter: true }
        );
        
        // Height
        createDimension(
          new THREE.Vector3(params.topRadius + offsetBase, 0, 0),
          new THREE.Vector3(params.topRadius + offsetBase, params.height, 0),
          params.height * 10 * scaleFactor,
          'mm',
          { position: 'side', color: '#cc3300' }
        );
        
        // Wall thickness
        createDimension(
          new THREE.Vector3(params.topRadius - params.thickness, params.height/2, 0),
          new THREE.Vector3(params.topRadius, params.height/2, 0),
          params.thickness * 10 * scaleFactor,
          'mm',
          { position: 'front', color: '#009933' }
        );
        break;
      }

      case 'diceCube': {
        // Width (X dimension)
        createDimension(
          new THREE.Vector3(0, 0, -params.size/2 - offsetBase),
          new THREE.Vector3(params.size, 0, -params.size/2 - offsetBase),
          params.size * 10 * scaleFactor,
          'mm',
          { position: 'front', color: '#0066cc' }
        );
        
        // Height (Y dimension)
        createDimension(
          new THREE.Vector3(params.size + offsetBase, 0, 0),
          new THREE.Vector3(params.size + offsetBase, params.size, 0),
          params.size * 10 * scaleFactor,
          'mm',
          { position: 'side', color: '#cc3300' }
        );
        
        // Depth (Z dimension)
        createDimension(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, params.size),
          params.size * 10 * scaleFactor,
          'mm',
          { position: 'top', color: '#009933' }
        );
        
        // Dot size (if available)
        if (params.dotRadius) {
          createDimension(
            new THREE.Vector3(params.size/2 - params.dotRadius, params.size + 0.1, params.size/2),
            new THREE.Vector3(params.size/2 + params.dotRadius, params.size + 0.1, params.size/2),
            params.dotRadius * 20 * scaleFactor,
            'mm',
            { position: 'top', color: '#996633', isDiameter: true }
          );
        }
        break;
      }
      
      case 'complexPlate': {
        // Diameter
        createDimension(
          new THREE.Vector3(-params.radius, params.bottomThickness/2, 0),
          new THREE.Vector3(params.radius, params.bottomThickness/2, 0),
          params.radius * 20 * scaleFactor,
          'mm',
          { position: 'top', color: '#0066cc', isDiameter: true }
        );
        
        // Height
        createDimension(
          new THREE.Vector3(params.radius + offsetBase, 0, 0),
          new THREE.Vector3(params.radius + offsetBase, params.bottomThickness, 0),
          params.bottomThickness * 10 * scaleFactor,
          'mm',
          { position: 'side', color: '#cc3300' }
        );
        
        // Rim height (if available)
        if (params.rimHeight) {
          createDimension(
            new THREE.Vector3(params.radius - params.rimWidth/2, params.bottomThickness, 0),
            new THREE.Vector3(params.radius - params.rimWidth/2, params.bottomThickness + params.rimHeight, 0),
            params.rimHeight * 10 * scaleFactor,
            'mm',
            { position: 'front', color: '#009933' }
          );
        }
        break;
      }
    }
    
    // Store the calculated dimensions
    setMeasurements(dimensions);
  }, [model.geometry, model.scale]);
  
  // Filter dimensions based on camera position - but only determine this once at startup
  const [viewingQuadrant, setViewingQuadrant] = useState({ x: 1, z: 1, top: false });
  
  // Update viewing quadrant when camera moves significantly
  useFrame(({ camera }) => {
    const threshold = 0.5; // Only update if camera moves significantly
    const newQuadrant = {
      x: Math.sign(camera.position.x),
      z: Math.sign(camera.position.z),
      top: camera.position.y > 5
    };
    
    if (
      Math.abs(newQuadrant.x - viewingQuadrant.x) > threshold ||
      Math.abs(newQuadrant.z - viewingQuadrant.z) > threshold ||
      newQuadrant.top !== viewingQuadrant.top
    ) {
      setViewingQuadrant(newQuadrant);
    }
  });
  
  // Filter dimensions based on viewing angle to prevent overlapping
  const visibleDimensions = useMemo(() => {
    return measurements.filter((dim: Dimension) => {
      // Always show top dimensions when viewing from above
      if (dim.position === 'top' && viewingQuadrant.top) return true;
      
      // Show front dimensions when viewing from front
      if (dim.position === 'front' && viewingQuadrant.z > 0) return true;
      
      // Show side dimensions when viewing from side
      if (dim.position === 'side' && viewingQuadrant.x > 0) return true;
      
      // Default visibility rules
      if (dim.position === 'top') return true; // Always show top
      if (dim.position === 'front' && !viewingQuadrant.top) return true;
      if (dim.position === 'side' && Math.abs(viewingQuadrant.z) < 0.5) return true;
      
      return false;
    });
  }, [measurements, viewingQuadrant]);

  return (
    <group
      position={[model.position.x, model.position.y, model.position.z]}
      rotation={[model.rotation.x, model.rotation.y, model.rotation.z]}
      scale={[model.scale.x, model.scale.y, model.scale.z]}
    >
      {visibleDimensions.map((dim: Dimension, index: number) => (
        <DimensionLine key={index} {...dim} />
      ))}
    </group>
  );
};

// Helper component to listen to camera changes and dispatch events
const CameraListener = () => {
  const { camera } = useThree();
  
  // We use a ref to store the last position to avoid unnecessary renders
  const lastPosition = useRef(new THREE.Vector3());
  
  useFrame(() => {
    // Only dispatch event if camera moved significantly
    if (camera.position.distanceTo(lastPosition.current) > 0.5) {
      lastPosition.current.copy(camera.position);
      window.dispatchEvent(new CustomEvent('camerachange'));
    }
  });
  
  return null;
};

export const ModelViewer: React.FC<ModelViewerProps> = ({ model }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div ref={containerRef} className="card h-144 w-full relative">
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        shadows
        className="w-full h-full"
        frameloop="demand" // Only render when needed
      >
        <SoftShadows />
        <CameraListener />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
        />

        {/* Grid can be toggled on/off */}
        {showGrid && (
          <Grid
            args={[15, 15]}
            position={[0, -0.02, 0]} // Slightly below models
            cellSize={1}
            cellThickness={1}
            cellColor="#6b7280"
            sectionSize={3}
            sectionThickness={1.5}
            sectionColor="#374151"
            fadeDistance={30}
            fadeStrength={1}
            infiniteGrid={true}
          />
        )}

        {/* Ground plane for shadows */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.01, 0]} 
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          <shadowMaterial transparent opacity={0.15} />
        </mesh>

        {model && (
          <>
            <ModelObject model={{
              ...model,
              // Force kubek to the correct height
              position: model.geometry.type === 'complexCup' 
                ? { ...model.position, y: 0.01 }
                : model.position
            }} />
            
            {showDimensions && <ModelDimensions model={model} />}
          </>
        )}

        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.6}
          scale={10}
          blur={3}
          far={10}
        />

        <Environment preset="studio" />
      </Canvas>

      {model && (
        <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{model.name}</p>
          <p className="text-sm text-gray-600">
            Kategoria: {model.category.charAt(0).toUpperCase() + model.category.slice(1)}
          </p>
        </div>
      )}

      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={() => setShowDimensions(!showDimensions)}
          className="bg-white/90 p-2 rounded-lg shadow-lg hover:bg-white"
        >
          {showDimensions ? "Ukryj wymiary" : "Pokaż wymiary"}
        </button>
        
        <button
          onClick={() => setShowGrid(!showGrid)}
          className="bg-white/90 p-2 rounded-lg shadow-lg hover:bg-white"
        >
          {showGrid ? "Ukryj siatkę" : "Pokaż siatkę"}
        </button>
      </div>
    </div>
  );
};