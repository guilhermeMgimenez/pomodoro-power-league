import { FormEvent, useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Check, UserPlus, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFriendActions, useFriendRequests, useLeaderboard } from "@/hooks/useAppData";
import { rankLeaderboard } from "@/lib/gamification";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
  sent: "Convite enviado ✨",
  not_found: "Nenhuma conta encontrada com esse e-mail.",
  self: "Esse é o seu próprio e-mail.",
  exists: "Vocês já têm um convite ou amizade.",
};

const Amigos = () => {
  const leaderboard = useLeaderboard();
  const requests = useFriendRequests();
  const { send, accept, remove } = useFriendActions();
  const [email, setEmail] = useState("");
  const ranked = rankLeaderboard(leaderboard.data ?? []);
  const incoming = (requests.data ?? []).filter((r) => r.status === "pending" && r.incoming);
  const outgoing = (requests.data ?? []).filter((r) => r.status === "pending" && !r.incoming);
  const friends = (requests.data ?? []).filter((r) => r.status === "accepted");

  const invite = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    send.mutate(email, {
      onSuccess: (r) => { (r === "sent" ? toast.success : toast)(MESSAGES[r] ?? "Pronto."); if (r === "sent") setEmail(""); },
      onError: () => toast.error("Não foi possível enviar o convite."),
    });
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-semibold">Céu Coletivo</h1>
            <p className="text-sm text-muted-foreground mt-1">Stardust da semana entre você e seus amigos.</p>
          </div>

          <Tabs defaultValue="ranking">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="ranking">Ranking semanal</TabsTrigger>
              <TabsTrigger value="amigos">Amigos{incoming.length > 0 && ` (${incoming.length})`}</TabsTrigger>
            </TabsList>

            <TabsContent value="ranking" className="space-y-3 pt-4">
              {leaderboard.isPending && <p className="text-muted-foreground">Carregando…</p>}
              {leaderboard.isError && <p className="text-destructive">Não foi possível carregar o ranking.</p>}
              {ranked.map((u) => (
                <div key={u.user_id} className={`night-card p-5 ${u.is_me ? "border-primary/40 shadow-glow" : ""}`}>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-2xl font-semibold text-muted-foreground w-8">{u.rank}</span>
                    <Avatar className="w-12 h-12 border border-primary/40">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">{(u.display_name || "?").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{u.is_me ? "Você" : u.display_name}</h3>
                      <p className="text-sm text-muted-foreground">{u.stardust} ✨ Stardust</p>
                    </div>
                  </div>
                </div>
              ))}
              {ranked.length === 1 && <p className="text-sm text-muted-foreground">Convide amigos na aba Amigos para dividir o céu.</p>}
            </TabsContent>

            <TabsContent value="amigos" className="space-y-6 pt-4">
              <form onSubmit={invite} className="flex gap-2">
                <Input type="email" placeholder="E-mail do amigo" aria-label="E-mail do amigo" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button type="submit" disabled={send.isPending}><UserPlus strokeWidth={1.5} className="w-4 h-4 mr-2" />Convidar</Button>
              </form>

              {incoming.length > 0 && <section className="space-y-2">
                <h2 className="font-display font-semibold">Convites recebidos</h2>
                {incoming.map((r) => (
                  <div key={r.id} className="night-card p-4 flex items-center gap-3">
                    <span className="flex-1 truncate">{r.other_name}</span>
                    <Button size="sm" onClick={() => accept.mutate(r.id)} aria-label={`Aceitar ${r.other_name}`}><Check className="w-4 h-4 mr-1" />Aceitar</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove.mutate(r.id)} aria-label={`Recusar ${r.other_name}`}><X className="w-4 h-4" /></Button>
                  </div>
                ))}
              </section>}

              <section className="space-y-2">
                <h2 className="font-display font-semibold">Seus amigos</h2>
                {friends.length === 0 && <p className="text-sm text-muted-foreground">Nenhum amigo ainda.</p>}
                {friends.map((r) => (
                  <div key={r.id} className="night-card p-4 flex items-center gap-3">
                    <span className="flex-1 truncate">{r.other_name}</span>
                    <Button size="sm" variant="ghost" onClick={() => remove.mutate(r.id)}>Remover</Button>
                  </div>
                ))}
              </section>

              {outgoing.length > 0 && <section className="space-y-2">
                <h2 className="font-display font-semibold">Aguardando resposta</h2>
                {outgoing.map((r) => (
                  <div key={r.id} className="night-card p-4 flex items-center gap-3 text-muted-foreground">
                    <span className="flex-1 truncate">{r.other_name}</span>
                    <Button size="sm" variant="ghost" onClick={() => remove.mutate(r.id)}>Cancelar</Button>
                  </div>
                ))}
              </section>}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Amigos;
