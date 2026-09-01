export const APP_NAME = "PromptOptimizer";
export const APP_DESCRIPTION =
  "Transforma tus ideas en prompts estructurados y de alta calidad para cualquier herramienta de IA.";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  optimize: "/dashboard/optimize",
  history: "/dashboard/history",
  settings: "/dashboard/settings",
} as const;

export const INPUT_SOURCES = {
  text: "Texto libre",
  document: "Documento",
  audio: "Audio",
} as const;

export const PIPELINE_STEPS = [
  { id: "analyzing",   label: "Analizando intención..." },
  { id: "structuring", label: "Estructurando contexto..." },
  { id: "generating",  label: "Generando prompt optimizado..." },
  { id: "validating",  label: "Validando calidad..." },
] as const;

export const PIPELINE_STEPS_AUDIO = [
  { id: "transcribing", label: "Transcribiendo audio con IA..." },
  { id: "analyzing",    label: "Analizando intención..." },
  { id: "structuring",  label: "Estructurando contexto..." },
  { id: "generating",   label: "Generando prompt optimizado..." },
  { id: "validating",   label: "Validando calidad..." },
] as const;

export const ACCEPTED_FILE_TYPES = {
  document: {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "text/plain": [".txt"],
  },
  audio: {
    "audio/mpeg": [".mp3"],
    "audio/mp4": [".mp4"],
    "audio/x-m4a": [".m4a"],
    "audio/wav": [".wav"],
    "audio/webm": [".webm"],
  },
} as const;

export const MAX_DOCUMENT_SIZE_MB = 25;
export const MAX_AUDIO_SIZE_MB = 100;

export const QUALITY_LABELS: Record<string, string> = {
  claridad: "Claridad",
  especificidad: "Especificidad",
  contexto_completo: "Contexto completo",
  formato_definido: "Formato definido",
  ejemplos_incluidos: "Ejemplos incluidos",
};
