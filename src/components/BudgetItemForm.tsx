import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category, BudgetItem } from '../types';

interface BudgetItemFormProps {
  onSubmit: (item: Omit<BudgetItem, 'id'> & { id?: string }) => void;
  onClose: () => void;
  categories: Category[];
  initialData?: BudgetItem | null;
}

function BudgetItemForm({ onSubmit, onClose, categories, initialData }: BudgetItemFormProps) {
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || '');
  const [name, setName] = useState(initialData?.name || '');
  const [expected, setExpected] = useState(initialData?.expected?.toString() || '');
  const [received, setReceived] = useState(initialData?.received?.toString() || '');

  useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.categoryId);
      setName(initialData.name);
      setExpected(initialData.expected?.toString() || '');
      setReceived(initialData.received?.toString() || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      categoryId,
      name,
      expected: parseFloat(expected || '0'),
      received: parseFloat(received || '0'),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-semibold mb-4">
          {initialData ? 'Edit Budget Item' : 'Add Budget Item'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter item name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Amount
            </label>
            <input
              type="number"
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              min="0"
              step="0.01"
              placeholder="Enter expected amount"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Received Amount
            </label>
            <input
              type="number"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              min="0"
              step="0.01"
              placeholder="Enter received amount (if available)"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            {initialData ? 'Update Budget Item' : 'Add Budget Item'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BudgetItemForm;