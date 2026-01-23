
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import BudgetManager from './components/BudgetManager';
import SummaryView from './components/SummaryView';
import TransactionModal from './components/TransactionModal';
import AiAssistant from './components/AiAssistant';
import { Transaction, Budget, ViewType, Category } from './types';
import { DEFAULT_CATEGORIES } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  
  // Safe initialization for localStorage to prevent errors on SSR or limited environments
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('cashflow_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem('cashflow_budgets');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [categories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('cashflow_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch { return DEFAULT_CATEGORIES; }
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    localStorage.setItem('cashflow_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('cashflow_budgets', JSON.stringify(budgets));
  }, [budgets]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (t: Transaction) => {
    setTransactions(prev => prev.map(item => item.id === t.id ? t : item));
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const duplicateTransaction = (t: Transaction) => {
    const newT = { ...t, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString().split('T')[0] };
    setTransactions(prev => [newT, ...prev]);
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900 overflow-hidden font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        <header className="bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {activeView === 'dashboard' ? 'Overview' : 
               activeView === 'ai' ? 'AI Advisor' :
               activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CashFlow Manager</p>
          </div>
          <button 
            onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="text-lg">+</span> NEW TRANSACTION
          </button>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
          {activeView === 'dashboard' && <Dashboard transactions={transactions} budgets={budgets} categories={categories} />}
          {activeView === 'transactions' && <TransactionList transactions={transactions} onDelete={deleteTransaction} onEdit={handleEdit} onDuplicate={duplicateTransaction} />}
          {activeView === 'budgets' && <BudgetManager budgets={budgets} setBudgets={setBudgets} categories={categories} transactions={transactions} />}
          {activeView === 'summary' && <SummaryView transactions={transactions} />}
          {activeView === 'ai' && <AiAssistant transactions={transactions} budgets={budgets} />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t flex justify-around p-3 md:hidden z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon="📊" />
        <NavButton active={activeView === 'transactions'} onClick={() => setActiveView('transactions')} icon="📝" />
        <button 
          onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} 
          className="bg-slate-900 text-white w-14 h-14 rounded-full -mt-10 shadow-2xl border-4 border-white flex items-center justify-center text-2xl active:scale-90 transition-all"
        >
          +
        </button>
        <NavButton active={activeView === 'budgets'} onClick={() => setActiveView('budgets')} icon="🎯" />
        <NavButton active={activeView === 'ai'} onClick={() => setActiveView('ai')} icon="✨" />
      </nav>

      {isModalOpen && (
        <TransactionModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => {
            if (editingTransaction) updateTransaction({ ...data, id: editingTransaction.id });
            else addTransaction(data);
            setIsModalOpen(false);
          }}
          transaction={editingTransaction}
          categories={categories}
        />
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: string }) => (
  <button onClick={onClick} className={`p-2 rounded-xl transition-all ${active ? 'bg-slate-100 text-slate-900 scale-110' : 'text-slate-400'}`}>
    <span className="text-xl">{icon}</span>
  </button>
);

export default App;
