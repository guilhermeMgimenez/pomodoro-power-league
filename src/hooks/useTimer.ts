import { useState, useEffect, useRef, useCallback } from "react";
import { remainingSeconds } from "@/lib/pomodoro";

export type { TimerMode } from "@/lib/pomodoro";

interface UseTimerProps {
  initialMinutes: number;
  onComplete?: () => void;
}

/** Countdown driven by an absolute end time so background tabs don't drift. */
export const useTimer = ({ initialMinutes, onComplete }: UseTimerProps) => {
  const totalSeconds = Math.max(1, Math.round(initialMinutes * 60));
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [endAt, setEndAt] = useState<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (endAt === null) setSecondsLeft(totalSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds]);

  useEffect(() => {
    if (endAt === null) return;
    const tick = () => {
      const left = remainingSeconds(endAt, Date.now());
      setSecondsLeft(left);
      if (left === 0) {
        setEndAt(null);
        onCompleteRef.current?.();
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endAt]);

  const startWith = useCallback((minutes: number) => {
    const secs = Math.max(1, Math.round(minutes * 60));
    setSecondsLeft(secs);
    setEndAt(Date.now() + secs * 1000);
  }, []);
  const start = useCallback(() => {
    setEndAt(Date.now() + (secondsLeft > 0 ? secondsLeft : totalSeconds) * 1000);
  }, [secondsLeft, totalSeconds]);
  const pause = useCallback(() => setEndAt(null), []);
  const reset = useCallback(() => {
    setEndAt(null);
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);

  const isRunning = endAt !== null;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const isFresh = !isRunning && secondsLeft === totalSeconds;

  return {
    minutes: Math.floor(secondsLeft / 60),
    seconds: secondsLeft % 60,
    progress,
    isRunning,
    isFresh,
    start,
    startWith,
    pause,
    reset,
  };
};
