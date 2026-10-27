import { useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { Task, useTasks, useUpsertTask, useDeleteTask, useGoals } from "@/hooks/useAppData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { taskProgress } from "@/lib/pomodoro";
import { toast } from "sonner";

const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));

const Tarefas = () => {
  const { data: tasks = [], isLoading } = useTasks();
  const upsert = useUpsertTask();
  const del = useDeleteTask();
  const { data: goals = [] } = useGoals();
  const [editing, setEditing] = useState<Partial<Task> | null>(null);
  const [form, setForm] = useState({ title: "", when: "", estimated: "25", goal: "none" });

  const open = (t?: Task) => {
    setEditing(t ?? {});
    setForm({ title: t?.title ?? "", when: toLocalInput(t?.scheduled_at ?? null), estimated: String(t?.estimated_minutes ?? 25), goal: t?.goal_id ?? "none" });
  };

  const save = () => {
    const est = Number(form.estimated);
    if (!form.title.trim()) return toast.error("Dê um nome à tarefa.");
    if (!(est > 0)) return toast.error("O tempo estimado deve ser maior que zero.");
    upsert.mutate(
      {
        id: editing?.id,
        title: form.title.trim(),
        scheduled_at: form.when ? new Date(form.when).toISOString() : null,
        timezone: localTz,
        estimated_minutes: est,
        goal_id: form.goal === "none" ? null : form.goal,
      },
      { onSuccess: () => setEditing(null), onError: () => toast.error("Não foi possível salvar.") },
    );
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-semibold">Tarefas</h1>
            <Button onClick={() => open()}><Plus strokeWidth={1.5} className="w-4 h-4 mr-1" />Nova tarefa</Button>
          </div>

          {isLoading ? null : tasks.length === 0 ? (
            <p className="night-card p-6 text-muted-foreground">Nenhuma tarefa ainda. Crie a primeira e comece a acender seu céu ✨</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((t) => (
                <li key={t.id} className={`night-card p-5 ${t.done ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <Checkbox
                      aria-label={`Concluir ${t.title}`}
                      checked={t.done}
                      onCheckedChange={(c) => upsert.mutate({ id: t.id, title: t.title, done: !!c })}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-display font-semibold ${t.done ? "line-through" : ""}`}>{t.title}</h3>
                      {t.goal_id && <p className="text-xs text-primary">{goals.find((g) => g.id === t.goal_id)?.title}</p>}
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        {t.scheduled_at && <><Clock strokeWidth={1.5} className="w-3.5 h-3.5" />{fmt(t.scheduled_at)} · </>}
                        {t.completed_minutes}/{t.estimated_minutes} min
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => open(t)}><Pencil strokeWidth={1.5} className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label="Excluir" onClick={() => del.mutate(t.id, { onError: () => toast.error("Não foi possível excluir a tarefa.") })}><Trash2 strokeWidth={1.5} className="w-4 h-4" /></Button>
                  </div>
                  <Progress value={taskProgress(t.completed_minutes, t.estimated_minutes)} className="h-1.5" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <BottomNav />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md bg-popover border-foreground/10 rounded-2xl">
          <DialogHeader><DialogTitle className="font-display">{editing?.id ? "Editar tarefa" : "Nova tarefa"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="t-title">Nome</Label>
              <Input id="t-title" value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="t-when">Data e horário</Label>
                <Input id="t-when" type="datetime-local" value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-est">Tempo estimado (min)</Label>
                <Input id="t-est" type="number" value={form.estimated} onChange={(e) => setForm({ ...form, estimated: e.target.value })} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Fuso: {localTz}</p>
            <div className="space-y-2">
              <Label htmlFor="t-goal">Meta vinculada</Label>
              <Select value={form.goal} onValueChange={(goal) => setForm({ ...form, goal })}>
                <SelectTrigger id="t-goal"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="none">Sem meta</SelectItem>{goals.map((goal) => <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={save} disabled={upsert.isPending}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Tarefas;
