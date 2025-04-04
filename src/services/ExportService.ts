// src/services/ExportService.ts
import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';
import { Model3D, ExportFormat, GeometryParameters } from '../types/models';

export class ExportService {
  // Funkcje do tworzenia złożonych geometrii - podobne do tych z ModelObject
  private static createDiceMesh(params: any, material: THREE.Material, blackMaterial: THREE.Material): THREE.Group {
    const group = new THREE.Group();

    // Główny sześcian
    const boxGeometry = new THREE.BoxGeometry(params.size, params.size, params.size);
    const box = new THREE.Mesh(boxGeometry, material);
    box.position.y = params.size / 2; // Dla poprawnej pozycji
    group.add(box);

    // Funkcja pomocnicza do tworzenia kropek
    const createDot = (x: number, y: number, z: number) => {
      const dotGeometry = new THREE.SphereGeometry(params.dotRadius || 0.08, 16, 16);
      const dot = new THREE.Mesh(dotGeometry, blackMaterial);
      dot.position.set(x, y + params.size / 2, z); // Dostosowanie pozycji
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
  }

  private static createScrewMesh(params: any, material: THREE.Material): THREE.Group {
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
    
    const head = new THREE.Mesh(headGeometry, material);
    head.position.y = params.shankLength / 2 + params.headHeight / 2;
    group.add(head);

    // Trzon śruby
    const shankGeometry = new THREE.CylinderGeometry(
      params.shankRadius,
      params.shankRadius,
      params.shankLength,
      32
    );
    const shank = new THREE.Mesh(shankGeometry, material);
    group.add(shank);

    // Gwint śruby - reprezentacja uproszczona dla eksportu
    const threadGeometry = new THREE.CylinderGeometry(
      params.shankRadius + params.threadDepth || 0.03,
      params.shankRadius + params.threadDepth || 0.03,
      params.shankLength,
      32,
      Math.floor(params.shankLength / (params.threadPitch || 0.05)) // Liczba segmentów bazująca na skoku gwintu
    );
    const thread = new THREE.Mesh(threadGeometry, material);
    group.add(thread);

    return group;
  }

  private static createNutMesh(params: any, material: THREE.Material): THREE.Group {
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
    
    const nut = new THREE.Mesh(geometry, material);
    group.add(nut);

    return group;
  }

  private static createCupMesh(params: any, material: THREE.Material): THREE.Group {
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
    const cup = new THREE.Mesh(cupGeometry, material);
    group.add(cup);

    return group;
  }

  private static createPlateMesh(params: any, material: THREE.Material): THREE.Group {
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
    const plate = new THREE.Mesh(plateGeometry, material);
    group.add(plate);

    return group;
  }

  private static createModelMesh(model: Model3D): THREE.Object3D {
    const params = model.geometry.parameters as any;

    // Tworzymy materiały
    const material = new THREE.MeshStandardMaterial({
      color: model.material.color,
      metalness: model.material.metalness || 0,
      roughness: model.material.roughness || 0.5,
    });

    const blackMaterial = new THREE.MeshStandardMaterial({
      color: '#000000',
      metalness: 0,
      roughness: 0.9,
    });

    let object: THREE.Object3D;

    // Wybieramy geometrię w zależności od typu modelu
    switch (model.geometry.type) {
      case 'diceCube':
        object = this.createDiceMesh(params, material, blackMaterial);
        break;
      
      case 'complexScrew':
        object = this.createScrewMesh(params, material);
        break;
      
      case 'complexNut':
        object = this.createNutMesh(params, material);
        break;
      
      case 'complexCup':
        object = this.createCupMesh(params, material);
        break;
      
      case 'complexPlate':
        object = this.createPlateMesh(params, material);
        break;
      
      case 'box':
        const boxGeometry = new THREE.BoxGeometry(
          params.width || 1,
          params.height || 1,
          params.depth || 1
        );
        object = new THREE.Mesh(boxGeometry, material);
        break;
      
      case 'sphere':
        const sphereGeometry = new THREE.SphereGeometry(
          params.radius || 0.5,
          32,
          32
        );
        object = new THREE.Mesh(sphereGeometry, material);
        break;
      
      case 'cylinder':
        const cylinderGeometry = new THREE.CylinderGeometry(
          params.radiusTop || 0.5,
          params.radiusBottom || 0.5,
          params.height || 1,
          params.segments || 32
        );
        object = new THREE.Mesh(cylinderGeometry, material);
        break;
      
      default:
        // Domyślny obiekt
        object = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    }

    // Ustawiamy transformacje
    object.position.set(model.position.x, model.position.y, model.position.z);
    object.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z);
    object.scale.set(model.scale.x, model.scale.y, model.scale.z);

    return object;
  }

  static async exportModel(model: Model3D, format: ExportFormat): Promise<Blob> {
    const object = this.createModelMesh(model);
    
    // Tworzymy scenę i dodajemy do niej obiekt
    const scene = new THREE.Scene();
    scene.add(object);

    let result: string | ArrayBuffer;
    let mimeType: string;

    switch (format) {
      case 'stl':
        const stlExporter = new STLExporter();
        // Używamy eksportera z opcją binary, ale dopasowaną do typu zwracanego
        result = stlExporter.parse(scene, { binary: true }) as unknown as ArrayBuffer;
        mimeType = 'application/vnd.ms-pki.stl';
        break;

      case 'obj':
        const objExporter = new OBJExporter();
        result = objExporter.parse(scene);
        mimeType = 'application/x-wavefront-obj';
        break;

      case 'fbx':
        throw new Error('Format FBX nie jest obecnie obsługiwany');

      default:
        throw new Error(`Nieobsługiwany format: ${format}`);
    }

    return new Blob([result], { type: mimeType });
  }

  static downloadModel(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}