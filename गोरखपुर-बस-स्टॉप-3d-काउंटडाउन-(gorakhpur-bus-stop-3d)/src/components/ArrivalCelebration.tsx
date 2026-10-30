import React from 'react';
import confetti from 'canvas-confetti';
import { Bus, PartyPopper, Volume2, ArrowRight, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ArrivalCelebrationProps {
  isVisible: boolean;
  onHonk: () => void;
  onDepart: () => void;
  onResetTimer: () => void;
  onDismiss: () => void;
}

export const ArrivalCelebration: React.FC<ArrivalCelebrationProps> = ({
  isVisible,
  onHonk,
  onDepart,
  onResetTimer,
  onDismiss,
}) => {
  React.useEffect(() => {
    if (isVisible) {
      soundManager.playArrivalCelebration();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#f59e0b', '#ec4899', '#22c55e', '#a855f7'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 max-w-lg w-[92vw] pointer-events-auto animate-in slide-in-from-top-4 duration-300">
      <div className="bg-gradient-to-r from-emerald-900/95 via-slate-900/95 to-teal-900/95 border-2 border-emerald-400 rounded-3xl p-4 shadow-2xl text-white">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
            <PartyPopper className="w-6 h-6 animate-bounce" />
          </div>

          <div className="flex-1">
            <h3 className="font-cartoon text-xl font-bold text-emerald-300">
              🎉 गोरखपुर एक्सप्रेस आ गई! (Bus Has Arrived!)
            </h3>
            <p className="text-xs text-slate-200 mt-0.5">
              पाँचों दोस्त (कुणाल, आदित्य, प्रांजल, करण और पिंकू) बैग लेकर बस में चढ़ने के लिए तैयार हैं! सीट नंबर 1 से 5 आरक्षित हैं।
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={onHonk}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" />
                हॉर्न बजाओ! (Honk Horn)
              </button>

              <button
                onClick={onDepart}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95"
              >
                <Bus className="w-3.5 h-3.5" />
                रवाना करो (Depart to Gorakhpur)
              </button>

              <button
                onClick={onResetTimer}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-white/10 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                काउंटडाउन रीसेट
              </button>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
