import React from 'react';
import { CreditCard, PieChart } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'paycheck' | 'budget';
  onTabChange: (tab: 'paycheck' | 'budget') => void;
}

function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white rounded-lg shadow-md p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => onTabChange('paycheck')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md transition-colors ${
              activeTab === 'paycheck'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CreditCard size={20} />
            <span>Paycheck Planner</span>
          </button>
          <button
            onClick={() => onTabChange('budget')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md transition-colors ${
              activeTab === 'budget'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <PieChart size={20} />
            <span>Budget Planner</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TabNavigation;