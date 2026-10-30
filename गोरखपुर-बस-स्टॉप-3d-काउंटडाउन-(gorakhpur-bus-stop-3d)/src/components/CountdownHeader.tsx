import React from 'react';
import { Clock, MapPin, Sparkles } from 'lucide-react';

interface CountdownHeaderProps {
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    targetDate: Date;
    isComplete: boolean;
  };
  onQuickPreset: (days: number, seconds?: number) => void;
  onResetToFifth?: (isAM?: boolean) => void;
  busStatus: string;
}

export const CountdownHeader: React.FC<CountdownHeaderProps> = ({
  timeLeft,
  onQuickPreset,
  onResetToFifth,
  busStatus,
}) => {
  // Format target date string
  const formattedTarget = React.useMemo(() => {
    try {
      const dateOpts: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
      const timeOpts: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const ampm = timeLeft.targetDate.getHours() >= 12 ? 'दोपहर 2:00 PM' : 'रात 2:00 AM';
      const dateStr = timeLeft.targetDate.toLocaleDateString('en-GB', dateOpts);
      const timeStr = timeLeft.targetDate.toLocaleTimeString('en-GB', timeOpts);
      return `${dateStr}, ${timeStr} (${ampm} - Gorakhpur time)`;
    } catch {
      return '5 November 2026, 14:00:00 (दोपहर 2:00 PM - Gorakhpur time)';
    }
  }, [timeLeft.targetDate]);

  return (
    <header className="w-full max-w-4xl mx-auto px-4 pt-2 z-20 pointer-events-none select-none flex flex-col items-center">
      {/* 1. Slim Top Route & Status Bar (Compact floating pill) */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 mb-1.5">
        <div className="bg-slate-900/60 backdrop-blur-xs border border-white/15 px-3 py-1 rounded-full text-xs text-sky-200 flex items-center gap-2 shadow-md">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>मार्ग: पंजाब ➔ दिल्ली ➔ लखनऊ ➔ <strong className="text-amber-300">गोरखपुर</strong></span>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xs border border-white/15 px-3 py-1 rounded-full text-xs text-slate-200 flex items-center gap-1.5 shadow-md">
          <span>{busStatus === 'departing' ? '🚏 बस स्टेशन खाली है' : '🚏 5 लड़के: कुणाल, आदित्य, प्रांजल, करण, पिंकू'}</span>
          {busStatus === 'at_stop' && (
            <span className="bg-emerald-500/80 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
              बस आ गई!
            </span>
          )}
          {busStatus === 'approaching' && (
            <span className="bg-amber-500/80 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
              बस आ रही है...
            </span>
          )}
        </div>
      </div>

      {/* 2. Direct Floating Title (Zero background box - 100% visible 3D scenery!) */}
      <div className="text-center my-0.5">
        <h1 className="font-cartoon text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
          Travel Countdown
        </h1>
        <p className="text-xs sm:text-sm text-sky-100 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          गोरखपुर एक्सप्रेस बस आगमन • प्रस्थान: 5 तारीख को दोपहर 2:00 बजे
        </p>
      </div>

      {/* 3. Compact Floating Countdown Numbers (Semi-transparent so 3D background shines through) */}
      <div className="pointer-events-auto grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-xl mx-auto my-1.5">
        {/* DAYS */}
        <div className="bg-slate-900/40 hover:bg-slate-900/60 border border-white/20 rounded-2xl py-1.5 px-1 sm:p-2 text-center shadow-lg backdrop-blur-xs transition">
          <span className="block font-mono text-2xl sm:text-4xl md:text-5xl font-black text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {String(timeLeft.days).padStart(1, '0')}
          </span>
          <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sky-200 drop-shadow">
            DAYS (दिन)
          </span>
        </div>

        {/* HOURS */}
        <div className="bg-slate-900/40 hover:bg-slate-900/60 border border-white/20 rounded-2xl py-1.5 px-1 sm:p-2 text-center shadow-lg backdrop-blur-xs transition">
          <span className="block font-mono text-2xl sm:text-4xl md:text-5xl font-black text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sky-200 drop-shadow">
            HOURS (घंटे)
          </span>
        </div>

        {/* MINUTES */}
        <div className="bg-slate-900/40 hover:bg-slate-900/60 border border-white/20 rounded-2xl py-1.5 px-1 sm:p-2 text-center shadow-lg backdrop-blur-xs transition">
          <span className="block font-mono text-2xl sm:text-4xl md:text-5xl font-black text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sky-200 drop-shadow">
            MINUTES (मिनट)
          </span>
        </div>

        {/* SECONDS */}
        <div className="bg-slate-900/40 hover:bg-slate-900/60 border border-rose-400/40 rounded-2xl py-1.5 px-1 sm:p-2 text-center shadow-lg backdrop-blur-xs transition ring-1 ring-rose-400/30">
          <span className="block font-mono text-2xl sm:text-4xl md:text-5xl font-black text-rose-400 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-200 drop-shadow">
            SECONDS (सेकंड)
          </span>
        </div>
      </div>

      {/* 4. Slim Floating Target Time & Presets Pill */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 bg-slate-900/60 backdrop-blur-xs border border-white/15 px-3 py-1 rounded-full text-[11px] sm:text-xs text-slate-200 shadow-md">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>लक्ष्य: <strong className="text-white">{formattedTarget}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 ml-1 border-l border-white/20 pl-2">
          <button
            onClick={() => onResetToFifth ? onResetToFifth(false) : onQuickPreset(6)}
            className="px-2 py-0.5 rounded-md bg-emerald-600/60 hover:bg-emerald-600 text-emerald-100 font-bold active:scale-95 transition text-[10px]"
            title="5 तारीख दोपहर 2:00 बजे"
          >
            5 तारीख 2 PM
          </button>
          <button
            onClick={() => onQuickPreset(0, 10)}
            className="px-2 py-0.5 rounded-md bg-amber-600/60 hover:bg-amber-600 text-amber-100 font-bold active:scale-95 transition text-[10px] flex items-center gap-0.5"
            title="10 Second Test"
          >
            <Sparkles className="w-2.5 h-2.5" />
            10s टेस्ट
          </button>
        </div>
      </div>
    </header>
  );
};
