"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { HistoryItem } from "@/types";

interface PromptCardProps {
  prompt: HistoryItem;
  index: number;
}

const SOURCE_STYLES: Record<"text" | "pdf" | "docx" | "txt" | "voice", string> = {
  text: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  pdf: "bg-green-500/10 text-green-400 border-green-500/20",
  docx: "bg-green-500/10 text-green-400 border-green-500/20",
  txt: "bg-green-500/10 text-green-400 border-green-500/20",
  voice: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

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

export function PromptCard({ prompt, index }: PromptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.compactPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="group rounded-xl border border-border bg-card/60 overflow-hidden transition-all duration-200 hover:border-brand-500/25 hover:shadow-lg"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{prompt.inputText}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge
            variant="outline"
            className={cn("text-[9px] px-2 py-0 font-600 uppercase tracking-wider border", SOURCE_STYLES[prompt.sourceType])}
          >
            {SOURCE_LABELS[prompt.sourceType] ?? prompt.sourceType}
          </Badge>
          <Badge
            variant="outline"
            className={cn("text-[9px] px-2 py-0 font-700 border", getScoreStyle(prompt.qualityScore))}
          >
            {prompt.qualityScore}
          </Badge>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
          >
            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div
        className={cn(
          "transition-all duration-300",
          expanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 space-y-3">
          <div className="rounded-lg border-l-2 border-brand-500 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {prompt.compactPrompt}
          </div>
          <p className="text-[10px] text-muted-foreground/60">
            {formatRelativeTime(prompt.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
