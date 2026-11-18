'use client';

import { useState } from 'react';
import { Delete, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EXPENSE_CATEGORIES, TransactionType, Wallet } from '@/types/ledger';

interface QuickAddDrawerProps {
  open: boolean;
  wallets: Wallet[];
  onClose: () => void;
  onSubmitEntry: (entry: {
    type: TransactionType;
    walletId: string;
    toWalletId?: string;
    amount: number;
    fee: number;
    category?: string;
    note?: string;
  }) => Promise<void>;
}

const FEE_OPTIONS = [0, 10, 15];
const QUICK_CHIPS = [20, 50, 100];
const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'];

export function QuickAddDrawer({
  open,
  wallets,
  onClose,
  onSubmitEntry,
}: QuickAddDrawerProps) {
  const [tab, setTab] = useState<TransactionType>('expense');
  const [rawAmount, setRawAmount] = useState('0');
  const [category, setCategory] = useState('Commute');
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [fee, setFee] = useState(0);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const effectiveFromId =
    wallets.some((w) => w.id === fromWalletId) ? fromWalletId : (wallets[0]?.id ?? '');
  const effectiveToId =
    wallets.some((w) => w.id === toWalletId && w.id !== effectiveFromId)
      ? toWalletId
      : (wallets.find((w) => w.id !== effectiveFromId)?.id ?? '');

  const numericAmount = parseFloat(rawAmount) || 0;

  const handleKeyPress = (key: string) => {
    if (key === 'DEL') {
      setRawAmount((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
      return;
    }
    if (key === '.') {
      if (!rawAmount.includes('.')) setRawAmount((prev) => prev + '.');
      return;
    }
    setRawAmount((prev) => {
      if (prev === '0') return key;
      if (prev.includes('.') && prev.split('.')[1].length >= 2) return prev;
      if (prev.length >= 8) return prev;
      return prev + key;
    });
  };

  const handleQuickAdd = (addValue: number) => {
    const next = (parseFloat(rawAmount) || 0) + addValue;
    setRawAmount(String(next));
  };

  const handleConfirm = async (targetWalletId: string) => {
    if (numericAmount <= 0 || submitting) return;
    setSubmitting(true);

    try {
      await onSubmitEntry({
        type: tab,
        walletId: tab === 'transfer' ? effectiveFromId : targetWalletId,
        toWalletId: tab === 'transfer' ? effectiveToId : undefined,
        amount: numericAmount,
        fee: tab === 'transfer' ? fee : 0,
        category: tab === 'expense' ? category : tab === 'income' ? 'Top-up' : 'Transfer',
        note: note.trim() || undefined,
      });

      confetti({
        particleCount: 28,
        spread: 55,
        origin: { y: 0.78 },
        colors: ['#FBBF24', '#34D399', '#38BDF8', '#FB7185'],
      });

      setRawAmount('0');
      setNote('');
      setFee(0);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2B252C]/50 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-t-[2rem] border-x-[3px] border-t-[3px] border-[#2B252C] bg-[#FFF9EC] px-5 pb-7 pt-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 rounded-2xl border-2 border-[#2B252C] bg-white p-1">
            {(['expense', 'transfer', 'income'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-xl px-3 py-1 text-xs font-extrabold capitalize transition ${
                  tab === t
                    ? 'border-2 border-[#2B252C] bg-[#FBBF24] text-[#2B252C]'
                    : 'text-[#6E6570]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="squishy-btn flex h-9 w-9 items-center justify-center rounded-full bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border-[3px] border-[#2B252C] bg-white px-4 py-2.5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6E6570]">
              Amount (PHP)
            </span>
            <div className="font-display text-3xl font-bold tabular-nums text-[#2B252C]">
              ₱{rawAmount}
            </div>
          </div>

          <div className="flex gap-1.5">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleQuickAdd(chip)}
                className="squishy-btn rounded-xl bg-[#FEF3C7] px-2.5 py-1.5 font-display text-xs font-bold"
              >
                +₱{chip}
              </button>
            ))}
          </div>
        </div>

        {tab === 'expense' ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {EXPENSE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`shrink-0 rounded-full border-2 border-[#2B252C] px-3 py-1.5 text-xs font-extrabold transition ${
                  category === cat.id
                    ? 'bg-[#34D399] shadow-[0_2px_0_#2B252C]'
                    : 'bg-white'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        ) : tab === 'transfer' ? (
          <div className="mt-3 space-y-2 rounded-2xl border-2 border-[#2B252C] bg-white p-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-extrabold">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-[#6E6570]">From</span>
                <select
                  value={effectiveFromId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                  className="rounded-xl border-2 border-[#2B252C] bg-[#FFF9EC] px-2 py-1.5 font-bold"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.badge_emoji} {w.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-[#6E6570]">To</span>
                <select
                  value={effectiveToId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="rounded-xl border-2 border-[#2B252C] bg-[#FFF9EC] px-2 py-1.5 font-bold"
                >
                  {wallets
                    .filter((w) => w.id !== effectiveFromId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.badge_emoji} {w.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-extrabold text-[#6E6570]">InstaPay Fee:</span>
              <div className="flex gap-1.5">
                {FEE_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFee(f)}
                    className={`rounded-lg border-2 border-[#2B252C] px-2.5 py-0.5 text-xs font-extrabold ${
                      fee === f ? 'bg-[#FBBF24]' : 'bg-[#FFF9EC]'
                    }`}
                  >
                    {f === 0 ? 'Free' : `+₱${f}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note (e.g., Freelance payout, Allowance)"
            className="mt-3 w-full rounded-2xl border-2 border-[#2B252C] bg-white px-3.5 py-2 text-xs font-bold outline-none"
          />
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          {NUMPAD_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeyPress(key)}
              className="squishy-btn flex h-12 items-center justify-center rounded-2xl bg-white font-display text-xl font-bold text-[#2B252C]"
            >
              {key === 'DEL' ? <Delete className="h-5 w-5" /> : key}
            </button>
          ))}
        </div>

        <div className="mt-3.5">
          {tab === 'transfer' ? (
            <button
              type="button"
              disabled={numericAmount <= 0 || submitting}
              onClick={() => handleConfirm(effectiveFromId)}
              className="squishy-btn w-full rounded-2xl bg-[#38BDF8] py-3 font-display text-base font-bold text-[#2B252C] disabled:opacity-50"
            >
              Transfer ₱{numericAmount.toLocaleString('en-PH')}
              {fee > 0 ? ` (+₱${fee} fee)` : ''}
            </button>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {wallets.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  disabled={numericAmount <= 0 || submitting}
                  onClick={() => handleConfirm(w.id)}
                  style={{ backgroundColor: w.color }}
                  className="squishy-btn flex flex-col items-center justify-center rounded-2xl py-2 text-xs font-extrabold disabled:opacity-50"
                >
                  <span className="text-base">{w.badge_emoji}</span>
                  <span>{w.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}