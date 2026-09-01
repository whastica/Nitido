import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="border-border glass-subtle">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
            <Icon className="h-3.5 w-3.5 text-emerald-300" />
          </div>
        </div>
        <p className="font-heading text-2xl font-700 text-foreground">{value}</p>
        {trend && (
          <p className="mt-1 text-[11px] text-muted-foreground">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}
