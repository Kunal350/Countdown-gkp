import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SceneManager } from './3d/SceneManager';
import { CountdownHeader } from './components/CountdownHeader';
import { ControlDock } from './components/ControlDock';
import { KidDialogModal } from './components/KidDialogModal';
import { GorakhpurInfoModal } from './components/GorakhpurInfoModal';
import { ArrivalCelebration } from './components/ArrivalCelebration';
import { useCountdown } from './hooks/useCountdown';
import { KIDS_DATA } from './data/kids';
import { BusState, CameraPreset, KidInfo, TimeOfDay } from './types';
import { soundManager } from './utils/audio';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // App UI State
  const [selectedKid, setSelectedKid] = useState<KidInfo | null>(null);
  const [busState, setBusState] = useState<BusState>('away');
  const [currentCamera, setCurrentCamera] = useState<CameraPreset>('overview');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [showArrivalBanner, setShowArrivalBanner] = useState<boolean>(false);

  // Countdown timer targeting 5 तारीख दोपहर 2:00 बजे (5th at 2:00 PM)
  const handleCountdownComplete = useCallback(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.callBus();
    }
    setShowArrivalBanner(true);
  }, []);

  const countdown = useCountdown(undefined, handleCountdownComplete);

  // Initialize Three.js Scene once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const manager = new SceneManager({
      container: canvasMountRef.current,
      onKidSelect: (kid: KidInfo) => {
        setSelectedKid(kid);
      },
      onBusStateChange: (state: BusState) => {
        setBusState(state);
        if (state === 'at_stop') {
          setShowArrivalBanner(true);
        }
      },
    });

    sceneManagerRef.current = manager;

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Handlers
  const handleSelectCamera = (preset: CameraPreset) => {
    setCurrentCamera(preset);
    sceneManagerRef.current?.setCameraPreset(preset);
  };

  const handleChangeTimeOfDay = (mood: TimeOfDay) => {
    setTimeOfDay(mood);
    sceneManagerRef.current?.setTimeOfDay(mood);
  };

  const handleCallBus = () => {
    sceneManagerRef.current?.callBus();
    setShowArrivalBanner(false);
  };

  const handleResetBus = () => {
    sceneManagerRef.current?.resetBus();
    setShowArrivalBanner(false);
  };

  const handleDepartBus = () => {
    setSelectedKid(null);
    sceneManagerRef.current?.departBus();
    setShowArrivalBanner(false);
  };

  const handleHonkHorn = () => {
    soundManager.playBusHorn();
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleJumpKid = (id: string) => {
    sceneManagerRef.current?.triggerKidAnimation(id);
    const kidIndex = KIDS_DATA.findIndex(k => k.id === id);
    soundManager.playKidChime(kidIndex >= 0 ? kidIndex : 0);
  };

  const handleQuickPreset = (days: number, extraSeconds?: number) => {
    countdown.setPreset(days, extraSeconds);
    if (extraSeconds && extraSeconds <= 15) {
      // Simulate close arrival
      setShowArrivalBanner(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-sky-400 select-none">
      {/* 1. Dedicated WebGL 3D Canvas Mount Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* 2. Top Banner / Countdown Header */}
      <CountdownHeader
        timeLeft={countdown}
        onQuickPreset={handleQuickPreset}
        onResetToFifth={countdown.resetToFifthAtTwoPM}
        busStatus={busState}
      />

      {/* 3. Subtle 3D Navigation Hint (Top Right) */}
      <div className="absolute top-3 right-3 hidden sm:flex items-center gap-2 bg-slate-900/70 border border-white/10 text-[11px] text-slate-300 px-3 py-1.5 rounded-full pointer-events-none shadow">
        <span>🖱️ घुमाएं (Drag to Orbit)</span>
        <span>•</span>
        <span>🔍 ज़ूम (Scroll to Zoom)</span>
        <span>•</span>
        <span>👆 बच्चों पर टैप करें (Click Kids)</span>
      </div>

      {/* 4. Arrival Celebration Banner (Shows when bus pulls in or timer finishes) */}
      <ArrivalCelebration
        isVisible={showArrivalBanner && busState === 'at_stop'}
        onHonk={handleHonkHorn}
        onDepart={handleDepartBus}
        onResetTimer={() => {
          countdown.resetToFifthAtTwoPM(false);
          setShowArrivalBanner(false);
          handleResetBus();
        }}
        onDismiss={() => setShowArrivalBanner(false)}
      />

      {/* 5. Kid Dialogue & Luggage Modal */}
      <KidDialogModal
        kid={selectedKid}
        onClose={() => setSelectedKid(null)}
        onJump={handleJumpKid}
        onSelectKid={k => {
          setSelectedKid(k);
          handleJumpKid(k.id);
        }}
        allKids={KIDS_DATA}
      />

      {/* 6. Gorakhpur Tourist / Historical Facts Modal */}
      <GorakhpurInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* 7. Collapsible Bottom Control Dock */}
      <ControlDock
        currentCamera={currentCamera}
        onSelectCamera={handleSelectCamera}
        timeOfDay={timeOfDay}
        onChangeTimeOfDay={handleChangeTimeOfDay}
        busStatus={busState}
        onCallBus={handleCallBus}
        onResetBus={handleResetBus}
        onOpenKidsModal={() => setSelectedKid(KIDS_DATA[0])}
        onOpenInfo={() => setIsInfoOpen(true)}
        onResetCountdown={handleQuickPreset}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />
    </div>
  );
}
