import React from 'react';
import { X, Sparkles, MessageCircle, Luggage, Utensils, Heart } from 'lucide-react';
import { KidInfo } from '../types';

interface KidDialogModalProps {
  kid: KidInfo | null;
  onClose: () => void;
  onJump: (kidId: string) => void;
  onSelectKid: (kid: KidInfo) => void;
  allKids: KidInfo[];
}

export const KidDialogModal: React.FC<KidDialogModalProps> = ({
  kid,
  onClose,
  onJump,
  onSelectKid,
  allKids,
}) => {
  if (!kid) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm pointer-events-auto">
      <div className="bg-slate-900/95 border-2 border-sky-400/50 rounded-3xl p-5 max-w-md w-full shadow-2xl relative text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Avatar color & Name */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-md text-white border-2 border-white/20"
            style={{ backgroundColor: kid.avatarColor }}
          >
            {kid.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cartoon text-2xl font-bold text-white">
                {kid.hindiName} ({kid.name})
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {kid.age} साल
              </span>
            </div>
            <p className="text-xs text-sky-300 font-medium">{kid.role}</p>
          </div>
        </div>

        {/* Speech Bubble */}
        <div className="bg-slate-800/90 border border-sky-500/30 rounded-2xl p-3.5 my-3 relative shadow-inner">
          <div className="flex items-start gap-2.5">
            <MessageCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-100 text-sm md:text-base leading-snug">
                "{kid.dialogue}"
              </p>
              <p className="text-xs text-slate-400 italic mt-1">
                "{kid.englishDialogue}"
              </p>
            </div>
          </div>
        </div>

        {/* Kid Luggage & Details */}
        <div className="space-y-2 text-xs md:text-sm my-3 bg-slate-950/50 rounded-2xl p-3 border border-white/10">
          <div className="flex items-center gap-2 text-slate-300">
            <Luggage className="w-4 h-4 text-purple-400 shrink-0" />
            <span><strong>सामान (Luggage):</strong> {kid.bagType}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Utensils className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>मनपसंद व्यंजन:</strong> {kid.favoriteGorakhpurSnack}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Heart className="w-4 h-4 text-rose-400 shrink-0" />
            <span><strong>मनपसंद सीट:</strong> {kid.seatPreference}</span>
          </div>
        </div>

        {/* Action Button: Jump & Wave */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onJump(kid.id)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            👋 मस्ती में कूदो! (Jump & Cheer!)
          </button>
        </div>

        {/* Quick Kid switcher strip */}
        <div className="border-t border-white/10 pt-3 mt-4">
          <p className="text-[11px] text-slate-400 text-center mb-2 font-medium">अन्य बच्चों से बात करें (Meet other kids):</p>
          <div className="flex justify-center gap-2">
            {allKids.map(k => (
              <button
                key={k.id}
                onClick={() => onSelectKid(k)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  k.id === kid.id
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {k.hindiName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
