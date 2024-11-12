import React from 'react';
import { Category } from '../types';
import { Palette } from 'lucide-react';

interface CategoryCardProps {
  categories: Category[];
}

function CategoryCard({ categories }: CategoryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="text-indigo-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-800">Expense Categories</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative rounded-lg p-4 transition-all duration-300 hover:shadow-md"
              style={{ backgroundColor: `${category.color}10` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full transition-transform group-hover:scale-110"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-gray-700">{category.name}</span>
              </div>
              <div
                className="absolute bottom-0 left-0 h-1 w-full rounded-b-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                style={{ backgroundColor: category.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryCard;