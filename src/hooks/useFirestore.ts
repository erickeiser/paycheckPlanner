import { useState, useEffect } from 'react';
import { 
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
  getDoc,
  getDocs,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Income, Expense } from '../types';

export const useFirestore = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const incomesQuery = query(
      collection(db, 'incomes'),
      orderBy('date', 'desc')
    );

    const expensesQuery = query(
      collection(db, 'expenses'),
      orderBy('dueDate', 'desc')
    );

    const unsubscribeIncomes = onSnapshot(
      incomesQuery,
      (snapshot) => {
        const newIncomes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          expected: Number(doc.data().expected) || 0,
          received: Number(doc.data().received) || 0,
          date: doc.data().date
        })) as Income[];
        setIncomes(newIncomes);
      },
      (error) => {
        console.error('Income snapshot error:', error);
        setError('Failed to load incomes');
      }
    );

    const unsubscribeExpenses = onSnapshot(
      expensesQuery,
      (snapshot) => {
        const newExpenses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          splits: doc.data().splits.map((split: any) => ({
            ...split,
            amount: Number(split.amount) || 0
          })),
          dueDate: doc.data().dueDate
        })) as Expense[];
        setExpenses(newExpenses);
        setLoading(false);
      },
      (error) => {
        console.error('Expense snapshot error:', error);
        setError('Failed to load expenses');
        setLoading(false);
      }
    );

    return () => {
      unsubscribeIncomes();
      unsubscribeExpenses();
    };
  }, []);

  const addIncome = async (income: Omit<Income, 'id'>) => {
    try {
      setError(null);
      const docRef = await addDoc(collection(db, 'incomes'), {
        ...income,
        expected: Number(income.expected) || 0,
        received: Number(income.received) || 0,
        timestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Add income error:', error);
      setError('Failed to add income');
      throw error;
    }
  };

  const updateIncome = async (id: string, income: Partial<Income>) => {
    try {
      setError(null);
      const docRef = doc(db, 'incomes', id);
      await updateDoc(docRef, {
        ...income,
        expected: Number(income.expected) || 0,
        received: Number(income.received) || 0,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Update income error:', error);
      setError('Failed to update income');
      throw error;
    }
  };

  const deleteIncome = async (id: string) => {
    try {
      setError(null);
      const batch = writeBatch(db);
      
      // Get all expenses that reference this income
      const expensesRef = collection(db, 'expenses');
      const expensesQuery = query(expensesRef, where('splits', 'array-contains', { incomeId: id }));
      const expensesSnapshot = await getDocs(expensesQuery);

      // Delete or update expenses
      expensesSnapshot.forEach((expenseDoc) => {
        const expense = expenseDoc.data();
        const splits = expense.splits || [];
        const remainingSplits = splits.filter((split: any) => split.incomeId !== id);

        if (remainingSplits.length === 0) {
          batch.delete(doc(db, 'expenses', expenseDoc.id));
        } else {
          batch.update(doc(db, 'expenses', expenseDoc.id), { 
            splits: remainingSplits,
            timestamp: serverTimestamp()
          });
        }
      });

      // Delete the income
      batch.delete(doc(db, 'incomes', id));
      await batch.commit();
    } catch (error) {
      console.error('Delete income error:', error);
      setError('Failed to delete income');
      throw error;
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      setError(null);
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expense,
        splits: expense.splits.map(split => ({
          ...split,
          amount: Number(split.amount) || 0
        })),
        timestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Add expense error:', error);
      setError('Failed to add expense');
      throw error;
    }
  };

  const updateExpense = async (id: string, expense: Partial<Expense>) => {
    try {
      setError(null);
      const docRef = doc(db, 'expenses', id);
      await updateDoc(docRef, {
        ...expense,
        splits: expense.splits?.map(split => ({
          ...split,
          amount: Number(split.amount) || 0
        })),
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Update expense error:', error);
      setError('Failed to update expense');
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      console.error('Delete expense error:', error);
      setError('Failed to delete expense');
      throw error;
    }
  };

  return {
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
  };
};

export default useFirestore;