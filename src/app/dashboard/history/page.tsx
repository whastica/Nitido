"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/features/optimizer/PromptCard";
import { PromptCardSkeleton } from "@/components/shared/Skeletons";
import type { HistoryItem } from "@/types";

async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch("/api/history");
  if (!res.ok) throw new Error("Error fetching history");
  const { data } = await res.json();
  return data;
}

export default function HistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: fetchHistory,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Historial</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Revisa los prompts que has generado anteriormente
          </p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <PromptCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const items = data ?? [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Historial</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Revisa los prompts que has generado anteriormente
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card/60 p-12 text-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/40">
            <Sparkles className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">No hay prompts aun</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Optimiza tu primer prompt para verlo aqui. Cada optimizacion quedara guardada en tu historial.
            </p>
          </div>
          <Link href="/dashboard/optimize">
            <Button size="sm" className="gap-1.5 bg-brand-500 hover:bg-brand-600 text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Optimizar ahora
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <PromptCard key={item.id} prompt={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
