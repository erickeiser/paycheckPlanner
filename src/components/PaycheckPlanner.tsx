import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Income, Expense, Category } from '../types';
import IncomeForm from './IncomeForm';
import ExpenseForm from './ExpenseForm';
import PaycheckCard from './PaycheckCard';
import CategoryPieChart from './CategoryPieChart';
import BudgetSummary from './BudgetSummary';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface PaycheckPlannerProps {
  incomes: Income[];
  expenses: Expense[];
  categories: Category[];
  showIncomeForm: boolean;
  showExpenseForm: boolean;
  editingIncome: Income | null;
  editingExpense: Expense | null;
  onAddIncome: (income: Income) => Promise<void>;
  onAddExpense: (expense: Expense) => Promise<void>;
  onDeleteIncome: (id: string) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  onEditIncome: (income: Income) => Promise<void>;
  onEditExpense: (expense: Expense) => Promise<void>;
  onCloseIncomeForm: () => void;
  onCloseExpenseForm: () => void;
  onShowIncomeForm: () => void;
  onShowExpenseForm: () => void;
}

const PaycheckPlanner: React.FC<PaycheckPlannerProps> = ({
  incomes,
  expenses,
  categories,
  showIncomeForm,
  showExpenseForm,
  editingIncome,
  editingExpense,
  onAddIncome,
  onAddExpense,
  onDeleteIncome,
  onDeleteExpense,
  onEditIncome,
  onEditExpense,
  onCloseIncomeForm,
  onCloseExpenseForm,
  onShowIncomeForm,
  onShowExpenseForm,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getPaycheckExpenses = (income: Income) => {
    return expenses.filter(expense => 
      expense.splits.some(split => split.incomeId === income.id)
    );
  };

  const handleDeleteAllExpenses = async (incomeId: string) => {
    try {
      const expensesToDelete = expenses.filter(expense =>
        expense.splits.some(split => split.incomeId === incomeId)
      );
      
      for (const expense of expensesToDelete) {
        await onDeleteExpense(expense.id);
      }
    } catch (error) {
      console.error('Error deleting expenses:', error);
      throw error;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await onDeleteExpense(id);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = incomes.findIndex((income) => income.id === active.id);
      const newIndex = incomes.findIndex((income) => income.id === over.id);
      arrayMove(incomes, oldIndex, newIndex);
    }
  };

  return (
    <div className="space-y-8">
      <BudgetSummary incomes={incomes} expenses={expenses} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button
          onClick={onShowIncomeForm}
          className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-2 text-indigo-600"
        >
          <PlusCircle size={20} />
          Add New Paycheck
        </button>
        <button
          onClick={onShowExpenseForm}
          className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-2 text-indigo-600"
          disabled={incomes.length === 0}
        >
          <PlusCircle size={20} />
          Add New Expense
        </button>
      </div>

      {showIncomeForm && (
        <IncomeForm 
          onSubmit={onAddIncome} 
          onClose={onCloseIncomeForm}
          initialData={editingIncome}
        />
      )}

      {showExpenseForm && (
        <ExpenseForm
          onSubmit={onAddExpense}
          onClose={onCloseExpenseForm}
          incomes={incomes}
          categories={categories}
          initialData={editingExpense}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Paychecks</h2>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={incomes.map(income => income.id)}
              strategy={verticalListSortingStrategy}
            >
              {incomes.map((income) => (
                <PaycheckCard
                  key={income.id}
                  income={income}
                  expenses={getPaycheckExpenses(income)}
                  categories={categories}
                  onEditIncome={onEditIncome}
                  onDeleteIncome={onDeleteIncome}
                  onEditExpense={onEditExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onDeleteAllExpenses={handleDeleteAllExpenses}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Expense Distribution</h2>
          <CategoryPieChart expenses={expenses} categories={categories} />
        </div>
      </div>
    </div>
  );
};

export default PaycheckPlanner;