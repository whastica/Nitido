"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FileText, Clock, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { DashboardStatsSkeleton } from "@/components/shared/Skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { DashboardData } from "@/types";

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Error fetching dashboard");
  const { data } = await res.json();
  return data;
}

const SCORE_STYLES: Record<"high" | "medium" | "low", string> = {
  high: "bg-green-500/10 text-green-400 border-green-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-red-500/10 text-red-400 border-red-500/20",
};

function getScoreStyle(score: number): string {
  if (score >= 80) return SCORE_STYLES.high;
  if (score >= 60) return SCORE_STYLES.medium;
  return SCORE_STYLES.low;
}

function ActivityChart({ data }: { data: DashboardData["activityByDay"] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <p className="text-[10px] font-700 uppercase tracking-widest text-muted-foreground mb-4">
        Actividad reciente
      </p>
      <div className="flex items-end gap-2 h-36">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-medium">
              {d.count > 0 ? d.count : ""}
            </span>
            <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
              <div
                className={cn(
                  "w-full max-w-[32px] rounded-t-md transition-all duration-300",
                  d.count > 0
                    ? "bg-brand-500/80 hover:bg-brand-500"
                    : "bg-muted/30"
                )}
                style={{
                  height: d.count > 0 ? `${Math.max((d.count / max) * 100, 8)}%` : "4px",
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentPromptCard({ prompt }: { prompt: DashboardData["recentPrompts"][0] }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-3 transition-all hover:border-brand-500/20 hover:bg-card/60">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground truncate">{prompt.inputText}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formatRelativeTime(prompt.createdAt)}
        </p>
      </div>
      <Badge
        variant="outline"
        className={cn(
          "text-[9px] px-2 py-0 font-700 border flex-shrink-0",
          getScoreStyle(prompt.qualityScore)
        )}
      >
        {prompt.qualityScore}
      </Badge>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bienvenido a Nitido
          </p>
        </div>
        <DashboardStatsSkeleton />
      </div>
    );
  }

  const stats = [
    {
      label: "Prompts generados",
      value: data?.totalPrompts ?? 0,
      icon: FileText,
      trend: "Total histórico",
    },
    {
      label: "Tiempo ahorrado",
      value: `${data?.timeSaved ?? 0} min`,
      icon: Clock,
      trend: "Estimado",
    },
    {
      label: "Calidad promedio",
      value: data?.avgQuality ? `${data.avgQuality}/100` : "--",
      icon: TrendingUp,
      trend: "Puntuación media",
    },
    {
      label: "Tokens totales",
      value: (data?.totalTokens ?? 0).toLocaleString(),
      icon: Calendar,
      trend: "Consumo acumulado",
    },
  ];

  const recentPrompts = data?.recentPrompts ?? [];
  const activityByDay = data?.activityByDay ?? [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bienvenido a Nitido
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Activity chart */}
        <div className="lg:col-span-3">
          {activityByDay.length > 0 && <ActivityChart data={activityByDay} />}
        </div>

        {/* Recent prompts */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-700 uppercase tracking-widest text-muted-foreground">
              Recientes
            </p>
            {recentPrompts.length > 0 && (
              <Link href="/dashboard/history">
                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground hover:text-foreground">
                  Ver todo
                </Button>
              </Link>
            )}
          </div>

          {recentPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Sin prompts aún</p>
                <p className="text-[11px] text-muted-foreground max-w-[200px]">
                  Optimiza tu primer prompt para verlo aquí
                </p>
              </div>
              <Link href="/dashboard/optimize">
                <Button size="sm" className="gap-1.5 bg-brand-500 hover:bg-brand-600 text-white h-7 text-xs">
                  <Sparkles className="h-3 w-3" />
                  Optimizar
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPrompts.slice(0, 5).map((prompt) => (
                <RecentPromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
