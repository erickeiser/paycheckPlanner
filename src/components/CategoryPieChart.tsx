import React, { useEffect, useRef } from 'react';
import { PieChartIcon } from 'lucide-react';
import { Expense, Category } from '../types';

interface CategoryPieChartProps {
  expenses: Expense[];
  categories: Category[];
}

function CategoryPieChart({ expenses, categories }: CategoryPieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCategoryTotal = (categoryId: string) => {
    return expenses
      .filter(expense => expense.category === categoryId)
      .reduce((sum, expense) => 
        sum + expense.splits.reduce((total, split) => 
          total + (Number(split.amount) || 0), 0
        ), 0
      );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    const totalExpenses = expenses.reduce(
      (sum, expense) => 
        sum + expense.splits.reduce((total, split) => 
          total + (Number(split.amount) || 0), 0
        ), 0
    );
    
    if (totalExpenses === 0) {
      // Draw empty circle if no expenses
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    let startAngle = 0;
    
    categories.forEach(category => {
      const categoryTotal = getCategoryTotal(category.id);
      if (categoryTotal === 0) return;

      const sliceAngle = (2 * Math.PI * categoryTotal) / totalExpenses;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.fillStyle = category.color;
      ctx.fill();

      startAngle += sliceAngle;
    });
  }, [expenses, categories]);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <PieChartIcon size={48} className="mb-2" />
        <p>No expenses to display</p>
      </div>
    );
  }

  const totalExpenses = expenses.reduce(
    (sum, expense) => 
      sum + expense.splits.reduce((total, split) => 
        total + (Number(split.amount) || 0), 0
      ), 0
  );

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="mx-auto"
      />
      
      <div className="grid grid-cols-2 gap-4">
        {categories.map(category => {
          const total = getCategoryTotal(category.id);
          if (total === 0) return null;
          
          const percentage = ((total / totalExpenses) * 100).toFixed(1);
          
          return (
            <div key={category.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <div>
                <p className="text-sm font-medium text-gray-700">{category.name}</p>
                <p className="text-sm text-gray-500">
                  ${total.toFixed(2)} ({percentage}%)
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryPieChart;