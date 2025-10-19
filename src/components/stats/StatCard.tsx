import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
  trend?: {
    value: number;
    label: string;
  };
}

export const StatCard = ({ icon: Icon, label, value, color = "hsl(var(--primary))", trend }: StatCardProps) => {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-muted/50 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4" style={{ color }} />
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1">
              <span className={trend.value >= 0 ? "text-success" : "text-destructive"}>
                {trend.value >= 0 ? "+" : ""}{trend.value}
              </span>{" "}
              {trend.label}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
