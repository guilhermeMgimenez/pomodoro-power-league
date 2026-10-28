import { BottomNav } from "@/components/layout/BottomNav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Moon, Flame, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllFocusSessions, useProfile } from "@/hooks/useAppData";
import { constellation, MOON_PHASES, moonPhase, stardust } from "@/lib/gamification";

const Perfil = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: sessions = [], isPending } = useAllFocusSessions();
  const name = profile?.display_name || user?.email?.split("@")[0] || "Você";
  const since = user?.created_at
    ? new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(new Date(user.created_at))
    : "";
  const points = stardust(sessions);
  const streak = constellation(sessions);
  const phase = moonPhase(points);
  const current = MOON_PHASES[phase.index].min;
  const nextMin = MOON_PHASES[phase.index + 1]?.min;
  const phaseProgress = nextMin ? ((points - current) / (nextMin - current)) * 100 : 100;
  const recent = sessions.slice(0, 5);

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 border-2 border-primary/40 shadow-glow">
              <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h1 className="font-display text-2xl font-semibold">{name}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              {since && <p className="text-xs text-muted-foreground">Membro desde {since}</p>}
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut strokeWidth={1.5} className="w-4 h-4 mr-2" />Sair
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="night-card p-4 text-center">
              <Sparkles strokeWidth={1.5} className="w-8 h-8 text-reward mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-reward">{points}</p>
              <p className="text-xs text-muted-foreground">Stardust</p>
            </div>
            <div className="night-card p-4 text-center">
              <Flame strokeWidth={1.5} className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-success">{streak}</p>
              <p className="text-xs text-muted-foreground">Dias de constelação</p>
            </div>
            <div className="night-card p-4 text-center">
              <Moon strokeWidth={1.5} className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-primary">{phase.name}</p>
              <p className="text-xs text-muted-foreground">Fase da lua</p>
            </div>
          </div>

          <div className="night-card p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fase {phase.name}</span>
              <span className="inline-flex items-center gap-1">{phase.next ? <><Sparkles strokeWidth={1.5} className="w-3.5 h-3.5 text-reward" />{phase.toNext} até {phase.next}</> : <><Moon strokeWidth={1.5} className="w-3.5 h-3.5 text-primary" />Fase máxima alcançada</>}</span>
            </div>
            <Progress value={phaseProgress} className="h-1.5" />
          </div>

          <div className="night-card p-6">
            <h2 className="font-display font-semibold mb-4">Atividade recente</h2>
            {isPending ? <p className="text-sm text-muted-foreground">Carregando…</p>
              : recent.length === 0 ? <p className="text-sm text-muted-foreground">Conclua seu primeiro foco para acender uma estrela.</p>
              : <ul className="space-y-3 text-sm text-muted-foreground">
                  {recent.map((s, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span className="inline-flex items-center gap-1">Foco de {s.minutes} min · +{s.minutes}<Sparkles strokeWidth={1.5} className="w-3.5 h-3.5 text-reward" /></span>
                      <span>{new Date(s.completed_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </li>
                  ))}
                </ul>}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Perfil;
