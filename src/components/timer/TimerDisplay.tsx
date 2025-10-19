import { CircularProgress } from "./CircularProgress";
import { TimerMode } from "@/hooks/useTimer";

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  progress: number;
  mode: TimerMode;
}

const getModeColor = (mode: TimerMode) => {
  switch (mode) {
    case 'focus':
      return 'hsl(var(--timer-focus))';
    case 'short-break':
      return 'hsl(var(--timer-short-break))';
    case 'long-break':
      return 'hsl(var(--timer-long-break))';
  }
};

const getModeLabel = (mode: TimerMode) => {
  switch (mode) {
    case 'focus':
      return 'Foco';
    case 'short-break':
      return 'Pausa Curta';
    case 'long-break':
      return 'Pausa Longa';
  }
};

export const TimerDisplay = ({ minutes, seconds, progress, mode }: TimerDisplayProps) => {
  const color = getModeColor(mode);
  
  return (
    <div className="relative flex items-center justify-center">
      <CircularProgress 
        progress={progress} 
        size={320}
        strokeWidth={10}
        color={color}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-sm font-medium mb-2 opacity-70">{getModeLabel(mode)}</p>
        <div className="text-7xl font-bold tabular-nums tracking-tight">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};
