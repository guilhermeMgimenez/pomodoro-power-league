import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";

interface CurrentTaskProps {
  taskName: string;
  progress: number;
  totalMinutes: number;
  completedMinutes: number;
}

export const CurrentTask = ({ taskName, progress, totalMinutes, completedMinutes }: CurrentTaskProps) => {
  return (
    <div className="night-card p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{taskName}</h3>
          <p className="text-sm text-muted-foreground">
            {completedMinutes} de {totalMinutes} minutos
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-display font-bold text-primary">{Math.round(progress)}%</span>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
