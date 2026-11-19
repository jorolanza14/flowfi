'use client';

import { useEffect, useState } from 'react';
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

const TAB_LABELS: { id: TransactionType; label: string }[] = [
  { id: 'expense', label: 'Spend' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'income', label: 'Top Up' },
];

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
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) setClosing(false);
  }, [open]);

  if (!open) return null;

  const triggerClose = () => {
    if (submitting) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 210);
  };

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
        category: tab === 'expense' ? category : tab === 'income' ? 'Top Up' : 'Transfer',
        note: note.trim() || undefined,
      });

      confetti({
        particleCount: 32,
        spread: 60,
        origin: { y: 0.78 },
        colors: ['#FBBF24', '#34D399', '#38BDF8', '#FB7185'],
      });

      setRawAmount('0');
      setNote('');
      setFee(0);
      setClosing(true);
      setTimeout(() => {
        setClosing(false);
        onClose();
      }, 210);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={triggerClose}
      className={`fixed inset-0 z-50 flex items-end justify-center bg-[#2B252C]/50 backdrop-blur-[3px] ${
        closing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-t-[2.2rem] border-x-[3px] border-t-[3px] border-[#2B252C] bg-[#FFF9EC] px-5 pb-7 pt-3 shadow-2xl ${
          closing ? 'animate-sheet-down' : 'animate-sheet-up'
        }`}
      >
        {/* Drag pill indicator */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#2B252C]/20" />

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 rounded-2xl border-2 border-[#2B252C] bg-white p-1">
            {TAB_LABELS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-xl px-3.5 py-1 text-xs font-extrabold transition-all ${
                  tab === item.id
                    ? 'border-2 border-[#2B252C] bg-[#FBBF24] text-[#2B252C] shadow-[0_2px_0_#2B252C]'
                    : 'text-[#6E6570] hover:text-[#2B252C]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={triggerClose}
            className="squishy-btn flex h-9 w-9 items-center justify-center rounded-full bg-white"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Amount Display */}
        <div className="mt-3 flex items-center justify-between rounded-2xl border-[3px] border-[#2B252C] bg-white px-4 py-2.5 shadow-[0_3px_0_#2B252C]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6E6570]">
              {tab === 'expense' ? 'Spend Amount' : tab === 'transfer' ? 'Transfer Amount' : 'Top Up Amount'}
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

        {/* Category or Transfer Controls */}
        {tab === 'expense' ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {EXPENSE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`shrink-0 rounded-full border-2 border-[#2B252C] px-3 py-1.5 text-xs font-extrabold transition-all ${
                  category === cat.id
                    ? 'bg-[#34D399] shadow-[0_2px_0_#2B252C]'
                    : 'bg-white hover:bg-[#FFF9EC]'
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
                <span className="text-[10px] uppercase text-[#6E6570]">From Wallet</span>
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
                <span className="text-[10px] uppercase text-[#6E6570]">To Wallet</span>
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
              <span className="text-xs font-extrabold text-[#6E6570]">InstaPay / Transfer Fee:</span>
              <div className="flex gap-1.5">
                {FEE_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFee(f)}
                    className={`rounded-lg border-2 border-[#2B252C] px-2.5 py-0.5 text-xs font-extrabold transition ${
                      fee === f ? 'bg-[#FBBF24] shadow-[0_2px_0_#2B252C]' : 'bg-[#FFF9EC]'
                    }`}
                  >
                    {f === 0 ? 'Free' : `+₱${f}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Optional Note Input */}
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            tab === 'expense'
              ? 'Optional note (e.g., Jeepney, Iced Latte, Lunch)'
              : tab === 'transfer'
                ? 'Optional transfer note'
                : 'Optional note (e.g., Allowance, Freelance, Refund)'
          }
          className="mt-2.5 w-full rounded-2xl border-2 border-[#2B252C] bg-white px-3.5 py-2 text-xs font-bold outline-none focus:bg-[#FFFDF8]"
        />

        {/* Numpad */}
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {NUMPAD_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeyPress(key)}
              className="squishy-btn flex h-11 items-center justify-center rounded-2xl bg-white font-display text-xl font-bold text-[#2B252C]"
            >
              {key === 'DEL' ? <Delete className="h-5 w-5" /> : key}
            </button>
          ))}
        </div>

        {/* Confirm Target Wallet */}
        <div className="mt-3.5">
          {tab === 'transfer' ? (
            <button
              type="button"
              disabled={numericAmount <= 0 || submitting}
              onClick={() => handleConfirm(effectiveFromId)}
              className="squishy-btn w-full rounded-2xl bg-[#38BDF8] py-3 font-display text-base font-bold text-[#2B252C] disabled:opacity-50"
            >
              {submitting
                ? 'Moving funds...'
                : `Transfer ₱${numericAmount.toLocaleString('en-PH')}${fee > 0 ? ` (+₱${fee} fee)` : ''}`}
            </button>
          ) : (
            <div>
              <span className="mb-1.5 block text-center text-[10px] font-extrabold uppercase tracking-wider text-[#6E6570]">
                {tab === 'expense' ? 'Tap wallet to deduct' : 'Tap wallet to top up'}
              </span>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
