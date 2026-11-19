'use client';

export type MascotMood = 'happy' | 'sweat' | 'dizzy';

export function BaryaChan({ mood }: { mood: MascotMood }) {
  return (
    <div
      className="animate-float-slow relative flex h-15 w-15 select-none items-center justify-center rounded-full border-[3px] border-[#2B252C] bg-gradient-to-b from-[#FCD34D] to-[#F59E0B] shadow-[0_4px_0_#2B252C]"
      title={
        mood === 'happy'
          ? 'Barya-chan says: Pacing looks great!'
          : mood === 'sweat'
            ? 'Barya-chan says: Daily buffer is getting low!'
            : 'Barya-chan says: Over today’s daily cap!'
      }
    >
      {/* Glossy coin top highlight */}
      <span className="pointer-events-none absolute top-1 h-2 w-7 rounded-full bg-white/55" />

      <div className="flex h-11 w-11 flex-col items-center justify-center rounded-full border-2 border-[#B45309]/40 bg-[#FEF3C7]">
        {mood === 'happy' && (
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2 rounded-full bg-[#2B252C]" />
            <span className="h-2.5 w-2 rounded-full bg-[#2B252C]" />
          </div>
        )}
        {mood === 'sweat' && (
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-2.5 rotate-6 rounded-full bg-[#2B252C]" />
            <span className="h-1.5 w-2.5 -rotate-6 rounded-full bg-[#2B252C]" />
          </div>
        )}
        {mood === 'dizzy' && (
          <div className="flex items-center gap-1.5 text-[11px] font-black leading-none text-[#2B252C]">
            <span>@</span>
            <span>@</span>
          </div>
        )}

        <div className="mt-1 flex items-center gap-1">
          <span className="h-1.5 w-2.5 rounded-full bg-[#FB7185]/75" />
          {mood === 'happy' && (
            <span className="h-1.5 w-2.5 rounded-b-full border-b-[2.5px] border-[#2B252C]" />
          )}
          {mood === 'sweat' && (
            <span className="h-2 w-2 rounded-full border-2 border-[#2B252C] bg-[#FDA4AF]" />
          )}
          {mood === 'dizzy' && (
            <span className="h-1.5 w-3 rounded-t-full border-t-[2.5px] border-[#2B252C]" />
          )}
          <span className="h-1.5 w-2.5 rounded-full bg-[#FB7185]/75" />
        </div>
      </div>

      {mood === 'sweat' && (
        <span className="absolute -left-2 top-0.5 text-sm drop-shadow">💧</span>
      )}
      {mood === 'happy' && (
        <span className="absolute -left-1.5 top-0 text-sm">✨</span>
      )}
      {mood === 'dizzy' && (
        <span className="absolute -left-2 -top-1 text-sm">💫</span>
      )}
    </div>
  );
}
