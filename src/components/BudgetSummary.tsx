import React from 'react';
import { Income, Expense } from '../types';

interface BudgetSummaryProps {
  incomes: Income[];
  expenses: Expense[];
}

function BudgetSummary({ incomes, expenses }: BudgetSummaryProps) {
  const totalExpected = incomes.reduce((sum, income) => 
    sum + (Number(income.expected) || 0), 0
  );

  const totalReceived = incomes.reduce((sum, income) => 
    sum + (Number(income.received) || 0), 0
  );

  const totalDebits = expenses.reduce((sum, expense) => 
    sum + expense.splits.reduce((total, split) => 
      total + (Number(split.amount) || 0), 0
    ), 0
  );

  const remainingBudget = totalReceived - totalDebits;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-green-800 mb-1">Total Expected</h3>
        <p className="text-2xl font-bold text-green-700">${totalExpected.toFixed(2)}</p>
        <div className="mt-2 text-sm text-green-600">
          Monthly Expected Income
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-blue-800 mb-1">Total Received</h3>
        <p className="text-2xl font-bold text-blue-700">${totalReceived.toFixed(2)}</p>
        <div className="mt-2 text-sm text-blue-600">
          Actual Income Received
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-red-800 mb-1">Total Debits</h3>
        <p className="text-2xl font-bold text-red-700">${totalDebits.toFixed(2)}</p>
        <div className="mt-2 text-sm text-red-600">
          Total Expenses & Bills
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-purple-800 mb-1">Remaining Budget</h3>
        <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
          ${remainingBudget.toFixed(2)}
        </p>
        <div className="mt-2 text-sm text-purple-600">
          Available to Budget
        </div>
      </div>
    </div>
  );
}

export default BudgetSummary;