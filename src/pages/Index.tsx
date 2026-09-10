import { useState } from "react";
import { useTimer, TimerMode } from "@/hooks/useTimer";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { CompletionModal } from "@/components/timer/CompletionModal";
import { CurrentTask } from "@/components/timer/CurrentTask";
import { ModeSelector } from "@/components/timer/ModeSelector";
import { BottomNav } from "@/components/layout/BottomNav";
import { Settings, Star, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  const [streak, setStreak] = useState(5);
  const [dailyScore, setDailyScore] = useState(120);
  const [dailyGoal] = useState({ current: 60, total: 100 });
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  
  // Current task state
  const [currentTask] = useState({
    name: "Estudo de programação Java",
    totalMinutes: 200,
    completedMinutes: 60,
  });

  const handleComplete = () => {
    if (mode === 'focus') {
      const xp = 25;
      const coins = 5;
      setEarnedXP(xp);
      setEarnedCoins(coins);
      setDailyScore(prev => prev + xp);
      setShowCompletionModal(true);
    }
  };

  const { minutes, seconds, progress, isRunning, start, pause, reset } = useTimer({
    initialMinutes: getModeMinutes(mode),
    onComplete: handleComplete,
  });

  const handleModeChange = (newMode: TimerMode) => {
    if (!isRunning) {
      setMode(newMode);
      reset();
    }
  };

  const taskProgress = (currentTask.completedMinutes / currentTask.totalMinutes) * 100;

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-semibold">Foco</h1>
            <button className="p-3 rounded-full bg-card border border-foreground/10 text-muted-foreground hover:text-primary hover:border-primary/30 hover:shadow-glow transition-all duration-200">
              <Settings strokeWidth={1.5} className="w-6 h-6" />
            </button>
          </div>

          {/* Daily Goal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Meta diária</span>
              <div className="text-right">
                <span className="font-display text-2xl font-semibold text-primary">{dailyGoal.current}/{dailyGoal.total}</span>
                <p className="text-sm text-muted-foreground">100 pontos</p>
              </div>
            </div>
            <Progress value={(dailyGoal.current / dailyGoal.total) * 100} className="h-1.5" />
          </div>

          {/* Mode Selector */}
          <div className="flex justify-center">
            <ModeSelector
              currentMode={mode}
              onModeChange={handleModeChange}
              disabled={isRunning}
            />
          </div>

          {/* Timer Display */}
          <div className="flex justify-center py-4">
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

          {/* Current Task */}
          <CurrentTask
            taskName={currentTask.name}
            progress={taskProgress}
            totalMinutes={currentTask.totalMinutes}
            completedMinutes={currentTask.completedMinutes}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="night-card p-6">
              <div className="flex items-center gap-3 mb-2 text-reward">
                <Star strokeWidth={1.5} className="w-6 h-6" />
                <span className="text-sm text-muted-foreground">Pontuação diária</span>
              </div>
              <p className="font-display text-4xl font-bold">{dailyScore}</p>
            </div>
            
            <div className="night-card p-6">
              <div className="flex items-center gap-3 mb-2 text-success">
                <Flame strokeWidth={1.5} className="w-6 h-6" />
                <span className="text-sm text-muted-foreground">Streak</span>
              </div>
              <p className="font-display text-4xl font-bold">{streak} dias</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
      
      <CompletionModal
        open={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        earnedXP={earnedXP}
        earnedCoins={earnedCoins}
      />
    </>
  );
};

export default Index;
