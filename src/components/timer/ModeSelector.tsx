import { Button } from "@/components/ui/button";
import { TimerMode, PomodoroSettings, minutesForMode } from "@/lib/pomodoro";
import { Brain, Coffee, Armchair } from "lucide-react";

interface ModeSelectorProps {
  currentMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  settings: PomodoroSettings;
  disabled?: boolean;
}

export const ModeSelector = ({ currentMode, onModeChange, settings, disabled }: ModeSelectorProps) => {
  const modes: { value: TimerMode; label: string; icon: typeof Brain }[] = [
    { value: "focus", label: "Foco", icon: Brain },
    { value: "short-break", label: "Pausa", icon: Coffee },
    { value: "long-break", label: "Descanso", icon: Armchair },
  ];

  return (
    <div className="flex w-full max-w-md min-w-0 gap-1 p-1.5 bg-card/70 border border-foreground/10 rounded-2xl backdrop-blur-sm">
      {modes.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant={currentMode === value ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange(value)}
          disabled={disabled}
          className={`flex-1 min-w-0 px-1.5 sm:px-3 rounded-xl transition-all duration-200 ${currentMode === value ? "bg-primary/15 text-primary border border-primary/30 shadow-glow" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Icon strokeWidth={1.5} className="w-4 h-4 shrink-0 sm:mr-2 mr-1" />
          <span className="truncate">{label}</span>
          <span className="ml-1 text-xs opacity-70 hidden sm:inline">{minutesForMode(value, settings)}m</span>
        </Button>
      ))}
    </div>
  );
};
