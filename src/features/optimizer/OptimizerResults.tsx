"use client";

import { useState } from "react";
import { Copy, RefreshCw, Check, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { OptimizationResult } from "@/types";

interface OptimizerResultsProps {
  result: OptimizationResult;
  warning: string | null;
  onReset: () => void;
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

const SOURCE_LABELS: Record<"text" | "pdf" | "docx" | "txt" | "voice", string> = {
  text: "Texto",
  pdf: "PDF",
  docx: "DOCX",
  txt: "TXT",
  voice: "Voz",
};

export function OptimizerResults({ result, warning, onReset }: OptimizerResultsProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const { prompt } = result;

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(prompt.generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Warning banner */}
      {warning && (
        <div className="flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-5 py-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-300">{warning}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border bg-card/30 px-5 py-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn("text-[10px] px-2 py-0.5 font-700 uppercase tracking-wider border", getScoreStyle(prompt.qualityScore))}
          >
            {prompt.qualityScore}/100
          </Badge>
          <div>
            <p className="font-heading text-sm font-700 text-foreground">
              Prompt optimizado
            </p>
            <p className="text-[11px] text-muted-foreground">
              Fuente: {SOURCE_LABELS[result.sourceType] ?? result.sourceType} ·{" "}
              {result.tokensUsed?.toLocaleString()} tokens ·{" "}
              {formatRelativeTime(result.generatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs border-border"
            onClick={handleCopyAll}
          >
            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copiado" : "Copiar todo"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs text-muted-foreground"
            onClick={onReset}
          >
            <RefreshCw className="h-3 w-3" />
            Nuevo
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Prompt compacto */}
        <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <p className="text-[10px] font-700 uppercase tracking-widest text-muted-foreground">
              Prompt compacto
            </p>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          {expanded && (
            <div className="px-4 pb-4">
              <div className="rounded-lg border-l-2 border-brand-500 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {prompt.compactPrompt}
              </div>
            </div>
          )}
        </div>

        {/* Prompt estructurado */}
        <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
          <p className="text-[10px] font-700 uppercase tracking-widest text-muted-foreground">
            Prompt estructurado
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <CardSection label="Rol" value={prompt.structuredPrompt.rol_sistema} />
            <CardSection label="Contexto" value={prompt.structuredPrompt.contexto} />
            <CardSection label="Tarea" value={prompt.structuredPrompt.tarea} />
            <CardSection label="Formato de salida" value={prompt.structuredPrompt.formato_salida} />
          </div>
          {prompt.structuredPrompt.instrucciones.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-600 uppercase tracking-wider text-muted-foreground">
                Instrucciones
              </p>
              <ul className="space-y-1">
                {prompt.structuredPrompt.instrucciones.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-brand-400 font-medium">{i + 1}.</span>
                    {inst}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {prompt.structuredPrompt.ejemplos.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-600 uppercase tracking-wider text-muted-foreground">
                Ejemplos
              </p>
              <ul className="space-y-1">
                {prompt.structuredPrompt.ejemplos.map((ej, i) => (
                  <li key={i} className="text-xs text-muted-foreground pl-3 border-l border-border">
                    {ej}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {prompt.structuredPrompt.limitaciones.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-600 uppercase tracking-wider text-muted-foreground">
                Limitaciones
              </p>
              <div className="flex flex-wrap gap-1.5">
                {prompt.structuredPrompt.limitaciones.map((lim, i) => (
                  <span key={i} className="text-[10px] text-amber-400/80 bg-amber-500/10 rounded px-2 py-1">
                    {lim}
                  </span>
                ))}
              </div>
            </div>
          )}
          {prompt.structuredPrompt.pregunta_clave && (
            <div className="rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Pregunta clave:</span>{" "}
              {prompt.structuredPrompt.pregunta_clave}
            </div>
          )}
        </div>

        {/* Quality checklist */}
        <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
          <p className="text-[10px] font-700 uppercase tracking-widest text-muted-foreground">
            Checklist de calidad
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(prompt.qualityChecklist).map(([key, passed]) => (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                  passed ? "bg-green-500/8 text-green-400" : "bg-muted/30 text-muted-foreground"
                )}
              >
                <Check className={cn("h-3.5 w-3.5", passed ? "text-green-400" : "text-muted-foreground/40")} />
                <span className="capitalize">{key.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mejoras aplicadas */}
        {prompt.improvements.length > 0 && (
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
            <p className="text-[10px] font-700 uppercase tracking-widest text-muted-foreground">
              Mejoras aplicadas
            </p>
            <ul className="space-y-1.5">
              {prompt.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-brand-400 mt-0.5 flex-shrink-0" />
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function CardSection({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-600 uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-xs text-foreground leading-relaxed">{value}</p>
    </div>
  );
}
