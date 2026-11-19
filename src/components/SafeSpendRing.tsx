'use client';

import { Minus, Plus } from 'lucide-react';
import { BaryaChan, MascotMood } from './BaryaChan';

interface SafeSpendRingProps {
  spendablePool: number;
  dailyLimit: number;
  spentToday: number;
  hasPayday: boolean;
  onTogglePaydayMode: (hasPayday: boolean) => void;
  daysLeft: number;
  onChangeDaysLeft: (days: number) => void;
  manualDailyLimit: number;
  onChangeManualDailyLimit: (limit: number) => void;
}

const CAP_PRESETS = [100, 150, 200, 300];

export function SafeSpendRing({
  spendablePool,
  dailyLimit,
  spentToday,
  hasPayday,
  onTogglePaydayMode,
  daysLeft,
  onChangeDaysLeft,
  manualDailyLimit,
  onChangeManualDailyLimit,
}: SafeSpendRingProps) {
  const remaining = dailyLimit - spentToday;
  const ratio = dailyLimit > 0 ? Math.max(0, Math.min(1, remaining / dailyLimit)) : 0;

  const size = 248;
  const strokeWidth = 19;
  const center = size / 2;
  const radius = 98;
  const innerBorderRadius = 88.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - ratio);

  const ringColor =
    remaining < 0 ? '#FB7185' : ratio < 0.25 ? '#FBBF24' : '#34D399';

  const mood: MascotMood =
    remaining < 0 ? 'dizzy' : ratio < 0.25 ? 'sweat' : 'happy';

  const estimatedRunwayDays =
    manualDailyLimit > 0 ? Math.floor(spendablePool / manualDailyLimit) : 0;

  return (
    <section className="kawaii-card animate-pop-in relative flex flex-col items-center px-5 pb-5 pt-4">
      {/* Mode Switcher */}
      <div className="mb-4 grid w-full grid-cols-2 gap-1.5 rounded-2xl border-2 border-[#2B252C] bg-[#FFF9EC] p-1">
        <button
          type="button"
          onClick={() => onTogglePaydayMode(false)}
          className={`rounded-xl py-1.5 text-xs font-extrabold transition-all duration-200 ${
            !hasPayday
              ? 'border-2 border-[#2B252C] bg-[#FBBF24] text-[#2B252C] shadow-[0_2px_0_#2B252C]'
              : 'text-[#6E6570] hover:text-[#2B252C]'
          }`}
        >
          🌱 Stretch Mode
        </button>
        <button
          type="button"
          onClick={() => onTogglePaydayMode(true)}
          className={`rounded-xl py-1.5 text-xs font-extrabold transition-all duration-200 ${
            hasPayday
              ? 'border-2 border-[#2B252C] bg-[#34D399] text-[#2B252C] shadow-[0_2px_0_#2B252C]'
              : 'text-[#6E6570] hover:text-[#2B252C]'
          }`}
        >
          💼 Payday Mode
        </button>
      </div>

      {/* Ring */}
      <div className="relative h-[248px] w-[248px]">
        <div className="absolute -right-2 -top-2 z-20">
          <BaryaChan mood={mood} />
        </div>

        <svg width={size} height={size} className="-rotate-90 overflow-visible">
          <circle
            cx={center}
            cy={center}
            r={radius + strokeWidth / 2}
            fill="#FFFDF8"
            stroke="#2B252C"
            strokeWidth={3}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#F3EAD8"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
          <circle
            cx={center}
            cy={center}
            r={innerBorderRadius}
            fill="#FFFFFF"
            stroke="#2B252C"
            strokeWidth={3}
          />
        </svg>

        <div className="absolute inset-[35px] flex flex-col items-center justify-center rounded-full px-3 text-center">
          <span
            className={`rounded-full border-2 border-[#2B252C] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider transition-colors duration-300 ${
              remaining < 0
                ? 'bg-[#FFE4E6] text-[#BE123C]'
                : 'bg-[#FEF3C7] text-[#92400E]'
            }`}
          >
            {remaining >= 0 ? 'Left today' : 'Over daily cap'}
          </span>

          <div
            style={{ fontSize: 'clamp(1.65rem, 6vw, 2.15rem)' }}
            className="mt-1 font-display font-bold leading-none tracking-tight text-[#2B252C] tabular-nums transition-all duration-300"
          >
            ₱{Math.abs(remaining).toLocaleString('en-PH', { maximumFractionDigits: 0 })}
          </div>

          <span className="mt-1.5 text-[11px] font-bold text-[#6E6570]">
            of ₱{dailyLimit.toLocaleString('en-PH', { maximumFractionDigits: 0 })} daily pace
          </span>
        </div>
      </div>

      {/* Bottom Control */}
      {hasPayday ? (
        <div className="mt-4 w-full rounded-2xl border-2 border-[#2B252C] bg-[#FFF9EC] px-3.5 py-3">
          <div className="flex items-center justify-between text-xs font-extrabold">
            <span className="text-[#6E6570]">🗓️ Cutoff countdown</span>
            <span className="rounded-lg border-2 border-[#2B252C] bg-white px-2.5 py-0.5 font-display text-[#2B252C]">
              {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            value={daysLeft}
            onChange={(e) => onChangeDaysLeft(Number(e.target.value))}
            className="mt-2.5 h-2.5 w-full cursor-pointer appearance-none rounded-lg border-2 border-[#2B252C] bg-[#FDE68A] accent-[#2B252C]"
          />
        </div>
      ) : (
        <div className="mt-4 w-full rounded-2xl border-2 border-[#2B252C] bg-[#FFF9EC] px-3.5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-xs font-extrabold text-[#2B252C]">
                🎯 Daily Spending Cap
              </span>
              <span className="text-[11px] font-bold text-[#6E6570]">
                {spendablePool > 0
                  ? `Pool lasts ~${estimatedRunwayDays} ${estimatedRunwayDays === 1 ? 'day' : 'days'}`
                  : 'Tap ✏️ on a wallet below to set balance'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onChangeManualDailyLimit(Math.max(25, manualDailyLimit - 25))}
                className="squishy-btn flex h-8 w-8 items-center justify-center rounded-xl bg-white"
                title="Decrease by ₱25"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[66px] rounded-xl border-2 border-[#2B252C] bg-white px-2 py-1 text-center font-display text-sm font-bold tabular-nums">
                ₱{manualDailyLimit}
              </span>
              <button
                type="button"
                onClick={() => onChangeManualDailyLimit(manualDailyLimit + 25)}
                className="squishy-btn flex h-8 w-8 items-center justify-center rounded-xl bg-white"
                title="Increase by ₱25"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-4 gap-1.5">
            {CAP_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeManualDailyLimit(preset)}
                className={`rounded-xl border-2 border-[#2B252C] py-1 font-display text-xs font-bold transition-all ${
                  manualDailyLimit === preset
                    ? 'bg-[#FBBF24] text-[#2B252C] shadow-[0_2px_0_#2B252C]'
                    : 'bg-white text-[#6E6570] hover:text-[#2B252C]'
                }`}
              >
                ₱{preset}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
