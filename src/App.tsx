import React, { useState } from 'react';
import { Wallet, CreditCard, PieChart } from 'lucide-react';
import { Income, Expense, Category } from './types';
import TabNavigation from './components/TabNavigation';
import PaycheckPlanner from './components/PaycheckPlanner';
import BudgetPlanner from './components/BudgetPlanner';
import { useFirestore } from './hooks/useFirestore';

const defaultCategories: Category[] = [
  { id: '1', name: 'Housing', color: '#FF6B6B' },
  { id: '2', name: 'Transportation', color: '#4ECDC4' },
  { id: '3', name: 'Utilities', color: '#45B7D1' },
  { id: '4', name: 'Food', color: '#96CEB4' },
  { id: '5', name: 'Entertainment', color: '#FFEEAD' },
  { id: '6', name: 'Other', color: '#D4A5A5' },
];

function App() {
  const [activeTab, setActiveTab] = useState<'paycheck' | 'budget'>('paycheck');
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [categories] = useState<Category[]>(defaultCategories);

  const {
    incomes,
    expenses,
    loading,
    error,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense
  } = useFirestore();

  const handleAddIncome = async (income: Income) => {
    try {
      if (editingIncome) {
        await updateIncome(editingIncome.id, income);
      } else {
        await addIncome(income);
      }
      setShowIncomeForm(false);
      setEditingIncome(null);
    } catch (err) {
      console.error('Error managing income:', err);
    }
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setShowIncomeForm(true);
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      await deleteIncome(id);
    } catch (err) {
      console.error('Error deleting income:', err);
    }
  };

  const handleAddExpense = async (expense: Expense) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, expense);
      } else {
        await addExpense(expense);
      }
      setShowExpenseForm(false);
      setEditingExpense(null);
    } catch (err) {
      console.error('Error managing expense:', err);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalIncome = incomes.reduce((sum, income) => sum + (Number(income.received) || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => 
    sum + expense.splits.reduce((total, split) => total + (Number(split.amount) || 0), 0), 0
  );
  const balance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">Financial Planner</h1>
          <div className="flex justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <Wallet className="text-green-500" />
              <span>Income: ${totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="text-red-500" />
              <span>Expenses: ${totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <PieChart className="text-blue-500" />
              <span>Balance: ${balance.toFixed(2)}</span>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'paycheck' ? (
          <PaycheckPlanner
            incomes={incomes}
            expenses={expenses}
            categories={categories}
            showIncomeForm={showIncomeForm}
            showExpenseForm={showExpenseForm}
            editingIncome={editingIncome}
            editingExpense={editingExpense}
            onAddIncome={handleAddIncome}
            onAddExpense={handleAddExpense}
            onDeleteIncome={handleDeleteIncome}
            onDeleteExpense={handleDeleteExpense}
            onEditIncome={handleEditIncome}
            onEditExpense={handleEditExpense}
            onCloseIncomeForm={() => {
              setShowIncomeForm(false);
              setEditingIncome(null);
            }}
            onCloseExpenseForm={() => {
              setShowExpenseForm(false);
              setEditingExpense(null);
            }}
            onShowIncomeForm={() => {
              setEditingIncome(null);
              setShowIncomeForm(true);
            }}
            onShowExpenseForm={() => {
              setEditingExpense(null);
              setShowExpenseForm(true);
            }}
          />
        ) : (
          <BudgetPlanner 
            categories={categories}
            expenses={expenses}
            incomes={incomes}
            onAddIncome={handleAddIncome}
            onEditIncome={handleEditIncome}
            onDeleteIncome={handleDeleteIncome}
            onAddCategory={(category) => {
              // This would be implemented if category management is needed
              console.log('Add category:', category);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;