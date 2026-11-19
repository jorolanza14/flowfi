'use client';

import { useEffect, useState } from 'react';
import { BaryaChan } from './BaryaChan';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Keep it',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [closing, setClosing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setClosing(false);
  }, [open]);

  if (!open) return null;

  const triggerClose = (after?: () => void) => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      after?.();
    }, 180);
  };

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm();
      triggerClose(onCancel);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={() => !busy && triggerClose(onCancel)}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#2B252C]/50 px-5 backdrop-blur-[3px] ${
        closing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`kawaii-card w-full max-w-xs p-5 text-center ${
          closing ? 'animate-pop-out' : 'animate-pop-in'
        }`}
      >
        <div className="mb-3 flex justify-center">
          <BaryaChan mood={tone === 'danger' ? 'sweat' : 'happy'} />
        </div>

        <h3 className="font-display text-xl font-bold text-[#2B252C]">{title}</h3>
        <p className="mt-1.5 text-xs font-bold leading-relaxed text-[#6E6570]">
          {description}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => triggerClose(onCancel)}
            className="squishy-btn rounded-2xl bg-white py-2.5 text-xs font-extrabold text-[#2B252C] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleConfirm}
            className={`squishy-btn rounded-2xl py-2.5 text-xs font-extrabold text-[#2B252C] disabled:opacity-50 ${
              tone === 'danger' ? 'bg-[#FB7185]' : 'bg-[#34D399]'
            }`}
          >
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
