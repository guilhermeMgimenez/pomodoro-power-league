import { Button } from "@/components/ui/button";
import { RotateCcw, Square } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  canStop: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStop: () => void;
  startLabel?: string;
}

export const TimerControls = ({ isRunning, canStop, onStart, onPause, onReset, onStop, startLabel = "Iniciar" }: TimerControlsProps) => (
  <div className="flex w-full min-w-0 items-center gap-3 justify-center">
    {!isRunning ? (
      <Button size="lg" onClick={onStart} className="flex-1 min-w-0 h-16 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow transition-all duration-200">
        {startLabel}
      </Button>
    ) : (
      <Button size="lg" variant="outline" onClick={onPause} className="flex-1 min-w-0 h-16 text-lg font-display font-semibold rounded-2xl">
        Pausar
      </Button>
    )}
    <Button size="lg" variant="outline" onClick={onStop} disabled={!canStop} aria-label="Parar e salvar" title="Parar e salvar o tempo feito" className="h-16 w-16 shrink-0 rounded-2xl">
      <Square strokeWidth={1.5} className="w-5 h-5" />
    </Button>
    <Button size="lg" variant="outline" onClick={onReset} aria-label="Reiniciar" title="Reiniciar sem salvar" className="h-16 w-16 shrink-0 rounded-2xl">
      <RotateCcw strokeWidth={1.5} className="w-5 h-5" />
    </Button>
  </div>
);
