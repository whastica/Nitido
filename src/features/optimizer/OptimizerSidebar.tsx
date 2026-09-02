"use client";

import { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadZone } from "@/features/upload/UploadZone";
import { VoiceInput } from "@/features/upload/VoiceInput";
import {
  TARGET_TOOLS,
  OUTPUT_FORMATS,
  DETAIL_LEVELS,
  LANGUAGES,
} from "@/constants";
import type { OptimizationConfig, InputSourceType } from "@/types";
import { cn } from "@/lib/utils";

interface OptimizerSidebarProps {
  config: OptimizationConfig;
  onConfigChange: (cfg: OptimizationConfig) => void;
  onOptimize: (file: File | null, text: string, sourceType: InputSourceType) => void;
  isOptimizing: boolean;
  hasDone: boolean;
  onReset: () => void;
}

type InputTab = "text" | "document" | "voice";

export function OptimizerSidebar({
  config,
  onConfigChange,
  onOptimize,
  isOptimizing,
  hasDone,
  onReset,
}: OptimizerSidebarProps) {
  const [activeTab, setActiveTab] = useState<InputTab>("text");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");

  const set = <K extends keyof OptimizationConfig>(key: K, val: OptimizationConfig[K]) =>
    onConfigChange({ ...config, [key]: val });

  const canOptimize =
    (activeTab === "text" && text.trim().length > 20) ||
    (activeTab === "document" && !!file) ||
    (activeTab === "voice" && text.trim().length > 10);

  const handleOptimize = () => {
    const sourceType: InputSourceType =
      activeTab === "document" ? "pdf" : activeTab === "voice" ? "voice" : "text";
    onOptimize(file, text, sourceType);
  };

  const handleVoiceResult = (transcript: string) => {
    setText(transcript);
  };

  const TABS: { id: InputTab; label: string }[] = [
    { id: "text", label: "Texto" },
    { id: "document", label: "Documento" },
    { id: "voice", label: "Voz" },
  ];

  return (
    <aside className="flex w-full flex-shrink-0 flex-col border-b border-border bg-card/40 overflow-y-auto md:w-80 md:border-b-0 md:border-r">
      {/* Input source tabs */}
      <div className="p-4 border-b border-border space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <span className="w-2.5 h-px bg-brand-500 block" />
          Fuente de información
        </p>
        <div className="flex rounded-lg bg-muted p-0.5 gap-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setFile(null); setText(""); }}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-medium transition-all duration-150",
                activeTab === t.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Text input */}
        {activeTab === "text" && (
          <div className="space-y-1.5">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ejemplo: Necesito que la IA me ayude a escribir emails de ventas para mi negocio de cosméticos naturales dirigidos a mujeres de 25-40 años..."
              rows={6}
              className="w-full resize-none rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
            />
            <p className="text-right text-[11px] text-muted-foreground">
              {text.length} caracteres
            </p>
          </div>
        )}

        {/* Upload zone */}
        {activeTab === "document" && (
          <UploadZone
            file={file}
            onFileSelect={setFile}
            onFileRemove={() => setFile(null)}
          />
        )}

        {/* Voice input */}
        {activeTab === "voice" && (
          <div className="space-y-2">
            <VoiceInput
              language={config.language}
              onResult={handleVoiceResult}
            />
            {text && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {text}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Config */}
      <div className="p-4 border-b border-border space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <span className="w-2.5 h-px bg-brand-500 block" />
          Configuración
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Herramienta destino
            </Label>
            <Select value={config.targetTool} onValueChange={(v) => set("targetTool", v as OptimizationConfig["targetTool"])}>
              <SelectTrigger className="h-8 text-xs bg-muted/40 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TARGET_TOOLS.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Formato de salida
            </Label>
            <Select value={config.outputFormat} onValueChange={(v) => set("outputFormat", v as OptimizationConfig["outputFormat"])}>
              <SelectTrigger className="h-8 text-xs bg-muted/40 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTPUT_FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value} className="text-xs">
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Nivel de detalle
            </Label>
            <Select value={config.detailLevel} onValueChange={(v) => set("detailLevel", v as OptimizationConfig["detailLevel"])}>
              <SelectTrigger className="h-8 text-xs bg-muted/40 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DETAIL_LEVELS.map((d) => (
                  <SelectItem key={d.value} value={d.value} className="text-xs">
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Idioma
            </Label>
            <Select value={config.language} onValueChange={(v) => set("language", v as OptimizationConfig["language"])}>
              <SelectTrigger className="h-8 text-xs bg-muted/40 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value} className="text-xs">
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-border/50" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-foreground">Incluir restricciones</p>
            <p className="text-[11px] text-muted-foreground">Agrega limitaciones al prompt</p>
          </div>
          <Switch
            checked={config.includeConstraints}
            onCheckedChange={(v) => set("includeConstraints", v)}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="p-4 mt-auto">
        {hasDone ? (
          <Button
            variant="outline"
            className="w-full gap-2 border-border text-muted-foreground hover:text-foreground"
            onClick={onReset}
          >
            <RefreshCw className="h-4 w-4" />
            Nueva optimización
          </Button>
        ) : (
          <Button
            className="w-full gap-2 bg-brand-500 hover:bg-brand-600 text-white font-heading font-600"
            disabled={!canOptimize || isOptimizing}
            onClick={handleOptimize}
          >
            <Sparkles className="h-4 w-4" />
            {isOptimizing ? "Optimizando..." : "Optimizar Prompt"}
          </Button>
        )}
      </div>
    </aside>
  );
}
