'use client';

export type MascotMood = 'happy' | 'sweat' | 'dizzy';

export function BaryaChan({ mood }: { mood: MascotMood }) {
  return (
    <div
      className="relative flex h-14 w-14 select-none items-center justify-center rounded-full border-[3px] border-[#2B252C] bg-[#FBBF24] shadow-[0_3px_0_#2B252C] transition-transform duration-300 hover:scale-105"
      title={
        mood === 'happy'
          ? 'Barya-chan is thriving!'
          : mood === 'sweat'
            ? 'Careful, daily buffer is getting tight!'
            : 'Whoa! Over daily pace!'
      }
    >
      <div className="flex h-10 w-10 flex-col items-center justify-center rounded-full border-2 border-[#D97706]/50 bg-[#FDE68A]">
        {mood === 'happy' && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2B252C]" />
            <span className="h-2 w-2 rounded-full bg-[#2B252C]" />
          </div>
        )}
        {mood === 'sweat' && (
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-2 rounded-full bg-[#2B252C]" />
            <span className="h-1.5 w-2 rounded-full bg-[#2B252C]" />
          </div>
        )}
        {mood === 'dizzy' && (
          <div className="flex items-center gap-1.5 text-[10px] font-black leading-none text-[#2B252C]">
            <span>@</span>
            <span>@</span>
          </div>
        )}

        <div className="mt-0.5 flex items-center gap-1">
          <span className="h-1.5 w-2 rounded-full bg-[#FB7185]/70" />
          {mood === 'happy' && (
            <span className="h-1.5 w-2.5 rounded-b-full border-b-2 border-[#2B252C]" />
          )}
          {mood === 'sweat' && (
            <span className="h-1.5 w-2 rounded-full border-2 border-[#2B252C]" />
          )}
          {mood === 'dizzy' && (
            <span className="h-1 w-2.5 rounded-t-full border-t-2 border-[#2B252C]" />
          )}
          <span className="h-1.5 w-2 rounded-full bg-[#FB7185]/70" />
        </div>
      </div>

      {mood === 'sweat' && (
        <span className="absolute -left-1.5 top-1 text-xs drop-shadow">💧</span>
      )}
      {mood === 'happy' && (
        <span className="absolute -left-1.5 top-0.5 text-xs">✨</span>
      )}
    </div>
  );
}