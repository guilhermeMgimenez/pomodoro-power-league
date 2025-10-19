import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const TimerControls = ({ isRunning, onStart, onPause, onReset }: TimerControlsProps) => {
  return (
    <div className="flex items-center gap-4 justify-center">
      {!isRunning ? (
        <Button
          size="lg"
          onClick={onStart}
          className="flex-1 bg-primary text-primary-foreground hover:opacity-90 transition-opacity h-16 text-lg font-bold rounded-2xl"
        >
          Iniciar
        </Button>
      ) : (
        <Button
          size="lg"
          onClick={onPause}
          className="flex-1 bg-secondary text-foreground hover:bg-secondary/80 h-16 text-lg font-bold rounded-2xl"
        >
          Pausar
        </Button>
      )}
    </div>
  );
};
