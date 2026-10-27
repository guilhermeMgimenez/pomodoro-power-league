import { BottomNav } from "@/components/layout/BottomNav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Zap, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useAppData";

const Perfil = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const name = profile?.display_name || user?.email?.split("@")[0] || "Você";
  const since = user?.created_at
    ? new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(new Date(user.created_at))
    : "";
  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          {/* Profile Header */}
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

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="night-card p-4 text-center">
              <Zap strokeWidth={1.5} className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-primary">1250</p>
              <p className="text-xs text-muted-foreground">XP Total</p>
            </div>
            <div className="night-card p-4 text-center">
              <Flame strokeWidth={1.5} className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-success">5</p>
              <p className="text-xs text-muted-foreground">Dias streak</p>
            </div>
            <div className="night-card p-4 text-center">
              <Trophy strokeWidth={1.5} className="w-8 h-8 text-reward mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-reward">12</p>
              <p className="text-xs text-muted-foreground">Conquistas</p>
            </div>
          </div>

          {/* Activity */}
          <div className="night-card p-6">
            <h2 className="font-display font-semibold mb-4">Atividade Recente</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>🎯 Completou 3 sessões hoje</p>
              <p>🔥 Manteve streak de 5 dias</p>
              <p>⭐ Ganhou 125 XP hoje</p>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Perfil;
