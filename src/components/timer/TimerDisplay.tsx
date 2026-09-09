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
      return 'hsl(var(--neon-blue))';
    case 'short-break':
      return 'hsl(var(--neon-cyan))';
    case 'long-break':
      return 'hsl(var(--neon-sky))';
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
      {/* Dark background circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[280px] h-[280px] rounded-full bg-background/80 border-2 border-border" />
      </div>
      
      <CircularProgress 
        progress={progress} 
        size={320}
        strokeWidth={12}
        color={color}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Neon glow effect on time */}
        <div className="relative animate-fade-in">
          <div className="absolute inset-0 blur-2xl opacity-30 animate-pulse" style={{ backgroundColor: color }} />
          <div className="text-8xl font-display font-bold tabular-nums tracking-tight neon-text relative z-10 transition-all duration-300" style={{ color }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
        <p className="text-sm font-medium mt-2 text-muted-foreground uppercase tracking-wider animate-fade-in">
          MINUTOS
        </p>
      </div>
    </div>
  );
};
