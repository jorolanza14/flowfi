'use client';

import { useEffect, useState } from 'react';
import { ArrowRightLeft, LogOut, Plus } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { SafeSpendRing } from '@/components/SafeSpendRing';
import { WalletGrid } from '@/components/WalletGrid';
import { QuickAddDrawer } from '@/components/QuickAddDrawer';
import { AuthGate } from '@/components/AuthGate';
import { TransactionType } from '@/types/ledger';

const SESSION_KEY = 'flowfi_session_token';
const PAYDAY_MODE_KEY = 'flowfi_has_payday';
const DAILY_CAP_KEY = 'flowfi_manual_daily_cap';

function FlowfiDashboard({
  token,
  onSignOut,
}: {
  token: string;
  onSignOut: () => void;
}) {
  const dashboard = useQuery(api.flowfi.getDashboard, { token });
  const toggleAllowance = useMutation(api.flowfi.toggleWalletAllowance);
  const setWalletBalance = useMutation(api.flowfi.setWalletBalance);
  const resetAllWallets = useMutation(api.flowfi.resetAllWallets);
  const logEntry = useMutation(api.flowfi.logLedgerEntry);
  const signOutMutation = useMutation(api.flowfi.signOut);

  const [hasPayday, setHasPayday] = useState(false);
  const [daysLeft, setDaysLeft] = useState(7);
  const [manualDailyLimit, setManualDailyLimit] = useState(150);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem(PAYDAY_MODE_KEY);
    if (savedMode === 'true') setHasPayday(true);

    const savedCap = Number(localStorage.getItem(DAILY_CAP_KEY));
    if (savedCap > 0) setManualDailyLimit(savedCap);
  }, []);

  useEffect(() => {
    if (dashboard === null) {
      onSignOut();
    }
  }, [dashboard, onSignOut]);

  if (!dashboard) {
    return (
      <div className="flex min-h-dvh items-center justify-center font-display text-lg font-bold text-[#2B252C]">
        Loading Flowfi... 🪙
      </div>
    );
  }

  const { wallets, transactions } = dashboard;

  const todayStr = new Date().toDateString();
  const spentToday = transactions
    .filter((tx) => new Date(tx.spent_at).toDateString() === todayStr)
    .reduce((sum, tx) => {
      if (tx.type === 'expense') return sum + Number(tx.amount) + Number(tx.fee);
      if (tx.type === 'transfer') return sum + Number(tx.fee);
      return sum;
    }, 0);

  const spendablePool = wallets
    .filter((w) => w.include_in_allowance)
    .reduce((sum, w) => sum + Number(w.balance), 0);

  const startOfDayPool = spendablePool + spentToday;
  const dailyLimit = hasPayday
    ? Math.max(0, startOfDayPool / Math.max(1, daysLeft))
    : manualDailyLimit;

  const handleTogglePaydayMode = (nextMode: boolean) => {
    setHasPayday(nextMode);
    localStorage.setItem(PAYDAY_MODE_KEY, String(nextMode));
  };

  const handleChangeManualDailyLimit = (nextLimit: number) => {
    setManualDailyLimit(nextLimit);
    localStorage.setItem(DAILY_CAP_KEY, String(nextLimit));
  };

  const handleToggleAllowance = async (walletId: string) => {
    await toggleAllowance({ token, walletId: walletId as Id<'wallets'> });
  };

  const handleSetBalance = async (walletId: string, balance: number) => {
    await setWalletBalance({
      token,
      walletId: walletId as Id<'wallets'>,
      balance,
    });
  };

  const handleResetAll = async () => {
    await resetAllWallets({ token });
  };

  const handleSubmitEntry = async (entry: {
    type: TransactionType;
    walletId: string;
    toWalletId?: string;
    amount: number;
    fee: number;
    category?: string;
    note?: string;
  }) => {
    await logEntry({
      token,
      type: entry.type,
      walletId: entry.walletId as Id<'wallets'>,
      toWalletId: entry.toWalletId ? (entry.toWalletId as Id<'wallets'>) : undefined,
      amount: entry.amount,
      fee: entry.fee,
      category: entry.category,
      note: entry.note,
    });
  };

  const handleLogoutClick = async () => {
    await signOutMutation({ token }).catch(() => {});
    onSignOut();
  };

  const visibleTransactions = selectedWalletId
    ? transactions.filter(
        (tx) => tx.wallet_id === selectedWalletId || tx.to_wallet_id === selectedWalletId
      )
    : transactions;

  const walletMap = Object.fromEntries(wallets.map((w) => [w.id, w]));

  return (
    <main className="mx-auto min-h-dvh max-w-md px-4 pb-28 pt-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#2B252C]">
            Flowfi 🪙
          </h1>
          <p className="text-xs font-bold text-[#6E6570]">
            Bank/Pool: ₱{spendablePool.toLocaleString('en-PH')} • Spent today: ₱{spentToday.toLocaleString('en-PH')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogoutClick}
          className="squishy-btn flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#2B252C]"
          title="Sign out"
        >
          <span>☁️ Synced</span>
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </header>

      <SafeSpendRing
        spendablePool={spendablePool}
        dailyLimit={dailyLimit}
        spentToday={spentToday}
        hasPayday={hasPayday}
        onTogglePaydayMode={handleTogglePaydayMode}
        daysLeft={daysLeft}
        onChangeDaysLeft={setDaysLeft}
        manualDailyLimit={manualDailyLimit}
        onChangeManualDailyLimit={handleChangeManualDailyLimit}
      />

      <WalletGrid
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onSelectWallet={setSelectedWalletId}
        onToggleAllowance={handleToggleAllowance}
        onSetBalance={handleSetBalance}
        onResetAll={handleResetAll}
      />

      <section className="mt-5">
        <h2 className="mb-2.5 px-1 font-display text-lg font-bold text-[#2B252C]">
          Recent Activity
        </h2>

        <div className="space-y-2.5">
          {visibleTransactions.length === 0 ? (
            <div className="kawaii-card p-5 text-center text-xs font-bold text-[#6E6570]">
              No entries yet—tap <strong>Log Piso</strong> below to add your first spend!
            </div>
          ) : (
            visibleTransactions.map((tx) => {
              const source = walletMap[tx.wallet_id];
              const dest = tx.to_wallet_id ? walletMap[tx.to_wallet_id] : null;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-2xl border-2 border-[#2B252C] bg-white px-3.5 py-2.5 shadow-[0_3px_0_#2B252C]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#2B252C] bg-[#FFF9EC] text-base">
                      {tx.type === 'transfer' ? (
                        <ArrowRightLeft className="h-4 w-4" />
                      ) : (
                        source?.badge_emoji ?? '🪙'
                      )}
                    </span>
                    <div>
                      <div className="text-sm font-extrabold text-[#2B252C]">
                        {tx.type === 'transfer'
                          ? `${source?.name ?? 'Wallet'} → ${dest?.name ?? 'Wallet'}`
                          : tx.category || 'Entry'}
                      </div>
                      <div className="text-[11px] font-bold text-[#6E6570]">
                        {source?.name}
                        {tx.fee > 0 ? ` • ₱${tx.fee} fee` : ''}
                        {tx.note ? ` • ${tx.note}` : ''}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`font-display text-base font-bold tabular-nums ${
                      tx.type === 'income'
                        ? 'text-[#059669]'
                        : tx.type === 'transfer'
                          ? 'text-[#0284C7]'
                          : 'text-[#E11D48]'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}₱
                    {Number(tx.amount).toLocaleString('en-PH')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="squishy-btn flex items-center gap-2 rounded-full bg-[#FBBF24] px-6 py-3.5 font-display text-lg font-bold text-[#2B252C]"
        >
          <Plus className="h-6 w-6 stroke-[3]" />
          <span>Log Piso</span>
        </button>
      </div>

      <QuickAddDrawer
        open={drawerOpen}
        wallets={wallets}
        onClose={() => setDrawerOpen(false)}
        onSubmitEntry={handleSubmitEntry}
      />
    </main>
  );
}

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem(SESSION_KEY));
    setReady(true);
  }, []);

  const handleAuthenticated = (newToken: string) => {
    localStorage.setItem(SESSION_KEY, newToken);
    setToken(newToken);
  };

  const handleSignOut = () => {
    localStorage.removeItem(SESSION_KEY);
    setToken(null);
  };

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center font-display text-lg font-bold text-[#2B252C]">
        Waking up Barya-chan... 🪙
      </div>
    );
  }

  if (!token) {
    return <AuthGate onAuthenticated={handleAuthenticated} />;
  }

  return <FlowfiDashboard token={token} onSignOut={handleSignOut} />;
}
