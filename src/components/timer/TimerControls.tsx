import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  startLabel?: string;
}

export const TimerControls = ({ isRunning, onStart, onPause, onReset, startLabel = "Iniciar" }: TimerControlsProps) => (
  <div className="flex items-center gap-3 justify-center">
    {!isRunning ? (
      <Button size="lg" onClick={onStart} className="flex-1 h-16 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow transition-all duration-200">
        {startLabel}
      </Button>
    ) : (
      <Button size="lg" variant="outline" onClick={onPause} className="flex-1 h-16 text-lg font-display font-semibold rounded-2xl">
        Pausar
      </Button>
    )}
    <Button size="lg" variant="outline" onClick={onReset} aria-label="Reiniciar" className="h-16 w-16 rounded-2xl">
      <RotateCcw strokeWidth={1.5} className="w-5 h-5" />
    </Button>
  </div>
);
