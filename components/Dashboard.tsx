
import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, Budget, Category } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { GoogleGenAI } from '@google/genai';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets, categories }) => {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const stats = useMemo(() => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions, currentMonth]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!process.env.API_KEY || transactions.length === 0 || aiSummary) return;
      setIsAiLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const monthData = transactions.filter(t => t.date.startsWith(currentMonth)).slice(0, 30);
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Analyze these transactions for ${currentMonth}: ${JSON.stringify(monthData)}. Provide a 1-sentence summary of financial health.`,
        });
        setAiSummary(response.text || '');
      } catch (e) {
        console.error(e);
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchSummary();
  }, [transactions, currentMonth]);

  const categoryData = useMemo(() => {
    const monthExpenses = transactions.filter(t => t.date.startsWith(currentMonth) && t.type === 'expense');
    const grouped = monthExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions, currentMonth]);

  const budgetProgress = useMemo(() => {
    return budgets.filter(b => b.month === currentMonth).map(b => {
      const actual = transactions
        .filter(t => t.date.startsWith(currentMonth) && t.category === b.category && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const percent = (actual / b.limit) * 100;
      return { ...b, actual, percent };
    });
  }, [budgets, transactions, currentMonth]);

  return (
    <div className="space-y-6">
      {/* AI Summary Banner */}
      {aiSummary && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-2xl text-white flex items-center gap-4 shadow-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-xl shrink-0">✨</div>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-0.5">AI Insights</h4>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">{aiSummary}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Income" amount={stats.income} color="text-emerald-600" icon="💰" />
        <StatCard title="Total Expenses" amount={stats.expenses} color="text-rose-600" icon="💸" />
        <StatCard title="Net Balance" amount={stats.balance} color="text-slate-900" icon="⚖️" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-semibold mb-6 flex justify-between items-center">
            Expense by Category
            <span className="text-xs font-normal text-slate-400">This Month</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.slice(0, 4).map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}></span>
                {d.name}: ৳{d.value.toLocaleString()}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-semibold mb-6">Top Budgets</h3>
          <div className="space-y-4">
            {budgetProgress.length > 0 ? budgetProgress.slice(0, 4).map(b => (
              <div key={b.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{b.category}</span>
                  <span className="text-slate-400">৳{b.actual.toLocaleString()} / ৳{b.limit.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      b.percent > 100 ? 'bg-rose-500' : b.percent > 90 ? 'bg-orange-500' : b.percent > 70 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${Math.min(b.percent, 100)}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 italic">No budgets set for this month</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="font-semibold mb-6">Recent Transactions</h3>
        <div className="divide-y">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="py-3 flex justify-between items-center hover:bg-slate-50 transition-colors px-2 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                  {t.type === 'income' ? '💹' : '📉'}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.note || t.category}</p>
                  <p className="text-xs text-slate-400">{t.date}</p>
                </div>
              </div>
              <div className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                {t.type === 'income' ? '+' : '-'}৳{t.amount.toLocaleString()}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-6 text-slate-400">No transactions recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const DEFAULT_COLORS = ['#1E293B', '#10B981', '#3B82F6', '#F59E0B', '#6366F1', '#EF4444', '#8B5CF6'];

const StatCard = ({ title, amount, color, icon }: { title: string, amount: number, color: string, icon: string }) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-lg">{icon}</div>
      <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h4>
    </div>
    <p className={`text-3xl font-bold ${color}`}>
      ৳{amount.toLocaleString()}
    </p>
  </div>
);

export default Dashboard;
