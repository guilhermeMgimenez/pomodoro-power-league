import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FocusPreferences, useSaveFocusPreferences, useSaveSettings } from "@/hooks/useAppData";
import { PomodoroSettings, validateSettings } from "@/lib/pomodoro";
import { useGlobalTimer } from "@/contexts/TimerContext";
import { toast } from "sonner";

export const FocusOptionsDialog = ({ open, onOpenChange, preferences }: { open: boolean; onOpenChange: (v: boolean) => void; preferences: FocusPreferences }) => {
  const timer = useGlobalTimer();
  const [values, setValues] = useState(preferences);
  const [times, setTimes] = useState({ f: "", s: "", l: "" });
  const save = useSaveFocusPreferences();
  const saveSettings = useSaveSettings();
  useEffect(() => {
    if (!open) return;
    setValues(preferences);
    setTimes({ f: String(timer.settings.focus_minutes), s: String(timer.settings.short_break_minutes), l: String(timer.settings.long_break_minutes) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preferences]);
  const toggleNotifications = async (enabled: boolean) => {
    if (!enabled) return setValues((v) => ({ ...v, notifications_enabled: false }));
    if (!("Notification" in window)) return toast.error("Este navegador não oferece notificações.");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return toast.error("Notificações não autorizadas. Altere a permissão do site no navegador.");
      setValues((v) => ({ ...v, notifications_enabled: true }));
    } catch { toast.error("Não foi possível ativar notificações."); }
  };
  const submit = async () => {
    const s: PomodoroSettings = { focus_minutes: Number(times.f), short_break_minutes: Number(times.s), long_break_minutes: Number(times.l) };
    const err = validateSettings(s);
    if (err) return toast.error(err);
    try {
      await Promise.all([saveSettings.mutateAsync(s), save.mutateAsync(values)]);
      onOpenChange(false);
      toast.success("Configurações salvas.");
    } catch { toast.error("Não foi possível salvar as configurações."); }
  };
  const field = (id: "f" | "s" | "l", label: string) => (
    <div className="space-y-2 min-w-0">
      <Label htmlFor={`cfg-${id}`}>{label}</Label>
      <Input id={`cfg-${id}`} type="number" inputMode="numeric" min="1" value={times[id]} onChange={(e) => setTimes({ ...times, [id]: e.target.value })} className="h-11" />
    </div>
  );
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)]">
      <DialogHeader><DialogTitle>Configurações</DialogTitle><DialogDescription>Tempos do ciclo (em minutos), áudio e alertas.</DialogDescription></DialogHeader>
      <div className="grid grid-cols-3 gap-3">
        {field("f", "Foco")}
        {field("s", "Pausa curta")}
        {field("l", "Pausa longa")}
      </div>
      {timer.isRunning && <p className="text-xs text-muted-foreground">Novos tempos valem a partir da próxima sessão.</p>}
      <div className="flex items-center justify-between gap-4 py-2"><Label htmlFor="session-music">Música lo-fi durante o foco</Label><Switch id="session-music" checked={timer.musicOn} onCheckedChange={timer.setMusicOn} /></div>
      <div className="flex items-center justify-between gap-4 py-2"><Label htmlFor="session-sound">Som ao iniciar</Label><Switch id="session-sound" checked={values.sound_enabled} onCheckedChange={(v) => setValues({ ...values, sound_enabled: v })} /></div>
      <div className="flex items-center justify-between gap-4 py-2"><Label htmlFor="session-notifications">Notificações</Label><Switch id="session-notifications" checked={values.notifications_enabled} onCheckedChange={toggleNotifications} /></div>
      <Button disabled={save.isPending || saveSettings.isPending} onClick={submit}>Salvar</Button>
    </DialogContent>
  </Dialog>;
};
