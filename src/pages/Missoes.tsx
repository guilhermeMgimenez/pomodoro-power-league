import { useEffect, useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Target, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { Goal, DEFAULT_FOCUS_PREFERENCES, useGoals, useUpsertGoal, useDeleteGoal, useTasks, useFocusPreferences, useSaveFocusPreferences, usePeriodFocus } from "@/hooks/useAppData";
import { GoalHorizon, HORIZON_LABELS, goalMinutes, validateMinuteTarget } from "@/lib/goals";
import { taskProgress } from "@/lib/pomodoro";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Missoes = () => {
  const { data: goals = [], isLoading, isError } = useGoals();
  const { data: tasks = [] } = useTasks();
  const { data: preferences = DEFAULT_FOCUS_PREFERENCES } = useFocusPreferences();
  const { data: focus = { daily: 0, weekly: 0 } } = usePeriodFocus();
  const upsert = useUpsertGoal();
  const remove = useDeleteGoal();
  const savePreferences = useSaveFocusPreferences();
  const [editing, setEditing] = useState<Partial<Goal> | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);
  const [form, setForm] = useState({ title: "", horizon: "short" as GoalHorizon, minutes: "100", date: "" });
  const [targets, setTargets] = useState({ daily: "100", weekly: "500" });
  useEffect(() => { setTargets({ daily: String(preferences.daily_minutes), weekly: String(preferences.weekly_minutes) }); }, [preferences]);
  const open = (goal?: Goal) => {
    setEditing(goal ?? {});
    setForm({ title: goal?.title ?? "", horizon: goal?.horizon ?? "short", minutes: String(goal?.target_minutes ?? 100), date: goal?.due_date ?? "" });
  };
  const save = () => {
    if (!form.title.trim()) return toast.error("Dê um nome à meta.");
    if (!validateMinuteTarget(Number(form.minutes))) return toast.error("Informe uma quantidade inteira de minutos maior que zero.");
    upsert.mutate({ id: editing?.id, title: form.title.trim(), horizon: form.horizon, target_minutes: Number(form.minutes), due_date: form.date || null }, {
      onSuccess: () => { setEditing(null); toast.success("Meta salva."); }, onError: () => toast.error("Não foi possível salvar a meta."),
    });
  };
  const saveTargets = () => {
    if (!validateMinuteTarget(Number(targets.daily)) || !validateMinuteTarget(Number(targets.weekly))) return toast.error("Informe metas de minutos inteiros maiores que zero.");
    savePreferences.mutate({ ...preferences, daily_minutes: Number(targets.daily), weekly_minutes: Number(targets.weekly) }, {
      onSuccess: () => toast.success("Metas de foco salvas."), onError: () => toast.error("Não foi possível salvar as metas."),
    });
  };
  return <>
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between gap-3"><h1 className="font-display text-2xl font-semibold">Missões</h1><Button onClick={() => open()}><Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />Nova meta</Button></div>
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Seu ritmo de foco</h2>
          <div className="grid grid-cols-2 gap-5">
            {(["daily", "weekly"] as const).map((period) => <div key={period} className="space-y-3">
              <Label htmlFor={`target-${period}`}>{period === "daily" ? "Meta diária (min)" : "Meta semanal (min)"}</Label>
              <Input id={`target-${period}`} type="number" min="1" step="1" value={targets[period]} onChange={(e) => setTargets({ ...targets, [period]: e.target.value })} />
              <p className="text-sm text-muted-foreground">{focus[period]} / {period === "daily" ? preferences.daily_minutes : preferences.weekly_minutes} min</p>
              <Progress value={taskProgress(focus[period], period === "daily" ? preferences.daily_minutes : preferences.weekly_minutes)} className="h-1.5" />
            </div>)}
          </div>
          <Button variant="outline" disabled={savePreferences.isPending} onClick={saveTargets}>Salvar metas de foco</Button>
        </section>
        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="font-display text-xl font-semibold">Suas metas</h2>
          {isLoading && <p className="text-muted-foreground" role="status">Carregando metas…</p>}
          {isError && <p className="text-destructive" role="alert">Não foi possível carregar suas metas.</p>}
          {!isLoading && !isError && goals.length === 0 && <p className="text-muted-foreground">Nenhuma meta ainda.</p>}
          <ul className="space-y-4">{goals.map((goal) => {
            const minutes = goalMinutes(goal.id, tasks);
            const linked = tasks.filter((task) => task.goal_id === goal.id);
            const progress = taskProgress(minutes, goal.target_minutes);
            return <li key={goal.id} className="night-card p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 mt-1 text-primary shrink-0" strokeWidth={1.5} />
                <div className="min-w-0 flex-1"><h3 className="font-display font-semibold break-words">{goal.title}</h3><p className="text-sm text-muted-foreground">{HORIZON_LABELS[goal.horizon]}{progress >= 100 ? " · Alcançada" : ""}</p></div>
                <Button size="icon" variant="ghost" aria-label={`Editar ${goal.title}`} onClick={() => open(goal)}><Pencil className="w-4 h-4" strokeWidth={1.5} /></Button>
                <Button size="icon" variant="ghost" aria-label={`Excluir ${goal.title}`} onClick={() => setDeleting(goal)}><Trash2 className="w-4 h-4" strokeWidth={1.5} /></Button>
              </div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{minutes}/{goal.target_minutes} min de foco</span><span className="text-primary">{Math.round(progress)}%</span></div>
              <Progress value={progress} className="h-1.5" />
              {goal.due_date && <p className="flex gap-2 items-center text-xs text-muted-foreground"><Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />{new Date(`${goal.due_date}T12:00:00`).toLocaleDateString("pt-BR")}</p>}
              {linked.length > 0 ? <ul className="text-sm text-muted-foreground space-y-1">{linked.map((task) => <li key={task.id} className="flex justify-between gap-3"><Link to="/tarefas" className="truncate hover:text-primary">{task.title}</Link><span className="shrink-0">{task.completed_minutes}/{task.estimated_minutes} min</span></li>)}</ul> : <Link to="/tarefas" className="text-sm text-primary">Vincular uma tarefa</Link>}
            </li>;
          })}</ul>
        </section>
      </div>
    </div>
    <BottomNav />
    <Dialog open={editing !== null} onOpenChange={(v) => { if (!v) setEditing(null); }}>
      <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing?.id ? "Editar meta" : "Nova meta"}</DialogTitle><DialogDescription>Uma direção para suas próximas sessões.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label htmlFor="goal-title">Nome da meta</Label><Input id="goal-title" maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="goal-horizon">Prazo</Label><Select value={form.horizon} onValueChange={(v) => setForm({ ...form, horizon: v as GoalHorizon })}><SelectTrigger id="goal-horizon"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(HORIZON_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="goal-minutes">Minutos de foco</Label><Input id="goal-minutes" type="number" min="1" step="1" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="goal-date">Data limite (opcional)</Label><Input id="goal-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <Button className="w-full" onClick={save} disabled={upsert.isPending}>Salvar meta</Button>
        </div>
      </DialogContent>
    </Dialog>
    <AlertDialog open={deleting !== null} onOpenChange={(v) => { if (!v) setDeleting(null); }}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir meta?</AlertDialogTitle><AlertDialogDescription>As tarefas e os minutos de foco serão mantidos, sem vínculo com esta meta.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction disabled={remove.isPending} onClick={() => { if (deleting) remove.mutate(deleting.id, { onSuccess: () => setDeleting(null), onError: () => toast.error("Não foi possível excluir a meta.") }); }}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
    </AlertDialog>
  </>;
};

export default Missoes;
