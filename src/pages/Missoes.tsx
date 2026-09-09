import { BottomNav } from "@/components/layout/BottomNav";
import { Target, Calendar, Trophy } from "lucide-react";

const Missoes = () => {
  const missions = [
    { id: 1, title: "Complete 3 sessões", progress: 2, total: 3, xp: 50, type: "daily" },
    { id: 2, title: "Mantenha o streak por 7 dias", progress: 5, total: 7, xp: 100, type: "weekly" },
    { id: 3, title: "Acumule 150 minutos focados", progress: 120, total: 150, xp: 75, type: "weekly" },
  ];

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <h1 className="text-2xl font-bold">Missões</h1>

          <div className="space-y-4">
            {missions.map((mission) => (
              <div key={mission.id} className="night-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {mission.type === "daily" ? (
                        <Calendar className="w-5 h-5 text-primary" />
                      ) : (
                        <Trophy className="w-5 h-5 text-accent" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{mission.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {mission.progress}/{mission.total}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">+{mission.xp} XP</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Missoes;
