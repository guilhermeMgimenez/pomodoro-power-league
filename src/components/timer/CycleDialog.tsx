import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_SETTINGS, PomodoroSettings, validateSettings } from "@/lib/pomodoro";

interface Props {
  open: boolean;
  initial: PomodoroSettings;
  onOpenChange: (o: boolean) => void;
  onStart: (s: PomodoroSettings) => void;
}

export const CycleDialog = ({ open, initial, onOpenChange, onStart }: Props) => {
  const [v, setV] = useState({ f: "", s: "", l: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setV({ f: String(initial.focus_minutes), s: String(initial.short_break_minutes), l: String(initial.long_break_minutes) });
      setError(null);
    }
  }, [open, initial]);

  const submit = () => {
    const s = { focus_minutes: Number(v.f), short_break_minutes: Number(v.s), long_break_minutes: Number(v.l) };
    const err = validateSettings(s);
    if (err) return setError(err);
    onStart(s);
  };

  const field = (id: "f" | "s" | "l", label: string) => (
    <div className="space-y-2">
      <Label htmlFor={`cycle-${id}`}>{label}</Label>
      <Input id={`cycle-${id}`} type="number" inputMode="numeric" value={v[id]} onChange={(e) => setV({ ...v, [id]: e.target.value })} className="h-11" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-popover border-foreground/10 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Novo ciclo Pomodoro</DialogTitle>
          <DialogDescription>Defina os tempos em minutos.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3">
          {field("f", "Foco")}
          {field("s", "Pausa curta")}
          {field("l", "Pausa longa")}
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onStart(DEFAULT_SETTINGS)}>Início Rápido</Button>
          <Button className="flex-1" onClick={submit}>Iniciar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
