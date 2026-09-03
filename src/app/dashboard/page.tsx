"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, Clock, TrendingUp, Calendar } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { DashboardStatsSkeleton } from "@/components/shared/Skeletons";
import type { DashboardData } from "@/types";

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Error fetching dashboard");
  const { data } = await res.json();
  return data;
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
            Bienvenido a PromptOptimizer
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

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bienvenido a PromptOptimizer
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}
