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
    <div className="flex items-center gap-3 justify-center">
      {!isRunning ? (
        <Button
          size="lg"
          onClick={onStart}
          className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity px-8 h-12 text-base font-semibold"
        >
          <Play className="w-5 h-5 mr-2" />
          Iniciar
        </Button>
      ) : (
        <Button
          size="lg"
          onClick={onPause}
          variant="secondary"
          className="px-8 h-12 text-base font-semibold"
        >
          <Pause className="w-5 h-5 mr-2" />
          Pausar
        </Button>
      )}
      <Button
        size="lg"
        onClick={onReset}
        variant="outline"
        className="h-12 px-6"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>
    </div>
  );
};
