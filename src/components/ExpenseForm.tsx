import React, { useState, useEffect, KeyboardEvent } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Expense, Income, Category } from '../types';

interface ExpenseFormProps {
  onSubmit: (expense: Expense) => void;
  onClose: () => void;
  categories: Category[];
  incomes: Income[];
  initialData?: Expense | null;
}

function ExpenseForm({ onSubmit, onClose, categories, incomes, initialData }: ExpenseFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || categories[0]?.id || '');
  const [dueDate, setDueDate] = useState(() => {
    if (initialData?.dueDate) {
      return initialData.dueDate;
    }
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [splits, setSplits] = useState(
    initialData?.splits || [{ incomeId: '', amount: 0 }]
  );

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setDueDate(initialData.dueDate);
      setSplits(initialData.splits);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      id: initialData?.id || crypto.randomUUID(),
      name,
      category,
      dueDate,
      splits: splits.map(split => ({
        incomeId: split.incomeId,
        amount: parseFloat(split.amount.toString()) || 0
      }))
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

  const addSplit = () => {
    setSplits([...splits, { incomeId: '', amount: 0 }]);
  };

  const removeSplit = (index: number) => {
    setSplits(splits.filter((_, i) => i !== index));
  };

  const updateSplit = (index: number, field: keyof typeof splits[0], value: string) => {
    const newSplits = [...splits];
    if (field === 'amount') {
      newSplits[index] = {
        ...newSplits[index],
        amount: parseFloat(value) || 0
      };
    } else {
      newSplits[index] = {
        ...newSplits[index],
        [field]: value
      };
    }
    setSplits(newSplits);
  };

  const totalAmount = splits.reduce((sum, split) => sum + (Number(split.amount) || 0), 0);

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-semibold mb-4">
          {initialData ? 'Edit Expense' : 'Add New Expense'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                placeholder="Rent, Utilities, etc."
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Split Between Paychecks</h3>
              <button
                type="button"
                onClick={addSplit}
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus size={20} />
                Add Split
              </button>
            </div>
            
            {splits.map((split, index) => {
              const usedPaycheckIds = splits
                .filter((_, i) => i !== index)
                .map(s => s.incomeId);
              
              const availablePaychecks = incomes.filter(
                income => !usedPaycheckIds.includes(income.id)
              );

              return (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paycheck
                    </label>
                    <select
                      value={split.incomeId}
                      onChange={(e) => updateSplit(index, 'incomeId', e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select a paycheck</option>
                      {availablePaychecks.map((income) => (
                        <option key={income.id} value={income.id}>
                          {income.source} - {formatDate(income.date)} - ${income.received}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={split.amount || ''}
                      onChange={(e) => updateSplit(index, 'amount', e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter amount"
                    />
                  </div>
                  {splits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSplit(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Minus size={20} />
                    </button>
                  )}
                </div>
              );
            })}
            
            <div className="flex justify-end text-lg font-medium">
              Total: ${totalAmount.toFixed(2)}
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            {initialData ? 'Update Expense' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;