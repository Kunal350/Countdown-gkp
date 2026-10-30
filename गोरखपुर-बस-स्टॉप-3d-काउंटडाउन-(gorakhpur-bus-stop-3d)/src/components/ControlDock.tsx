import React from 'react';
import {
  Camera,
  Sun,
  Sunset,
  Moon,
  Bus,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Info,
  Users,
  Timer,
  Navigation,
} from 'lucide-react';
import { CameraPreset, TimeOfDay } from '../types';

interface ControlDockProps {
  currentCamera: CameraPreset;
  onSelectCamera: (cam: CameraPreset) => void;
  timeOfDay: TimeOfDay;
  onChangeTimeOfDay: (mood: TimeOfDay) => void;
  busStatus: string;
  onCallBus: () => void;
  onResetBus: () => void;
  onOpenKidsModal: () => void;
  onOpenInfo: () => void;
  onResetCountdown: (days: number, seconds?: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  currentCamera,
  onSelectCamera,
  timeOfDay,
  onChangeTimeOfDay,
  busStatus,
  onCallBus,
  onResetBus,
  onOpenKidsModal,
  onOpenInfo,
  onResetCountdown,
  isMuted,
  onToggleMute,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Keyboard shortcut 'H' to toggle dock
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setIsCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 w-full max-w-[940px] px-3 pointer-events-none transition-transform duration-300">
      {/* Collapse / Expand Tab pinned to top edge */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="pointer-events-auto px-3.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-sky-300 border border-sky-400/30 text-xs font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5 transition active:scale-95"
          title="Toggle Controls (Press H)"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>कंट्रोल दिखाएं (Show Controls)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>कंट्रोल छुपाएं (Hide - Fullscreen View)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock Container */}
      {!isCollapsed && (
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-3xl p-3 md:p-4 shadow-2xl text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            {/* 1. Camera Presets */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                कैमरा (Camera Views)
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'overview', label: 'पूरा दृश्य' },
                  { id: 'kids', label: '5 बच्चे' },
                  { id: 'road', label: 'हाईवे' },
                  { id: 'shelter', label: 'स्टॉप' },
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCamera(c.id as CameraPreset)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                      currentCamera === c.id
                        ? 'bg-sky-500 text-white shadow'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Lighting / Time of Day */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                मौसम व समय (Lighting)
              </span>
              <div className="flex gap-1.5">
                {[
                  { id: 'day', label: 'दिन', icon: Sun, color: 'text-amber-400' },
                  { id: 'sunset', label: 'शाम', icon: Sunset, color: 'text-orange-400' },
                  { id: 'night', label: 'रात', icon: Moon, color: 'text-indigo-400' },
                ].map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => onChangeTimeOfDay(m.id as TimeOfDay)}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition ${
                        timeOfDay === m.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Bus Controls */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Bus className="w-3.5 h-3.5 text-emerald-400" />
                बस एक्शन (Bus Arrival)
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={onCallBus}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>बस बुलाओ!</span>
                </button>

                <button
                  onClick={onResetBus}
                  className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/10 active:scale-95 transition"
                  title="Reset Bus Location"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4. Quick Actions (Kids details, Info, Audio Mute) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-purple-400" />
                विशेष सुविधाएं
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={onOpenKidsModal}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 flex items-center justify-center gap-1 active:scale-95 transition"
                  title="Meet 5 Kids"
                >
                  <Users className="w-3.5 h-3.5 text-rose-400" />
                  <span>5 बच्चे</span>
                </button>

                <button
                  onClick={onOpenInfo}
                  className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium border border-white/10 flex items-center justify-center gap-1 active:scale-95 transition"
                  title="Gorakhpur Details"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>गोरखपुर</span>
                </button>

                <button
                  onClick={onToggleMute}
                  className={`py-1.5 px-2.5 rounded-xl border text-xs font-medium active:scale-95 transition ${
                    isMuted
                      ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                      : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
