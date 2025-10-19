import { useState } from "react";
import { useTimer, TimerMode } from "@/hooks/useTimer";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { ModeSelector } from "@/components/timer/ModeSelector";
import { StatCard } from "@/components/stats/StatCard";
import { Flame, Zap, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const getModeMinutes = (mode: TimerMode): number => {
  switch (mode) {
    case 'focus':
      return 25;
    case 'short-break':
      return 5;
    case 'long-break':
      return 15;
  }
};

const Index = () => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [streak, setStreak] = useState(7);
  const [xp, setXp] = useState(1247);
  const [coins, setCoins] = useState(89);
  const { toast } = useToast();

  const handleComplete = () => {
    if (mode === 'focus') {
      const earnedXP = 25;
      const earnedCoins = 5;
      setXp(prev => prev + earnedXP);
      setCoins(prev => prev + earnedCoins);
      
      toast({
        title: "Sessão Concluída! 🎉",
        description: `+${earnedXP} XP e +${earnedCoins} moedas`,
      });
    } else {
      toast({
        title: "Pausa Concluída! ☕",
        description: "Hora de voltar ao foco!",
      });
    }
  };

  const { minutes, seconds, progress, isRunning, start, pause, reset } = useTimer({
    initialMinutes: getModeMinutes(mode),
    onComplete: handleComplete,
  });

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    reset();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={Flame}
            label="Streak"
            value={streak}
            color="hsl(var(--streak))"
            trend={{ value: 2, label: "dias" }}
          />
          <StatCard
            icon={Zap}
            label="XP Total"
            value={xp}
            color="hsl(var(--xp))"
            trend={{ value: 125, label: "hoje" }}
          />
          <StatCard
            icon={Coins}
            label="Moedas"
            value={coins}
            color="hsl(var(--coin))"
            trend={{ value: 12, label: "hoje" }}
          />
        </div>

        {/* Timer Card */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-muted/50 p-8 space-y-8">
          {/* Mode Selector */}
          <div className="flex justify-center">
            <ModeSelector
              currentMode={mode}
              onModeChange={handleModeChange}
              disabled={isRunning}
            />
          </div>

          {/* Timer Display */}
          <div className="flex justify-center">
            <TimerDisplay
              minutes={minutes}
              seconds={seconds}
              progress={progress}
              mode={mode}
            />
          </div>

          {/* Controls */}
          <TimerControls
            isRunning={isRunning}
            onStart={start}
            onPause={pause}
            onReset={reset}
          />

          {/* Focus Tip */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'focus' 
                ? "💡 Elimine distrações e mantenha o foco em uma única tarefa"
                : "☕ Aproveite para descansar e recarregar as energias"}
            </p>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-muted/30 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Meta Diária</h3>
            <span className="text-sm text-muted-foreground">2/3 sessões</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className="gradient-success h-full transition-all duration-500"
              style={{ width: '66%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
