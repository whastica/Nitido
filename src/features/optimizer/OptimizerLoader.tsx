"use client";

import { Check, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { OptimizationStep, OptimizationStatus } from "@/types";

interface OptimizerLoaderProps {
  steps: OptimizationStep[];
  status: OptimizationStatus;
}

const PHASE_DESCRIPTIONS: Record<string, string> = {
  uploading: "Subiendo y extrayendo texto del documento",
  transcribing: "Convirtiendo audio a texto con Web Speech API...",
  analyzing: "El modelo analiza la intención y el contexto de tu solicitud",
  structuring: "Organizando la información en una estructura óptima",
  generating: "Generando tu prompt optimizado con IA",
  validating: "Evaluando la calidad y refinando el resultado final",
};

const STEP_TIMES = [15, 12, 18, 10];

export function OptimizerLoader({ steps, status }: OptimizerLoaderProps) {
  const activeStep = steps.find((s) => s.status === "active");
  const doneCount = steps.filter((s) => s.status === "done").length;
  const totalPct = steps.length > 0
    ? Math.round((doneCount / steps.length) * 100)
    : 0;

  const activeDescription = activeStep
    ? (PHASE_DESCRIPTIONS[activeStep.id] ?? "Procesando...")
    : "Iniciando pipeline de optimización...";

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 gap-8">
      {/* Spinner */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-[3px] border-border" />
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-brand-500 animate-spin" />
        <Loader2 className="h-6 w-6 text-brand-400 animate-spin" />
      </div>

      {/* Header */}
      <div className="text-center space-y-1 max-w-sm">
        <h3 className="font-heading text-base font-700 text-foreground">
          {status === "uploading"
            ? "Subiendo archivo..."
            : status === "transcribing"
            ? "Transcribiendo audio..."
            : "Pipeline de optimización activo"}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {activeDescription}
        </p>
      </div>

      {/* Pipeline steps */}
      {status !== "uploading" && status !== "transcribing" && steps.length > 0 && (
        <div className="w-full max-w-sm space-y-2">
          <div className="flex items-center justify-between mb-3">
            <Progress value={totalPct} className="h-1 flex-1 mr-3" />
            <span className="text-[11px] text-muted-foreground whitespace-nowrap font-medium">
              {totalPct}%
            </span>
          </div>

          {steps.map((step, i) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all duration-300",
                step.status === "active" && "bg-brand-500/8 border border-brand-500/20",
                step.status === "done" && "opacity-60",
                step.status === "pending" && "opacity-30"
              )}
            >
              <div className={cn(
                "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                step.status === "done" && "border-green-500/50 bg-green-500/10",
                step.status === "active" && "border-brand-500/50 bg-brand-500/10",
                step.status === "pending" && "border-border bg-transparent"
              )}>
                {step.status === "done" ? (
                  <Check className="h-3 w-3 text-green-400" />
                ) : step.status === "active" ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
                ) : (
                  <span className="text-[9px] text-muted-foreground/50 font-mono">{i + 1}</span>
                )}
              </div>

              <span className={cn(
                "transition-colors duration-300 flex-1",
                step.status === "done" && "text-muted-foreground",
                step.status === "active" && "text-foreground font-medium",
                step.status === "pending" && "text-muted-foreground/50"
              )}>
                {step.label}
              </span>

              {step.status === "active" && (
                <span className="text-[10px] text-brand-400/70 animate-pulse">
                  ~{STEP_TIMES[i] ?? 15}s
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
