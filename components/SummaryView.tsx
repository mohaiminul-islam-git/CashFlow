
import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface SummaryViewProps {
  transactions: Transaction[];
}

const SummaryView: React.FC<SummaryViewProps> = ({ transactions }) => {
  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number; txs: Transaction[] }> = {};

    transactions.forEach(t => {
      const monthKey = t.date.slice(0, 7); // YYYY-MM
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expense: 0, txs: [] };
      }
      if (t.type === 'income') {
        months[monthKey].income += t.amount;
      } else {
        months[monthKey].expense += t.amount;
      }
      months[monthKey].txs.push(t);
    });

    return Object.entries(months)
      .map(([month, data]) => ({
        month,
        ...data,
        balance: data.income - data.expense,
        label: new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [transactions]);

  const downloadMonthlyReport = (data: typeof monthlyData[0]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>CashFlow - ${data.label} Report</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print { .no-print { display: none; } }
            body { font-family: 'Inter', sans-serif; padding: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f8fafc; color: #64748b; font-size: 11px; text-transform: uppercase; padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .income { color: #10b981; font-weight: bold; }
            .expense { color: #0f172a; font-weight: bold; }
            .summary-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="flex justify-between items-start mb-10">
            <div>
              <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">CashFlow</h1>
              <p class="text-emerald-600 font-bold uppercase text-xs tracking-widest mt-1">Personal Finance Statement</p>
            </div>
            <div class="text-right">
              <h2 class="text-2xl font-bold text-slate-800">${data.label}</h2>
              <p class="text-slate-400 text-sm">Generated: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-6 mb-10">
            <div class="summary-card">
              <p class="text-xs font-bold text-slate-400 uppercase mb-1">Total Income</p>
              <p class="text-xl font-bold text-emerald-600">৳${data.income.toLocaleString()}</p>
            </div>
            <div class="summary-card">
              <p class="text-xs font-bold text-slate-400 uppercase mb-1">Total Expenses</p>
              <p class="text-xl font-bold text-rose-600">৳${data.expense.toLocaleString()}</p>
            </div>
            <div class="summary-card bg-slate-50 border-slate-200">
              <p class="text-xs font-bold text-slate-500 uppercase mb-1">Net Savings</p>
              <p class="text-xl font-bold text-slate-900">৳${data.balance.toLocaleString()}</p>
            </div>
          </div>

          <h3 class="font-bold text-slate-900 mb-2 border-b pb-2">Transaction Details</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Note</th>
                <th>Type</th>
                <th class="text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody>
              ${data.txs.sort((a,b) => a.date.localeCompare(b.date)).map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td>${t.category}</td>
                  <td class="italic text-slate-400">${t.note || '—'}</td>
                  <td class="text-[10px] font-bold uppercase">${t.type}</td>
                  <td class="text-right ${t.type === 'income' ? 'income' : 'expense'}">
                    ${t.type === 'income' ? '+' : '-'} ${t.amount.toLocaleString()}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="mt-12 text-center text-xs text-slate-400 no-print">
            <button onclick="window.print()" class="bg-emerald-600 text-white px-10 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform">Download Monthly Report (PDF)</button>
            <p class="mt-4 italic">Thank you for using CashFlow Smart Expense Tracker to manage your wealth.</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">Historical Monthly Overview</h2>
          <span className="text-xs text-slate-400 font-medium">Click on any month to download dedicated report</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4 text-emerald-600">Income</th>
                <th className="px-6 py-4 text-rose-600">Expenses</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {monthlyData.map((data) => (
                <tr key={data.month} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-700">{data.label}</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">+৳{data.income.toLocaleString()}</td>
                  <td className="px-6 py-4 text-rose-600 font-medium">-৳{data.expense.toLocaleString()}</td>
                  <td className={`px-6 py-4 font-bold ${data.balance >= 0 ? 'text-slate-900' : 'text-rose-700'}`}>
                    ৳{data.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => downloadMonthlyReport(data)}
                      className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                      Download Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {monthlyData.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-slate-50/50 rounded-b-2xl">
              <p className="text-4xl mb-4">📊</p>
              <p className="font-medium text-slate-500">No monthly records found yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monthlyData.slice(0, 6).map(data => (
          <div key={data.month + '_card'} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{data.label}</h4>
               <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${data.balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                 {data.balance >= 0 ? 'Profit' : 'Loss'}
               </span>
             </div>
             <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500 font-medium">Savings Rate</span>
                <span className="text-sm font-bold text-slate-900">
                  {data.income > 0 ? Math.round((data.balance / data.income) * 100) : 0}%
                </span>
             </div>
             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ${data.balance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                  style={{ width: `${Math.max(0, Math.min(100, data.income > 0 ? (data.balance / data.income) * 100 : 0))}%` }}
                ></div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryView;
