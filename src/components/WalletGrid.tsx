'use client';

import { Lock, Sparkles } from 'lucide-react';
import { Wallet } from '@/types/ledger';

interface WalletGridProps {
  wallets: Wallet[];
  selectedWalletId: string | null;
  onSelectWallet: (id: string | null) => void;
  onToggleAllowance: (id: string) => void;
}

export function WalletGrid({
  wallets,
  selectedWalletId,
  onSelectWallet,
  onToggleAllowance,
}: WalletGridProps) {
  return (
    <section className="mt-5">
      <div className="mb-2.5 flex items-center justify-between px-1">
        <h2 className="font-display text-lg font-bold text-[#2B252C]">Wallet Buckets</h2>
        {selectedWalletId && (
          <button
            type="button"
            onClick={() => onSelectWallet(null)}
            className="rounded-full border-2 border-[#2B252C] bg-white px-2.5 py-0.5 text-xs font-extrabold text-[#2B252C]"
          >
            Show all
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {wallets.map((wallet) => {
          const isSelected = selectedWalletId === wallet.id;
          return (
            <div
              key={wallet.id}
              onClick={() => onSelectWallet(isSelected ? null : wallet.id)}
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
                  title="Toggle whether this wallet counts toward daily safe-to-spend"
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

              <div className="mt-3 rounded-2xl border-2 border-[#2B252C] bg-white/95 px-3 py-2">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#6E6570]">
                  Balance
                </span>
                <span className="font-display text-lg font-bold tabular-nums text-[#2B252C]">
                  ₱{wallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}