import React, { useState, useEffect, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Income } from '../types';

interface IncomeFormProps {
  onSubmit: (income: Income) => void;
  onClose: () => void;
  initialData?: Income | null;
}

function IncomeForm({ onSubmit, onClose, initialData }: IncomeFormProps) {
  const [date, setDate] = useState(() => {
    if (initialData?.date) {
      return initialData.date;
    }
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [source, setSource] = useState(initialData?.source || '');
  const [expected, setExpected] = useState(initialData?.expected?.toString() || '');
  const [received, setReceived] = useState(initialData?.received?.toString() || '');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setSource(initialData.source);
      setExpected(initialData.expected?.toString() || '');
      setReceived(initialData.received?.toString() || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      id: initialData?.id || crypto.randomUUID(),
      date,
      source,
      expected: parseFloat(expected) || 0,
      received: parseFloat(received) || 0
    });
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-semibold mb-4">
          {initialData ? 'Edit Income' : 'Add New Income'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <input
              type="text"
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="Company Name, Side Gig, etc."
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Amount
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter expected amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Received Amount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter received amount (if available)"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            {initialData ? 'Update Income' : 'Add Income'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default IncomeForm;