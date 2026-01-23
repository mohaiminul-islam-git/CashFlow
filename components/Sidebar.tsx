
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems: { id: ViewType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '📝' },
    { id: 'budgets', label: 'Budgets', icon: '🎯' },
    { id: 'summary', label: 'Monthly Summary', icon: '🗓️' },
    { id: 'ai', label: 'AI Assistant', icon: '✨' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-xl font-bold">C</div>
        <span className="text-xl font-bold tracking-tight">CashFlow</span>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeView === item.id 
              ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-r-4 border-emerald-500' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800 text-slate-500 text-xs">
        <p>© 2025 CashFlow.</p>
        <p>Developed by Md.Mohaiminul Islam</p>
      </div>
    </aside>
  );
};

export default Sidebar;
