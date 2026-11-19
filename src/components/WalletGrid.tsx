'use client';

import { useState } from 'react';
import { Check, Lock, Pencil, RotateCcw, Sparkles } from 'lucide-react';
import { Wallet } from '@/types/ledger';

interface WalletGridProps {
  wallets: Wallet[];
  selectedWalletId: string | null;
  onSelectWallet: (id: string | null) => void;
  onToggleAllowance: (id: string) => void;
  onSetBalance: (id: string, newBalance: number) => Promise<void>;
  onResetAll: () => Promise<void>;
}

export function WalletGrid({
  wallets,
  selectedWalletId,
  onSelectWallet,
  onToggleAllowance,
  onSetBalance,
  onResetAll,
}: WalletGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [saving, setSaving] = useState(false);

  const startEditing = (wallet: Wallet) => {
    setEditingId(wallet.id);
    setDraftValue(wallet.balance === 0 ? '' : String(wallet.balance));
  };

  const commitEdit = async (walletId: string) => {
    if (saving) return;
    setSaving(true);
    try {
      const parsed = parseFloat(draftValue);
      await onSetBalance(walletId, Number.isFinite(parsed) ? Math.max(0, parsed) : 0);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-5">
      <div className="mb-2.5 flex items-center justify-between px-1">
        <h2 className="font-display text-lg font-bold text-[#2B252C]">Wallet Buckets</h2>
        <div className="flex items-center gap-1.5">
          {wallets.some((w) => w.balance !== 0) && (
            <button
              type="button"
              onClick={() => onResetAll()}
              className="inline-flex items-center gap-1 rounded-full border-2 border-[#2B252C] bg-white px-2.5 py-0.5 text-[11px] font-extrabold text-[#6E6570] hover:text-[#2B252C]"
              title="Set all wallets to ₱0"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Zero all</span>
            </button>
          )}
          {selectedWalletId && (
            <button
              type="button"
              onClick={() => onSelectWallet(null)}
              className="rounded-full border-2 border-[#2B252C] bg-[#FBBF24] px-2.5 py-0.5 text-[11px] font-extrabold text-[#2B252C]"
            >
              Show all
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {wallets.map((wallet) => {
          const isSelected = selectedWalletId === wallet.id;
          const isEditing = editingId === wallet.id;

          return (
            <div
              key={wallet.id}
              onClick={() => {
                if (!isEditing) onSelectWallet(isSelected ? null : wallet.id);
              }}
              style={{ backgroundColor: wallet.color }}
              className={`squishy-btn relative cursor-pointer rounded-3xl p-3.5 text-[#2B252C] ${
                isSelected ? 'ring-4 ring-[#2B252C]/25' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-display text-base font-bold">
                  <span>{wallet.badge_emoji}</span>
                  <span>{wallet.name}</span>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleAllowance(wallet.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border-2 border-[#2B252C] bg-white/95 px-2 py-0.5 text-[10px] font-extrabold shadow-[0_2px_0_#2B252C]"
                  title="Toggle whether this wallet counts toward daily pool"
                >
                  {wallet.include_in_allowance ? (
                    <>
                      <Sparkles className="h-2.5 w-2.5 text-[#D97706]" />
                      <span>Pool</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-2.5 w-2.5 text-[#6E6570]" />
                      <span>Stash</span>
                    </>
                  )}
                </button>
              </div>

              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3 rounded-2xl border-2 border-[#2B252C] bg-white/95 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6E6570]">
                    Balance
                  </span>

                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => commitEdit(wallet.id)}
                      className="inline-flex items-center gap-0.5 rounded-md border border-[#2B252C] bg-[#34D399] px-1.5 py-0.5 text-[10px] font-extrabold"
                    >
                      <Check className="h-2.5 w-2.5" />
                      <span>Save</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditing(wallet)}
                      className="rounded-md p-0.5 text-[#6E6570] hover:bg-[#FFF9EC] hover:text-[#2B252C]"
                      title="Edit exact balance"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="font-display text-base font-bold">₱</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      autoFocus
                      value={draftValue}
                      onChange={(e) => setDraftValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit(wallet.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      placeholder="0.00"
                      className="w-full rounded-lg border-2 border-[#2B252C] bg-[#FFF9EC] px-1.5 py-0.5 font-display text-base font-bold outline-none"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => startEditing(wallet)}
                    className="font-display text-lg font-bold tabular-nums text-[#2B252C]"
                  >
                    ₱{wallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
