import { Button } from "@/components/ui/button";

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
          className="flex-1 h-16 text-lg font-display font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow transition-all duration-200"
        >
          Iniciar
        </Button>
      ) : (
        <Button
          size="lg"
          variant="outline"
          onClick={onPause}
          className="flex-1 h-16 text-lg font-display font-semibold rounded-2xl"
        >
          Pausar
        </Button>
      )}
    </div>
  );
};
