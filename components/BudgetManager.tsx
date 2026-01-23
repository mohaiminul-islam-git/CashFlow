
import React, { useState } from 'react';
import { Budget, Category, Transaction } from '../types';

interface BudgetManagerProps {
  budgets: Budget[];
  setBudgets: (b: Budget[]) => void;
  categories: Category[];
  transactions: Transaction[];
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, setBudgets, categories, transactions }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState(categories[0].name);
  const [newBudgetLimit, setNewBudgetLimit] = useState('');
  
  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthBudgets = budgets.filter(b => b.month === currentMonth);

  const handleAddBudget = () => {
    if (!newBudgetLimit || parseFloat(newBudgetLimit) <= 0) return;
    const existing = budgets.find(b => b.category === newBudgetCategory && b.month === currentMonth);
    if (existing) {
      setBudgets(budgets.map(b => (b.category === newBudgetCategory && b.month === currentMonth) ? { ...b, limit: parseFloat(newBudgetLimit) } : b));
    } else {
      setBudgets([...budgets, { category: newBudgetCategory, limit: parseFloat(newBudgetLimit), month: currentMonth }]);
    }
    setNewBudgetLimit('');
    setShowAdd(false);
  };

  const getActualSpending = (category: string) => {
    return transactions
      .filter(t => t.date.startsWith(currentMonth) && t.category === category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Monthly Budgets</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          {showAdd ? 'Close' : '+ Set Budget'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border shadow-lg animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
              <select 
                value={newBudgetCategory} 
                onChange={e => setNewBudgetCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none focus:border-slate-300 transition-all"
              >
                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Monthly Limit (৳)</label>
              <input 
                type="number" 
                value={newBudgetLimit} 
                onChange={e => setNewBudgetLimit(e.target.value)}
                placeholder="e.g. 500"
                className="w-full px-4 py-2 bg-slate-50 border rounded-lg outline-none focus:border-slate-300 transition-all"
              />
            </div>
          </div>
          <button 
            onClick={handleAddBudget}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            Save Budget Rule
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {monthBudgets.length > 0 ? monthBudgets.map(b => {
          const actual = getActualSpending(b.category);
          const percent = (actual / b.limit) * 100;
          return (
            <div key={b.category} className="bg-white p-6 rounded-2xl border shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{b.category}</h3>
                  <p className="text-xs text-slate-400">Budget Limit: ৳{b.limit.toLocaleString()}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${percent > 100 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {percent > 100 ? 'Overspent' : 'On Track'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold text-slate-900">৳{actual.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">{Math.round(percent)}% used</p>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      percent > 100 ? 'bg-rose-500' : percent > 90 ? 'bg-orange-500' : percent > 70 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  ></div>
                </div>
              </div>

              {percent > 90 && (
                <div className={`mt-4 flex items-center gap-2 p-2 rounded-lg text-xs font-medium animate-pulse ${percent > 100 ? 'bg-rose-50 text-rose-700' : 'bg-orange-50 text-orange-700'}`}>
                  ⚠️ {percent > 100 ? 'You have exceeded your budget!' : 'Budget almost reached! Watch your spending.'}
                </div>
              )}
              
              <button 
                onClick={() => setBudgets(budgets.filter(x => !(x.category === b.category && x.month === currentMonth)))}
                className="absolute top-4 right-10 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                🗑️
              </button>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed rounded-3xl text-center text-slate-400">
             <p className="text-3xl mb-3">🎯</p>
             <p className="font-medium">No budgets set for this month. Set one to keep your finances in check.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;
