import React from 'react';
import { X, Train, Landmark, Waves, BookOpen, Compass, Award } from 'lucide-react';
import { GORAKHPUR_FACTS } from '../data/kids';

interface GorakhpurInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GorakhpurInfoModal: React.FC<GorakhpurInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const icons = [Train, Landmark, Waves, BookOpen];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 md:p-6 max-w-lg w-full shadow-2xl relative text-white max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-cartoon text-2xl font-bold text-amber-400">
              गोरखपुर दर्शन (Explore Gorakhpur)
            </h3>
            <p className="text-xs text-slate-400">
              हमारी बस का अंतिम गंतव्य • Final Destination Facts
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {GORAKHPUR_FACTS.map((fact, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={fact.title}
                className="bg-slate-800/80 rounded-2xl p-3.5 border border-white/10 hover:border-amber-400/30 transition"
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                  <h4 className="font-bold text-sm text-white">{fact.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">({fact.subtitle})</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  {fact.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Travel Highlights */}
        <div className="mt-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-xs text-amber-200">
          <div className="flex items-center gap-2 font-bold mb-1 text-amber-300">
            <Award className="w-4 h-4" />
            <span>सफ़र के विशेष टिप्स (Roadtrip Highlights)</span>
          </div>
          <p>
            बस मार्ग: पंजाब से निकलकर दिल्ली और लखनऊ होते हुए ऐतिहासिक गोरखपुर पहुँचेगी। बच्चों के लिए खिड़की वाली सीट से हरियाली और खेत देखना सबसे मनमोहक अनुभव होगा!
          </p>
        </div>
      </div>
    </div>
  );
};
