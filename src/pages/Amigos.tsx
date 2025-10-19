import { BottomNav } from "@/components/layout/BottomNav";
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const Amigos = () => {
  const navigate = useNavigate();
  
  const leaderboard = [
    { id: 1, name: "Você", xp: 1250, rank: 1, change: 1, isUser: true },
    { id: 2, name: "Lucas", xp: 1180, rank: 2, change: -1 },
    { id: 3, name: "Sofia", xp: 1120, rank: 3, change: 0 },
    { id: 4, name: "Mateus", xp: 1050, rank: 4, change: 2 },
    { id: 5, name: "Isabela", xp: 980, rank: 5, change: -1 },
    { id: 6, name: "Gabriel", xp: 920, rank: 6, change: 0 },
    { id: 7, name: "Laura", xp: 850, rank: 7, change: 0 },
  ];

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-border">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Placar de Amigos</h1>
            <div className="w-6" />
          </div>

          <Tabs defaultValue="amigos" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-transparent border-b border-border rounded-none h-auto p-0">
              <TabsTrigger
                value="ranking"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Ranking Semanal
              </TabsTrigger>
              <TabsTrigger
                value="amigos"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent"
              >
                Amigos
              </TabsTrigger>
              <TabsTrigger
                value="placar"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Placar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="amigos" className="px-6 py-4 space-y-3">
              {leaderboard.map((user) => (
                <div
                  key={user.id}
                  className={`rounded-2xl p-5 transition-all ${
                    user.isUser
                      ? "bg-card border-2 border-primary neon-glow"
                      : "bg-card border border-border"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground w-8">
                      {user.rank}
                    </span>
                    
                    <Avatar className="w-14 h-14 border-2 border-primary">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.xp} XP</p>
                    </div>
                    
                    {user.change !== 0 && (
                      <div className={`flex items-center gap-1 ${user.change > 0 ? "text-primary" : "text-destructive"}`}>
                        {user.change > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-bold">{Math.abs(user.change)}</span>
                      </div>
                    )}
                    {user.change === 0 && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="ranking" className="px-6 py-4">
              <p className="text-center text-muted-foreground">Ranking semanal</p>
            </TabsContent>

            <TabsContent value="placar" className="px-6 py-4">
              <p className="text-center text-muted-foreground">Placar geral</p>
            </TabsContent>
          </Tabs>

          {/* FAB */}
          <Button
            size="icon"
            className="fixed bottom-28 right-6 w-16 h-16 rounded-full bg-accent hover:bg-accent/90 shadow-xl cyan-glow"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Amigos;
