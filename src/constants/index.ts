import type { TargetTool, OutputFormat, OptimizationConfig } from "@/types";

export const APP_NAME = "Nitido";
export const APP_DESCRIPTION =
  "Transforma tus ideas en prompts estructurados y de alta calidad para cualquier herramienta de IA.";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  optimize: "/optimize",
  dashboardOptimize: "/dashboard/optimize",
  history: "/dashboard/history",
  settings: "/dashboard/settings",
} as const;

export const INPUT_SOURCES = {
  text: "Texto libre",
  document: "Documento",
  voice: "Voz",
} as const;

export const TARGET_TOOLS: { value: TargetTool; label: string; description: string }[] = [
  { value: "chatbot", label: "Chatbot conversacional", description: "ChatGPT, Claude, Gemini" },
  { value: "codigo", label: "Agente de código", description: "Claude Code, OpenCode" },
  { value: "imagen", label: "Generador de imágenes", description: "DALL-E, Midjourney, Stable Diffusion" },
];

export const OUTPUT_FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "libre", label: "Texto libre" },
  { value: "vietas", label: "Lista o viñetas" },
  { value: "tabla", label: "Tabla" },
  { value: "json", label: "JSON o formato estructurado" },
  { value: "codigo", label: "Código" },
];

export const DETAIL_LEVELS = [
  { value: "basic" as const, label: "Básico" },
  { value: "standard" as const, label: "Estándar" },
  { value: "detailed" as const, label: "Detallado" },
];

export const LANGUAGES = [
  { value: "es" as const, label: "Español" },
  { value: "en" as const, label: "Inglés" },
];

export const DEFAULT_OPTIMIZATION_CONFIG: OptimizationConfig = {
  language: "es",
  detailLevel: "standard",
  includeConstraints: true,
  targetTool: "chatbot",
  outputFormat: "libre",
};

export const PIPELINE_STEPS = [
  { id: "analyzing", label: "Analizando intención..." },
  { id: "structuring", label: "Estructurando contexto..." },
  { id: "generating", label: "Generando prompt optimizado..." },
  { id: "validating", label: "Validando calidad..." },
] as const;

export const ACCEPTED_FILE_TYPES = {
  document: {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "text/plain": [".txt"],
  },
} as const;

export const MAX_DOCUMENT_SIZE_MB = 25;

/** @deprecated Usado solo por /api/transcribe — el proyecto usa Web Speech API */
export const MAX_AUDIO_SIZE_MB = 100;

export const QUALITY_LABELS: Record<string, string> = {
  claridad: "Claridad",
  especificidad: "Especificidad",
  contexto_completo: "Contexto completo",
  formato_definido: "Formato definido",
  ejemplos_incluidos: "Ejemplos incluidos",
};
