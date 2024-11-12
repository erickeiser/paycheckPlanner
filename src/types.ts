export interface Income {
  id: string;
  date: string;
  expected: number;
  received: number;
  source: string;
}

export interface ExpenseSplit {
  incomeId: string;
  amount: number;
}

export interface Expense {
  id: string;
  name: string;
  category: string;
  dueDate: string;
  splits: ExpenseSplit[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface BudgetItem {
  id: string;
  categoryId: string;
  name: string;
  expected: number;
  received: number;
}