// src/components/EditPanel/ColorPicker.tsx
import React from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const predefinedColors = [
    '#ff0000', // Czerwony
    '#00ff00', // Zielony
    '#0000ff', // Niebieski
    '#ffff00', // Żółty
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#808080', // Szary
    '#ffffff', // Biały
    '#000000', // Czarny
  ];

  return (
    <div className="space-y-4">
      {/* Główny selektor koloru */}
      <div className="flex items-center space-x-4">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded cursor-pointer"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="input-field w-32"
          placeholder="#000000"
        />
      </div>

      {/* Predefiniowane kolory */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Predefiniowane kolory:</p>
        <div className="grid grid-cols-5 gap-2">
          {predefinedColors.map((presetColor) => (
            <button
              key={presetColor}
              onClick={() => onChange(presetColor)}
              className={`w-8 h-8 rounded-full border-2 ${
                color === presetColor ? 'border-primary-500' : 'border-gray-200'
              }`}
              style={{ backgroundColor: presetColor }}
              title={presetColor}
            />
          ))}
        </div>
      </div>

      {/* Przycisk resetowania */}
      <button
        onClick={() => onChange('#808080')}
        className="btn btn-secondary text-sm w-full"
      >
        Resetuj kolor
      </button>
    </div>
  );
};