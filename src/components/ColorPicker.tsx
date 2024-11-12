import React, { useState } from 'react';
import { Check, Palette } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const predefinedColors = [
  '#FF6B6B', '#FF8787', '#FA5252', '#F03E3E', '#E03131', // Reds
  '#FF922B', '#FFA94D', '#FFC078', '#FFD8A8', '#FFE3BF', // Oranges
  '#FAB005', '#FFD43B', '#FCC419', '#FFE066', '#FFF3BF', // Yellows
  '#40C057', '#51CF66', '#69DB7C', '#8CE99A', '#B2F2BB', // Greens
  '#20C997', '#38D9A9', '#63E6BE', '#96F2D7', '#C3FAE8', // Teals
  '#339AF0', '#4DABF7', '#74C0FC', '#A5D8FF', '#D0EBFF', // Blues
];

function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 border rounded-md w-full hover:bg-gray-50"
      >
        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
        <Palette size={18} className="text-gray-500" />
        <span className="text-gray-700">{color}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 w-[280px]">
          <div className="grid grid-cols-6 gap-2">
            {predefinedColors.map((c) => (
              <button
                key={c}
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                onClick={() => {
                  onChange(c);
                  setIsOpen(false);
                }}
              >
                {color === c && <Check size={16} className="text-white" />}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <label className="text-sm text-gray-600">Custom:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => {
                onChange(e.target.value);
                setIsOpen(false);
              }}
              className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorPicker;