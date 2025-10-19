import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerMode = 'focus' | 'short-break' | 'long-break';

interface UseTimerProps {
  initialMinutes: number;
  onComplete?: () => void;
}

export const useTimer = ({ initialMinutes, onComplete }: UseTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();

  const totalSeconds = initialMinutes * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, secondsLeft, onComplete]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(initialMinutes * 60);
  }, [initialMinutes]);

  return {
    minutes,
    seconds,
    progress,
    isRunning,
    start,
    pause,
    reset,
  };
};
