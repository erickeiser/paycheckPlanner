import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Income, Expense, Category } from '../types';
import IncomeForm from './IncomeForm';
import ColorPicker from './ColorPicker';
import CategoryCard from './CategoryCard';
import BudgetItemForm from './BudgetItemForm';
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface BudgetPlannerProps {
  categories: Category[];
  expenses: Expense[];
  incomes: Income[];
  onAddIncome: (income: Income) => void;
  onEditIncome: (income: Income) => void;
  onDeleteIncome: (id: string) => void;
  onAddCategory: (category: Category) => void;
}

interface BudgetItem {
  id: string;
  categoryId: string;
  name: string;
  expected: number;
  received: number;
}

function BudgetPlanner({ 
  categories, 
  expenses, 
  incomes,
  onAddIncome,
  onEditIncome,
  onDeleteIncome,
  onAddCategory
}: BudgetPlannerProps) {
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showBudgetItemForm, setShowBudgetItemForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItem | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#FF6B6B');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const budgetItemsQuery = query(
      collection(db, 'budgetItems'),
      orderBy('name')
    );

    const unsubscribe = onSnapshot(budgetItemsQuery, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          expected: Number(doc.data().expected) || 0,
          received: Number(doc.data().received) || 0
        })) as BudgetItem[];
        setBudgetItems(items);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading budget items:', err);
        setError('Error loading budget items');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddIncome = async (income: Income) => {
    try {
      setError(null);
      if (editingIncome) {
        await onEditIncome(income);
      } else {
        await onAddIncome(income);
      }
      setShowIncomeForm(false);
      setEditingIncome(null);
    } catch (err) {
      console.error('Error managing income:', err);
      setError('Error saving income');
    }
  };

  const handleAddBudgetItem = async (item: Omit<BudgetItem, 'id'> & { id?: string }) => {
    try {
      setError(null);
      const data = {
        categoryId: item.categoryId,
        name: item.name,
        expected: Number(item.expected) || 0,
        received: Number(item.received) || 0
      };

      if (editingBudgetItem) {
        await updateDoc(doc(db, 'budgetItems', editingBudgetItem.id), data);
      } else {
        await addDoc(collection(db, 'budgetItems'), data);
      }
      setShowBudgetItemForm(false);
      setEditingBudgetItem(null);
    } catch (err) {
      console.error('Error managing budget item:', err);
      setError('Error saving budget item');
    }
  };

  const handleDeleteBudgetItem = async (id: string) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'budgetItems', id));
    } catch (err) {
      console.error('Error deleting budget item:', err);
      setError('Error deleting budget item');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const newCategory: Category = {
        id: crypto.randomUUID(),
        name: newCategoryName,
        color: newCategoryColor
      };

      await addDoc(collection(db, 'categories'), newCategory);
      onAddCategory(newCategory);
      setNewCategoryName('');
      setNewCategoryColor('#FF6B6B');
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Error adding category');
    }
  };

  // Calculate totals with proper type conversion
  const getTotalExpected = () => {
    return budgetItems.reduce((sum, item) => sum + (Number(item.expected) || 0), 0);
  };

  const getTotalReceived = () => {
    return budgetItems.reduce((sum, item) => sum + (Number(item.received) || 0), 0);
  };

  const getRemaining = () => {
    return getTotalExpected() - getTotalReceived();
  };

  const getTotalDebits = () => {
    return expenses.reduce((sum, expense) => {
      const expenseTotal = expense.splits.reduce((total, split) => total + (Number(split.amount) || 0), 0);
      return sum + expenseTotal;
    }, 0);
  };

  const getTotalIncome = () => {
    return incomes.reduce((sum, income) => sum + (Number(income.received) || 0), 0);
  };

  const getRemainingBudget = () => {
    return getTotalIncome() - getTotalDebits();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Expected Total</p>
            <p className="text-2xl font-bold text-green-700">${getTotalExpected().toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Received Total</p>
            <p className="text-2xl font-bold text-blue-700">${getTotalReceived().toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Remaining Expected</p>
            <p className="text-2xl font-bold text-gray-700">${getRemaining().toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Total Income</p>
            <p className="text-2xl font-bold text-purple-700">${getTotalIncome().toFixed(2)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600">Total Debits</p>
            <p className="text-2xl font-bold text-red-700">${getTotalDebits().toFixed(2)}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg">
            <p className="text-sm text-emerald-600">Remaining Budget</p>
            <p className="text-2xl font-bold text-emerald-700">${getRemainingBudget().toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => {
              setEditingIncome(null);
              setShowIncomeForm(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add New Income
          </button>
          <button
            onClick={() => {
              setEditingBudgetItem(null);
              setShowBudgetItemForm(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Budget Item
          </button>
        </div>

        {/* Income List */}
        {incomes.length > 0 && (
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium text-gray-800">Income Sources</h3>
            <div className="space-y-3">
              {incomes.map((income) => (
                <div
                  key={income.id}
                  className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">{income.source}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(income.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Expected</p>
                      <p className="font-medium text-green-600">
                        ${Number(income.expected).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Received</p>
                      <p className="font-medium text-blue-600">
                        ${Number(income.received).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingIncome(income);
                          setShowIncomeForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteIncome(income.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Items List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Budget Items</h3>
          {budgetItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No budget items added yet</p>
          ) : (
            budgetItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-lg shadow border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-500">
                      {categories.find(cat => cat.id === item.categoryId)?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Expected</p>
                      <p className="font-medium text-green-600">
                        ${Number(item.expected).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Received</p>
                      <p className="font-medium text-blue-600">
                        ${Number(item.received).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Remaining</p>
                      <p className="font-medium text-gray-600">
                        ${(Number(item.expected) - Number(item.received)).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingBudgetItem(item);
                          setShowBudgetItemForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBudgetItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Category</h3>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <ColorPicker
                color={newCategoryColor}
                onChange={setNewCategoryColor}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Category
            </button>
          </form>
        </div>

        <CategoryCard categories={categories} />
      </div>

      {showIncomeForm && (
        <IncomeForm
          onSubmit={handleAddIncome}
          onClose={() => {
            setShowIncomeForm(false);
            setEditingIncome(null);
          }}
          initialData={editingIncome}
        />
      )}

      {showBudgetItemForm && (
        <BudgetItemForm
          onSubmit={handleAddBudgetItem}
          onClose={() => {
            setShowBudgetItemForm(false);
            setEditingBudgetItem(null);
          }}
          categories={categories}
          initialData={editingBudgetItem}
        />
      )}
    </div>
  );
}

export default BudgetPlanner;