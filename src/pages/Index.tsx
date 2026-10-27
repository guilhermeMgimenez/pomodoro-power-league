import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTimer } from "@/hooks/useTimer";
import { TimerMode, PomodoroSettings, DEFAULT_SETTINGS, minutesForMode, statusForMode, taskProgress } from "@/lib/pomodoro";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { CompletionModal } from "@/components/timer/CompletionModal";
import { CurrentTask } from "@/components/timer/CurrentTask";
import { ModeSelector } from "@/components/timer/ModeSelector";
import { CycleDialog } from "@/components/timer/CycleDialog";
import { BottomNav } from "@/components/layout/BottomNav";
import { Star, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings, useSaveSettings, useTasks, useRecordSession, useTodayFocusMinutes } from "@/hooks/useAppData";
import { toast } from "sonner";

const DAILY_GOAL = 100;

const Index = () => {
  const { data: savedSettings } = useSettings();
  const saveSettings = useSaveSettings();
  const { data: tasks = [] } = useTasks();
  const { data: todayMinutes = 0 } = useTodayFocusMinutes();
  const recordSession = useRecordSession();

  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [cycleOpen, setCycleOpen] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  useEffect(() => { if (savedSettings) setSettings(savedSettings); }, [savedSettings]);

  const openTasks = tasks.filter((t) => !t.done);
  useEffect(() => {
    if (!taskId && openTasks[0]) setTaskId(openTasks[0].id);
  }, [openTasks, taskId]);
  const currentTask = tasks.find((t) => t.id === taskId) ?? null;

  const handleComplete = () => {
    const minutes = minutesForMode(mode, settings);
    recordSession.mutate(
      { taskId: mode === "focus" ? taskId : null, minutes, mode },
      { onError: () => toast.error("Não foi possível salvar a sessão.") },
    );
    if (mode === "focus") {
      setEarnedXP(minutes);
      setShowCompletionModal(true);
    }
  };

  const { minutes, seconds, progress, isRunning, isFresh, start, startWith, pause, reset } = useTimer({
    initialMinutes: minutesForMode(mode, settings),
    onComplete: handleComplete,
  });

  const handleStart = () => {
    if (mode === "focus" && isFresh) setCycleOpen(true);
    else start();
  };

  const handleCycleStart = (s: PomodoroSettings) => {
    setSettings(s);
    setMode("focus");
    setCycleOpen(false);
    startWith(s.focus_minutes);
    saveSettings.mutate(s);
  };

  const handleModeChange = (newMode: TimerMode) => {
    if (!isRunning) setMode(newMode);
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <h1 className="font-display text-2xl font-semibold">Foco</h1>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Meta diária</span>
              <div className="text-right">
                <span className="font-display text-2xl font-semibold text-primary">{Math.min(todayMinutes, DAILY_GOAL)}/{DAILY_GOAL}</span>
                <p className="text-sm text-muted-foreground">minutos de foco</p>
              </div>
            </div>
            <Progress value={Math.min(100, (todayMinutes / DAILY_GOAL) * 100)} className="h-1.5" />
          </div>

          <div className="flex justify-center">
            <ModeSelector currentMode={mode} onModeChange={handleModeChange} settings={settings} disabled={isRunning} />
          </div>

          <div className="flex justify-center py-4">
            <TimerDisplay
              minutes={minutes}
              seconds={seconds}
              progress={progress}
              mode={mode}
              status={isRunning ? statusForMode(mode) : isFresh ? "Pronto" : "Pausado"}
            />
          </div>

          <TimerControls isRunning={isRunning} onStart={handleStart} onPause={pause} onReset={reset} startLabel={isFresh ? "Iniciar" : "Continuar"} />

          {openTasks.length > 0 ? (
            <div className="space-y-3">
              <Select value={taskId ?? undefined} onValueChange={setTaskId} disabled={isRunning}>
                <SelectTrigger aria-label="Tarefa atual" className="h-11"><SelectValue placeholder="Escolha a tarefa" /></SelectTrigger>
                <SelectContent>
                  {openTasks.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                </SelectContent>
              </Select>
              {currentTask && (
                <CurrentTask
                  taskName={currentTask.title}
                  progress={taskProgress(currentTask.completed_minutes, currentTask.estimated_minutes)}
                  totalMinutes={currentTask.estimated_minutes}
                  completedMinutes={currentTask.completed_minutes}
                />
              )}
            </div>
          ) : (
            <div className="night-card p-5 text-sm text-muted-foreground">
              Nenhuma tarefa aberta. <Link to="/tarefas" className="text-primary font-semibold">Criar uma tarefa</Link>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="night-card p-6">
              <div className="flex items-center gap-3 mb-2 text-reward">
                <Star strokeWidth={1.5} className="w-6 h-6" />
                <span className="text-sm text-muted-foreground">Pontuação diária</span>
              </div>
              <p className="font-display text-4xl font-bold">{todayMinutes}</p>
            </div>
            <div className="night-card p-6">
              <div className="flex items-center gap-3 mb-2 text-success">
                <Flame strokeWidth={1.5} className="w-6 h-6" />
                <span className="text-sm text-muted-foreground">Streak</span>
              </div>
              <p className="font-display text-4xl font-bold">5 dias</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />

      <CycleDialog open={cycleOpen} initial={settings} onOpenChange={setCycleOpen} onStart={handleCycleStart} />
      <CompletionModal open={showCompletionModal} onClose={() => setShowCompletionModal(false)} earnedXP={earnedXP} earnedCoins={Math.round(earnedXP / 5)} />
    </>
  );
};

export default Index;
