import { useState } from "react";
import { useTimer, TimerMode } from "@/hooks/useTimer";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { CompletionModal } from "@/components/timer/CompletionModal";
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

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Foco</h1>
            <button className="p-3 rounded-full bg-card hover:bg-secondary transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>

          {/* Daily Goal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Meta diária</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{dailyGoal.current}/{dailyGoal.total}</span>
                <p className="text-sm text-muted-foreground">100 pontos</p>
              </div>
            </div>
            <Progress value={(dailyGoal.current / dailyGoal.total) * 100} className="h-2" />
          </div>

          {/* Timer Display */}
          <div className="flex justify-center py-8">
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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-2 text-neon-orange">
                <Star className="w-6 h-6" />
                <span className="text-sm text-muted-foreground">Pontuação diária</span>
              </div>
              <p className="text-4xl font-black">{dailyScore}</p>
            </div>
            
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-2 text-streak-color">
                <Flame className="w-6 h-6" />
                <span className="text-sm text-muted-foreground">Streak</span>
              </div>
              <p className="text-4xl font-black">{streak} dias</p>
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
