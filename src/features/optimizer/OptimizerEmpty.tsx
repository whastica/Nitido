"use client";

import { Sparkles } from "lucide-react";

const STEPS = [
  "Escribe tu idea, sube un documento o habla al micrófono",
  "Configura la herramienta destino, formato y opciones",
  "Optimiza con IA en segundos",
];

export function OptimizerEmpty() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center gap-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-lg">
        <Sparkles className="h-7 w-7 text-brand-400" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-heading text-lg font-700 text-foreground">
          Workspace listo
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Transforma tus ideas en prompts estructurados y de alta calidad para cualquier herramienta de IA
        </p>
      </div>
      <div className="flex flex-col gap-2 mt-1 text-left">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-muted font-heading text-[11px] font-700 text-foreground">
              {i + 1}
            </div>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
