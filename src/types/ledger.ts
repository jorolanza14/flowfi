export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Wallet {
  id: string;
  name: string;
  slug: string;
  balance: number;
  color: string;
  badge_emoji: string;
  include_in_allowance: boolean;
  sort_order: number;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  to_wallet_id?: string | null;
  type: TransactionType;
  amount: number;
  fee: number;
  category?: string | null;
  note?: string | null;
  spent_at: string;
}

export interface CategoryPill {
  id: string;
  label: string;
  emoji: string;
}

export const EXPENSE_CATEGORIES: CategoryPill[] = [
  { id: 'Commute', label: 'Commute', emoji: '🚌' },
  { id: 'Food', label: 'Food', emoji: '🍱' },
  { id: 'Coffee', label: 'Coffee', emoji: '🧋' },
  { id: 'Load', label: 'Load', emoji: '📱' },
  { id: 'Groceries', label: 'Groceries', emoji: '🛒' },
  { id: 'Fun', label: 'Fun', emoji: '🎮' },
];