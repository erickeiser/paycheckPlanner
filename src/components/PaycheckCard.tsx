import React from 'react';
import { Pencil, Trash2, Building2, Calendar, GripVertical } from 'lucide-react';
import { Income, Expense, Category } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PaycheckCardProps {
  income: Income;
  expenses: Expense[];
  categories: Category[];
  onEditIncome: (income: Income) => void;
  onDeleteIncome: (id: string) => Promise<void>;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => Promise<void>;
}

function PaycheckCard({ 
  income, 
  expenses, 
  categories,
  onEditIncome,
  onDeleteIncome,
  onEditExpense,
  onDeleteExpense
}: PaycheckCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: income.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const totalExpenses = expenses.reduce((sum, expense) => {
    const split = expense.splits.find(s => s.incomeId === income.id);
    return sum + (Number(split?.amount) || 0);
  }, 0);
  
  const remaining = Number(income.received) - totalExpenses;

  const getCategoryColor = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.color || '#gray';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Uncategorized';
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };

  const handleDeleteIncome = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Delete all associated expenses first
      await Promise.all(expenses.map(expense => onDeleteExpense(expense.id)));
      // Then delete the income
      await onDeleteIncome(income.id);
    } catch (err) {
      console.error('Error deleting income and expenses:', err);
    }
  };

  const handleDeleteExpense = async (expenseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await onDeleteExpense(expenseId);
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-md p-6 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-1">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <GripVertical size={16} className="text-gray-400" />
            </button>
            <h3 className="text-xl font-semibold text-gray-800">
              {formatDate(income.date)}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => onEditIncome(income)}
                className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={handleDeleteIncome}
                className="text-red-600 hover:text-red-800 transition-colors p-1 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Building2 size={16} />
            <span>{income.source}</span>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-2">
            <div>
              <p className="text-sm text-gray-500">Expected</p>
              <p className="font-medium text-green-600">${Number(income.expected).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Received</p>
              <p className="font-medium text-blue-600">${Number(income.received).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="font-medium text-red-600">${totalExpenses.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Remaining</p>
              <p className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${remaining.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {expenses.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Expenses</h4>
          {expenses.map((expense) => {
            const split = expense.splits.find(s => s.incomeId === income.id);
            if (!split) return null;

            return (
              <div
                key={expense.id}
                className="flex items-center justify-between p-2 rounded-md bg-gray-50 group"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCategoryColor(expense.category) }}
                  />
                  <span className="text-gray-800">{expense.name}</span>
                  <span className="text-sm text-gray-500">
                    ({getCategoryName(expense.category)})
                  </span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar size={14} />
                    <span className="text-sm">
                      Due: {formatDate(expense.dueDate)}
                    </span>
                  </div>
                  {expense.splits.length > 1 && (
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      Split
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-700">
                    ${Number(split.amount).toFixed(2)}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteExpense(expense.id, e)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No expenses added yet</p>
      )}
    </div>
  );
}

export default PaycheckCard;