import { useState, useEffect, useCallback } from 'react';

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  targetDate: Date;
  isComplete: boolean;
}

// Calculates target date for "5 तारीख को दोपहर 2:00 बजे (5th of month at 2:00 PM / 14:00)"
export function getNextFifthAtTwoPM(): Date {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  // If today is past the 5th at 2:00 PM, target the 5th of next month
  if (now.getDate() > 5 || (now.getDate() === 5 && now.getHours() >= 14)) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  return new Date(year, month, 5, 14, 0, 0);
}

export function useCountdown(initialTarget?: Date, onComplete?: () => void) {
  // Set initial target to 5 तारीख दोपहर 2:00 बजे (5th at 2:00 PM)
  const [targetDate, setTargetDate] = useState<Date>(() => {
    return initialTarget || getNextFifthAtTwoPM();
  });

  const [state, setState] = useState<CountdownState>(() => {
    const now = new Date();
    const diff = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / 1000));
    return {
      days: Math.floor(diff / (24 * 3600)),
      hours: Math.floor((diff % (24 * 3600)) / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
      totalSeconds: diff,
      targetDate,
      isComplete: diff <= 0,
    };
  });

  const setPreset = useCallback((days: number, extraSeconds = 0) => {
    const now = new Date();
    const newTarget = new Date(now.getTime() + days * 24 * 60 * 60 * 1000 + extraSeconds * 1000);
    setTargetDate(newTarget);
  }, []);

  const setExactDate = useCallback((date: Date) => {
    setTargetDate(date);
  }, []);

  const resetToFifthAtTwoPM = useCallback((isAM = false) => {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    const targetHour = isAM ? 2 : 14;

    if (now.getDate() > 5 || (now.getDate() === 5 && now.getHours() >= targetHour)) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }
    setTargetDate(new Date(year, month, 5, targetHour, 0, 0));
  }, []);

  useEffect(() => {
    let firedComplete = false;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / 1000));

      const days = Math.floor(diff / (24 * 3600));
      const hours = Math.floor((diff % (24 * 3600)) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      const isComplete = diff <= 0;

      setState({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds: diff,
        targetDate,
        isComplete,
      });

      if (isComplete && !firedComplete) {
        firedComplete = true;
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  return {
    ...state,
    setPreset,
    setExactDate,
    resetToFifthAtTwoPM,
  };
}
