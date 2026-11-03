import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { statusForMode, taskProgress } from "@/lib/pomodoro";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { CurrentTask } from "@/components/timer/CurrentTask";
import { ModeSelector } from "@/components/timer/ModeSelector";
import { BottomNav } from "@/components/layout/BottomNav";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Star, Flame, Maximize, Minimize, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FocusOptionsDialog } from "@/components/timer/FocusOptionsDialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useTasks,
  usePeriodFocus,
  useFocusPreferences,
  DEFAULT_FOCUS_PREFERENCES,
  useAllFocusSessions,
} from "@/hooks/useAppData";
import { useGlobalTimer } from "@/contexts/TimerContext";
import { toast } from "sonner";
import { constellation } from "@/lib/gamification";

const Index = () => {
  const { data: tasks = [] } = useTasks();
  const { data: periodFocus } = usePeriodFocus();
  const todayMinutes = periodFocus?.daily ?? 0;
  const { data: preferences = DEFAULT_FOCUS_PREFERENCES } = useFocusPreferences();
  const dailyGoal = preferences.daily_minutes;
  const { data: allSessions = [] } = useAllFocusSessions();
  const streak = constellation(allSessions);
  const t = useGlobalTimer();

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [zen, setZen] = useState(false);
  const zenElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setZen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZen(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleZen = async () => {
    if (zen) {
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
      setZen(false);
    } else {
      setZen(true);
      await zenElement.current?.requestFullscreen?.().catch(() => toast("Modo zen ativado sem tela cheia."));
    }
  };

  const openTasks = tasks.filter((x) => !x.done);
  useEffect(() => {
    if (!t.taskId && openTasks[0]) t.setTaskId(openTasks[0].id);
  }, [openTasks, t]);
  const currentTask = tasks.find((x) => x.id === t.taskId) ?? null;

  return (
    <>
      <div
        ref={zenElement}
        className={
          zen
            ? "fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-background"
            : "min-h-screen w-full overflow-x-hidden bg-background pb-24"
        }
      >
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <BrandLogo decorative className="w-10 h-12 rounded-md shrink-0" />
              <h1 className="font-display text-2xl font-semibold truncate">Focus Time</h1>
            </div>
            <div className="flex gap-2 shrink-0">
              {!zen && (
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Configurações"
                  title="Configurações"
                  onClick={() => setOptionsOpen(true)}
                >
                  <Settings2 strokeWidth={1.5} className="w-5 h-5" />
                </Button>
              )}
              <Button variant="outline" onClick={toggleZen} aria-label={zen ? "Sair do modo zen" : "Modo zen"}>
                {zen ? <Minimize className="w-4 h-4 sm:mr-2" /> : <Maximize className="w-4 h-4 sm:mr-2" />}
                <span className="hidden sm:inline">{zen ? "Sair" : "Modo zen"}</span>
              </Button>
            </div>
          </div>

          {!zen && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Meta diária</span>
                <div className="text-right">
                  <span className="font-display text-2xl font-semibold text-primary">
                    {todayMinutes}/{dailyGoal}
                  </span>
                  <p className="text-sm text-muted-foreground">minutos de foco</p>
                </div>
              </div>
              <Progress value={taskProgress(todayMinutes, dailyGoal)} className="h-1.5" />
            </div>
          )}

          <div className="flex justify-center">
            <ModeSelector currentMode={t.mode} onModeChange={t.setMode} settings={t.settings} disabled={t.isRunning} />
          </div>

          <div className="flex justify-center py-4">
            <TimerDisplay
              minutes={t.minutes}
              seconds={t.seconds}
              progress={t.progress}
              mode={t.mode}
              status={
                t.isRunning ? statusForMode(t.mode) : t.isCompleted ? "Concluído" : t.isFresh ? "Pronto" : "Pausado"
              }
            />
          </div>

          <TimerControls
            isRunning={t.isRunning}
            canStop={!t.isFresh && !t.isCompleted}
            onStart={t.start}
            onPause={t.pause}
            onReset={t.reset}
            onStop={t.stop}
            startLabel={t.isFresh || t.isCompleted ? "Iniciar" : "Continuar"}
          />

          {openTasks.length > 0 ? (
            <div className="space-y-3">
              <Select value={t.taskId ?? undefined} onValueChange={t.setTaskId} disabled={t.isRunning}>
                <SelectTrigger aria-label="Tarefa atual" className="h-11">
                  <SelectValue placeholder="Escolha a tarefa" />
                </SelectTrigger>
                <SelectContent>
                  {openTasks.map((x) => (
                    <SelectItem key={x.id} value={x.id}>
                      {x.title}
                    </SelectItem>
                  ))}
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
              Nenhuma tarefa aberta.{" "}
              <Link to="/tarefas" className="text-primary font-semibold">
                Criar uma tarefa
              </Link>
            </div>
          )}

          {!zen && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="night-card p-4 sm:p-6 min-w-0">
                <div className="flex items-center gap-2 mb-2 text-reward">
                  <Star strokeWidth={1.5} className="w-5 h-5 shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">Stardust hoje</span>
                </div>
                <p className="font-display text-3xl sm:text-4xl font-bold">{todayMinutes}</p>
              </div>
              <div className="night-card p-4 sm:p-6 min-w-0">
                <div className="flex items-center gap-2 mb-2 text-success">
                  <Flame strokeWidth={1.5} className="w-5 h-5 shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">Constelação</span>
                </div>
                <p className="font-display text-3xl sm:text-4xl font-bold">
                  {streak} {streak === 1 ? "dia" : "dias"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {!zen && <BottomNav />}
      <FocusOptionsDialog open={optionsOpen} onOpenChange={setOptionsOpen} preferences={preferences} />
    </>
  );
};

export default Index;
