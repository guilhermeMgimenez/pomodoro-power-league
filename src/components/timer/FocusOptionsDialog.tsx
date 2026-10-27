import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FocusPreferences, useSaveFocusPreferences } from "@/hooks/useAppData";
import { toast } from "sonner";

export const FocusOptionsDialog = ({ open, onOpenChange, preferences }: { open: boolean; onOpenChange: (v: boolean) => void; preferences: FocusPreferences }) => {
  const [values, setValues] = useState(preferences);
  const save = useSaveFocusPreferences();
  useEffect(() => { if (open) setValues(preferences); }, [open, preferences]);
  const toggleNotifications = async (enabled: boolean) => {
    if (!enabled) return setValues((v) => ({ ...v, notifications_enabled: false }));
    if (!("Notification" in window)) return toast.error("Este navegador não oferece notificações.");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return toast.error("Notificações não autorizadas. Altere a permissão do site no navegador.");
      setValues((v) => ({ ...v, notifications_enabled: true }));
    } catch { toast.error("Não foi possível ativar notificações."); }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>Alertas de sessão</DialogTitle><DialogDescription>No início e no fim do foco ou da pausa, com o app aberto.</DialogDescription></DialogHeader>
      <div className="flex items-center justify-between gap-4 py-2"><Label htmlFor="session-sound">Som suave</Label><Switch id="session-sound" checked={values.sound_enabled} onCheckedChange={(v) => setValues({ ...values, sound_enabled: v })} /></div>
      <div className="flex items-center justify-between gap-4 py-2"><Label htmlFor="session-notifications">Notificações</Label><Switch id="session-notifications" checked={values.notifications_enabled} onCheckedChange={toggleNotifications} /></div>
      <Button disabled={save.isPending} onClick={() => save.mutate(values, { onSuccess: () => { onOpenChange(false); toast.success("Alertas salvos."); }, onError: () => toast.error("Não foi possível salvar os alertas.") })}>Salvar</Button>
    </DialogContent>
  </Dialog>;
};