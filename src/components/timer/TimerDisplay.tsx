import { CircularProgress } from "./CircularProgress";
import { TimerMode } from "@/hooks/useTimer";

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  progress: number;
  mode: TimerMode;
  status?: string;
}

const getModeColor = (mode: TimerMode) => {
  switch (mode) {
    case 'focus':
      return 'hsl(var(--primary))';
    case 'short-break':
      return 'hsl(var(--neon-sky))';
    case 'long-break':
      return 'hsl(var(--neon-indigo))';
  }
};

export const TimerDisplay = ({ minutes, seconds, progress, mode, status }: TimerDisplayProps) => {
  const color = getModeColor(mode);

  return (
    <div className="relative flex items-center justify-center w-[min(320px,calc(100vw-48px))] aspect-square">
      {/* Superfície interna */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-[87.5%] h-[87.5%] rounded-full border border-foreground/[0.06]"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, hsl(var(--card)) 0%, hsl(var(--background)) 75%)",
          }}
        />
      </div>

      <CircularProgress progress={progress} size={320} strokeWidth={10} color={color} />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="font-display text-[clamp(44px,15vw,64px)] leading-none font-bold tabular-nums tracking-tight transition-colors duration-300"
          style={{ color, textShadow: `0 0 28px ${color}55` }}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <p data-testid="timer-status" className="text-xs font-medium mt-3 text-muted-foreground uppercase tracking-[0.2em]">
          {status ?? "minutos"}
        </p>
      </div>
    </div>
  );
};
