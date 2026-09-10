import { Button } from "@/components/ui/button";
import { TimerMode } from "@/hooks/useTimer";
import { Brain, Coffee, Armchair } from "lucide-react";

interface ModeSelectorProps {
  currentMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  disabled?: boolean;
}

export const ModeSelector = ({ currentMode, onModeChange, disabled }: ModeSelectorProps) => {
  const modes: { value: TimerMode; label: string; icon: typeof Brain; minutes: number }[] = [
    { value: 'focus', label: 'Foco', icon: Brain, minutes: 25 },
    { value: 'short-break', label: 'Pausa', icon: Coffee, minutes: 5 },
    { value: 'long-break', label: 'Descanso', icon: Armchair, minutes: 15 },
  ];

  return (
    <div className="flex gap-1 p-1.5 bg-card/70 border border-foreground/10 rounded-2xl backdrop-blur-sm">
      {modes.map(({ value, label, icon: Icon, minutes }) => (
        <Button
          key={value}
          variant={currentMode === value ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange(value)}
          disabled={disabled}
          className={`rounded-xl transition-all duration-200 ${currentMode === value ? "bg-primary/15 text-primary border border-primary/30 shadow-glow" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Icon strokeWidth={1.5} className="w-4 h-4 mr-2" />
          {label}
          <span className="ml-1.5 text-xs opacity-70">{minutes}m</span>
        </Button>
      ))}
    </div>
  );
};
