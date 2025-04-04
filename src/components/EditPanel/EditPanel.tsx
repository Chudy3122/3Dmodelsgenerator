// src/components/EditPanel/EditPanel.tsx
import React, { useState } from 'react';
import { Model3D, ExportFormat } from '../../types/models';
import { ColorPicker } from './ColorPicker';
import { NumberInput } from './NumberInput';
import { ExportService } from '../../services/ExportService';

interface EditPanelProps {
  model: Model3D | null;
  onModelUpdate: (updatedModel: Model3D) => void;
}

// Definiujemy typ dla stanu eksportu
interface ExportStatus {
  type: 'success' | 'error';
  message: string;
}

export const EditPanel: React.FC<EditPanelProps> = ({ model, onModelUpdate }) => {
  const [activeTab, setActiveTab] = useState<'transform' | 'material' | 'export'>('transform');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);

  if (!model) {
    return (
      <div className="card h-144">
        <p className="text-gray-500 text-center">
          Wybierz model, aby rozpocząć edycję
        </p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<Model3D>) => {
    onModelUpdate({
      ...model,
      ...updates,
    });
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      // Pokaż wskaźnik ładowania
      setIsExporting(true);
      
      // Eksportuj model bezpośrednio przy użyciu ExportService
      const blob = await ExportService.exportModel(model, format);
      
      // Pobierz plik
      const filename = `${model.name.toLowerCase().replace(/\s+/g, '-')}.${format}`;
      ExportService.downloadModel(blob, filename);
      
      // Komunikat o sukcesie
      console.log(`Model został wyeksportowany do formatu ${format}`);
      
      // Wyświetl komunikat sukcesu
      setExportStatus({ type: 'success', message: `Pomyślnie wyeksportowano model do formatu ${format.toUpperCase()}` });
    } catch (error) {
      console.error('Błąd podczas eksportu:', error);
      setExportStatus({ 
        type: 'error', 
        message: `Błąd podczas eksportu: ${error instanceof Error ? error.message : 'Nieznany błąd'}` 
      });
    } finally {
      // Ukryj wskaźnik ładowania
      setIsExporting(false);
      
      // Ukryj komunikat po kilku sekundach
      setTimeout(() => {
        setExportStatus(null);
      }, 3000);
    }
  };

  return (
    <div className="card h-144 overflow-y-auto">
      {/* Zakładki */}
      <div className="flex space-x-2 mb-6">
        {[
          { id: 'transform', label: 'Transformacje' },
          { id: 'material', label: 'Materiał' },
          { id: 'export', label: 'Eksport' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel transformacji */}
      {activeTab === 'transform' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Pozycja</h3>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput
                label="X"
                value={model.position.x}
                onChange={(value) =>
                  handleUpdate({ position: { ...model.position, x: value } })
                }
              />
              <NumberInput
                label="Y"
                value={model.position.y}
                onChange={(value) =>
                  handleUpdate({ position: { ...model.position, y: value } })
                }
              />
              <NumberInput
                label="Z"
                value={model.position.z}
                onChange={(value) =>
                  handleUpdate({ position: { ...model.position, z: value } })
                }
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Rotacja</h3>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput
                label="X"
                value={model.rotation.x}
                onChange={(value) =>
                  handleUpdate({ rotation: { ...model.rotation, x: value } })
                }
                step={0.1}
              />
              <NumberInput
                label="Y"
                value={model.rotation.y}
                onChange={(value) =>
                  handleUpdate({ rotation: { ...model.rotation, y: value } })
                }
                step={0.1}
              />
              <NumberInput
                label="Z"
                value={model.rotation.z}
                onChange={(value) =>
                  handleUpdate({ rotation: { ...model.rotation, z: value } })
                }
                step={0.1}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Skala</h3>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput
                label="X"
                value={model.scale.x}
                onChange={(value) =>
                  handleUpdate({ scale: { ...model.scale, x: value } })
                }
                min={0.1}
                step={0.1}
              />
              <NumberInput
                label="Y"
                value={model.scale.y}
                onChange={(value) =>
                  handleUpdate({ scale: { ...model.scale, y: value } })
                }
                min={0.1}
                step={0.1}
              />
              <NumberInput
                label="Z"
                value={model.scale.z}
                onChange={(value) =>
                  handleUpdate({ scale: { ...model.scale, z: value } })
                }
                min={0.1}
                step={0.1}
              />
            </div>
          </div>
        </div>
      )}

      {/* Panel materiału */}
      {activeTab === 'material' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Kolor</h3>
            <ColorPicker
              color={model.material.color}
              onChange={(color) =>
                handleUpdate({ material: { ...model.material, color } })
              }
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Właściwości materiału</h3>
            <div className="space-y-4">
              <NumberInput
                label="Metaliczność"
                value={model.material.metalness || 0}
                onChange={(value) =>
                  handleUpdate({
                    material: { ...model.material, metalness: value },
                  })
                }
                min={0}
                max={1}
                step={0.1}
              />
              <NumberInput
                label="Chropowatość"
                value={model.material.roughness || 0.5}
                onChange={(value) =>
                  handleUpdate({
                    material: { ...model.material, roughness: value },
                  })
                }
                min={0}
                max={1}
                step={0.1}
              />
            </div>
          </div>
        </div>
      )}

      {/* Panel eksportu */}
      {activeTab === 'export' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-4">Eksportuj model</h3>
          
          {/* Status eksportu */}
          {exportStatus && (
            <div 
            className={`p-3 rounded mb-4 ${
              exportStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {exportStatus.message}
          </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            <button
              className={`btn btn-primary w-full ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleExport('stl')}
              disabled={isExporting}
            >
              {isExporting ? 'Eksportowanie...' : 'Eksportuj jako STL'}
            </button>
            <button
              className={`btn btn-primary w-full ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleExport('obj')}
              disabled={isExporting}
            >
              {isExporting ? 'Eksportowanie...' : 'Eksportuj jako OBJ'}
            </button>
            <button
              className={`btn btn-primary w-full ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleExport('fbx')}
              disabled={isExporting}
            >
              {isExporting ? 'Eksportowanie...' : 'Eksportuj jako FBX'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};