
import React from 'react';
import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Housing', icon: '🏠', color: '#1E293B' },
  { id: 'cat-2', name: 'Food & Dining', icon: '🍔', color: '#10B981' },
  { id: 'cat-3', name: 'Transport', icon: '🚗', color: '#3B82F6' },
  { id: 'cat-4', name: 'Shopping', icon: '🛍️', color: '#F59E0B' },
  { id: 'cat-5', name: 'Utilities', icon: '⚡', color: '#6366F1' },
  { id: 'cat-6', name: 'Healthcare', icon: '🏥', color: '#EF4444' },
  { id: 'cat-7', name: 'Entertainment', icon: '🎮', color: '#8B5CF6' },
  { id: 'cat-8', name: 'Income', icon: '💰', color: '#059669' },
  { id: 'cat-9', name: 'Others', icon: '📦', color: '#94A3B8' },
];

export const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Mobile Pay'];
