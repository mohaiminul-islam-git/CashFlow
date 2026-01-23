
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  paymentMethod: string;
  note: string;
  isRecurring?: boolean;
  tags?: string[];
}

export interface Budget {
  category: string;
  limit: number;
  month: string; // YYYY-MM
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type ViewType = 'dashboard' | 'transactions' | 'budgets' | 'summary' | 'ai';
