
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (t: Transaction) => void;
  onDuplicate: (t: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit, onDuplicate }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = (t.note?.toLowerCase() || "").includes(search.toLowerCase()) || 
                             (t.category?.toLowerCase() || "").includes(search.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
        return b.amount - a.amount;
      });
  }, [transactions, search, filterType, sortBy]);

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount (৳)', 'Payment Method', 'Note'];
    const rows = filteredTransactions.map(t => [
      t.date, 
      t.type.toUpperCase(), 
      t.category, 
      t.amount, 
      t.paymentMethod, 
      `"${(t.note || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `CashFlow_Sheet_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    setIsExportOpen(false);
  };

  const exportToWord = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>CashFlow Report</title><style>table { border-collapse: collapse; width: 100%; font-family: sans-serif; } th, td { border: 1px solid #ddd; padding: 10px; text-align: left; } th { background-color: #f4f4f4; } h1 { text-align: center; color: #1e293b; }</style></head><body>`;
    const footer = "</body></html>";
    let table = `<h1>CashFlow Transaction Report</h1><p style='text-align:center'>Generated on: ${new Date().toLocaleString()}</p><table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount (৳)</th><th>Method</th><th>Note</th></tr></thead><tbody>`;
    
    filteredTransactions.forEach(t => {
      table += `<tr><td>${t.date}</td><td>${t.type.toUpperCase()}</td><td>${t.category}</td><td>${t.amount.toLocaleString()}</td><td>${t.paymentMethod}</td><td>${t.note || '-'}</td></tr>`;
    });
    table += "</tbody></table>";
    
    const source = header + table + footer;
    const blob = new Blob(['\ufeff', source], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CashFlow_Word_${new Date().toISOString().slice(0, 10)}.doc`;
    link.click();
    setIsExportOpen(false);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>CashFlow - Transaction Report</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print { .no-print { display: none; } }
            body { font-family: 'Inter', sans-serif; padding: 40px; background-color: white; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f8fafc; color: #64748b; font-size: 10px; text-transform: uppercase; padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #334155; }
            .income { color: #10b981; font-weight: bold; }
            .expense { color: #0f172a; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="flex justify-between items-center mb-10">
            <div>
              <h1 class="text-3xl font-bold text-slate-900 tracking-tight">CashFlow</h1>
              <p class="text-slate-500 text-sm font-medium">Smart Financial Statement</p>
            </div>
            <div class="text-right text-xs text-slate-400">
              <p class="font-bold text-slate-900">Report Date: ${new Date().toLocaleDateString()}</p>
              <p>Total Records: ${filteredTransactions.length}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Note</th>
                <th>Type</th>
                <th>Method</th>
                <th class="text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td><span class="font-semibold">${t.category}</span></td>
                  <td class="italic text-slate-400">${t.note || '—'}</td>
                  <td class="uppercase text-[9px] font-black tracking-tighter">${t.type}</td>
                  <td>${t.paymentMethod}</td>
                  <td class="text-right font-bold ${t.type === 'income' ? 'income' : 'expense'}">
                    ${t.type === 'income' ? '+' : '-'} ${t.amount.toLocaleString()}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center">
             <p class="text-[10px] text-slate-400 italic">Generated by CashFlow Personal Finance Tracker.</p>
             <button onclick="window.print()" class="no-print bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-transform">Download as PDF / Print</button>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    setIsExportOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 md:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="relative w-full lg:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search note or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border focus:border-emerald-500 rounded-xl outline-none transition-all text-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-between sm:justify-center items-center">
            <div className="flex bg-slate-100 p-1 rounded-xl flex-1 sm:flex-none">
              <button 
                onClick={() => setFilterType('all')}
                className={`flex-1 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >All</button>
              <button 
                onClick={() => setFilterType('income')}
                className={`flex-1 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
              >Income</button>
              <button 
                onClick={() => setFilterType('expense')}
                className={`flex-1 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'expense' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500'}`}
              >Expense</button>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="bg-slate-900 text-white h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md"
              >
                💾 Export
                <svg className={`w-3 h-3 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-50 mb-1">Select Format</div>
                  <button onClick={exportToCSV} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-emerald-50 transition-colors">
                    <span className="text-lg">📊</span><span className="font-semibold">Excel (Sheet)</span>
                  </button>
                  <button onClick={exportToWord} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 transition-colors">
                    <span className="text-lg">📄</span><span className="font-semibold">Word (Docx)</span>
                  </button>
                  <button onClick={printReport} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                    <span className="text-lg">🖨️</span><span className="font-semibold">PDF / Print</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Container */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Note</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-600">{t.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">{t.category}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic truncate max-w-[150px]">{t.note || '—'}</td>
                  <td className={`px-6 py-4 font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {t.type === 'income' ? '+' : '-'}৳{t.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDuplicate(t)} className="text-slate-300 hover:text-emerald-600 transition-colors" title="Duplicate">📋</button>
                    <button onClick={() => onEdit(t)} className="text-slate-300 hover:text-blue-600 transition-colors" title="Edit">✏️</button>
                    <button onClick={() => onDelete(t.id)} className="text-slate-300 hover:text-rose-600 transition-colors" title="Delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-50">
          {filteredTransactions.map((t) => (
            <div key={t.id} className="p-4 active:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${t.type === 'income' ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                    {t.type === 'income' ? '💹' : '📉'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-none mb-1">{t.category}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{t.date} • {t.paymentMethod}</p>
                  </div>
                </div>
                <div className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {t.type === 'income' ? '+' : '-'}৳{t.amount.toLocaleString()}
                </div>
              </div>
              {t.note && <p className="text-xs text-slate-500 italic mt-1 ml-13 border-l-2 border-slate-100 pl-3 py-0.5">{t.note}</p>}
              <div className="flex justify-end gap-4 mt-3 pt-3 border-t border-slate-50">
                <button onClick={() => onDuplicate(t)} className="text-xs font-bold text-emerald-600">Duplicate</button>
                <button onClick={() => onEdit(t)} className="text-xs font-bold text-blue-600">Edit</button>
                <button onClick={() => onDelete(t.id)} className="text-xs font-bold text-rose-600">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm font-medium">No records found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
