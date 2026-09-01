// ─── Domain: Prompt ───────────────────────────────────────────────────────────
export type InputSourceType = "text" | "pdf" | "docx" | "txt" | "audio";
export type OutputFormat = "generic" | "chatgpt" | "claude" | "gemini";
export type DetailLevel = "basic" | "standard" | "detailed";
export type Language = "es" | "en";

export interface StructuredPrompt {
  rol_sistema: string;
  contexto: string;
  tarea: string;
  instrucciones: string[];
  formato_salida: string;
  ejemplos: string[];
  limitaciones: string[];
  pregunta_clave: string;
}

export interface QualityChecklist {
  claridad: boolean;
  especificidad: boolean;
  contexto_completo: boolean;
  formato_definido: boolean;
  ejemplos_incluidos: boolean;
}

export interface Prompt {
  id: string;
  inputText: string;
  sourceType: InputSourceType;
  sourceMetadata?: Record<string, unknown>;
  generatedPrompt: string;
  structuredPrompt: StructuredPrompt;
  compactPrompt: string;
  qualityScore: number;
  qualityChecklist: QualityChecklist;
  improvements: string[];
  tokensUsed?: number;
  latencyMs?: number;
  createdAt: Date;
}

// ─── Domain: Optimization Config ─────────────────────────────────────────────
export interface OptimizationConfig {
  outputFormat: OutputFormat;
  language: Language;
  detailLevel: DetailLevel;
  includeExamples: boolean;
}

// ─── Domain: Optimization Result ─────────────────────────────────────────────
export type OptimizationStatus =
  | "idle"
  | "uploading"
  | "transcribing"
  | "analyzing"
  | "generating"
  | "validating"
  | "done"
  | "error";

export interface OptimizationStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done" | "error";
}

export interface OptimizationResult {
  id: string;
  prompt: Prompt;
  generatedAt: Date;
  sourceType: InputSourceType;
  config: OptimizationConfig;
  tokensUsed?: number;
}

// ─── Domain: Auth ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

// ─── Upload ───────────────────────────────────────────────────────────────────
export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: InputSourceType;
  status: UploadStatus;
  progress: number;
  preview?: string;
  error?: string;
}

export interface UploadMetadata {
  fileType: InputSourceType;
  fileName: string;
  fileSizeBytes: number;
  pages?: number;
  wordCount: number;
  charCount: number;
}

export interface UploadResult {
  text: string;
  metadata: UploadMetadata;
}

// ─── Transcription (Whisper) ──────────────────────────────────────────────────
export interface TranscriptionResult {
  text: string;
  duration: number;
  language: string;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
  };
}

// ─── Pipeline internal types ─────────────────────────────────────────────────

export interface PipelineIntention {
  tarea_principal: string;
  tipo_salida_esperada: string;
  nivel_detalle: string;
  contexto_disponible: string[];
  posibles_ambiguedades: string[];
  informacion_faltante: string[];
}

export interface PipelineContext {
  dominio: string;
  audiencia: string;
  restricciones: string[];
  reglas_negocio: string[];
  dependencias: string[];
  instrucciones_claras: string[];
  ejemplos_mencionados: string[];
  formato_salida_sugerido: string;
}

export interface PipelineGeneratedPrompt {
  prompt_estructurado: StructuredPrompt;
  prompt_compacto: string;
  explicacion_mejoras: string[];
}

export interface PipelineValidation {
  puntuacion_calidad: number;
  checklist: QualityChecklist;
  prompt_final: string;
  sugerencias_mejora: string[];
}

// ─── SSE Pipeline Events ──────────────────────────────────────────────────────

export type PipelinePhase =
  | "upload"
  | "summarizing"
  | "analyzing"
  | "structuring"
  | "generating"
  | "validating"
  | "done"
  | "error";

export interface SSEProgressEvent {
  type: "progress";
  phase: PipelinePhase;
  stepIndex: number;
  totalSteps: number;
  message: string;
}

export interface SSEResultEvent {
  type: "result";
  data: OptimizationResult;
}

export interface SSEWarningEvent {
  type: "warning";
  message: string;
}

export interface SSEErrorEvent {
  type: "error";
  code: string;
  message: string;
}

export type SSEEvent = SSEProgressEvent | SSEResultEvent | SSEWarningEvent | SSEErrorEvent;

// ─── Misc ─────────────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavItem[];
}
