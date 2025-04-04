// src/components/EditPanel/NumberInput.tsx
import React from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      // Ograniczenie wartości do zakresu min-max
      const clampedValue = Math.min(Math.max(newValue, min), max);
      onChange(clampedValue);
    }
  };

  const increment = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex">
        <button
          type="button"
          onClick={decrement}
          className="px-2 bg-gray-100 hover:bg-gray-200 border border-r-0 border-gray-300 rounded-l"
          disabled={value <= min}
        >
          -
        </button>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          step={step}
          min={min}
          max={max}
          className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center"
        />
        <button
          type="button"
          onClick={increment}
          className="px-2 bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-300 rounded-r"
          disabled={value >= max}
        >
          +
        </button>
      </div>
      {/* Wyświetlanie wartości jako suwak dla wartości z określonym zakresem */}
      {isFinite(min) && isFinite(max) && (
        <input
          type="range"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className="w-full mt-2"
        />
      )}
    </div>
  );
};