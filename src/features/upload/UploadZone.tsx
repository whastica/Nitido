"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES, MAX_DOCUMENT_SIZE_MB } from "@/constants";
import type { UploadResult } from "@/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "success"; result: UploadResult }
  | { status: "error"; message: string };

interface UploadZoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onUploadComplete?: (result: UploadResult) => void;
  onUploadError?: (message: string) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function UploadZone({
  file,
  onFileSelect,
  onFileRemove,
  onUploadComplete,
  onUploadError,
}: UploadZoneProps) {
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const f = accepted[0];
      if (!f) return;

      onFileSelect(f);
      await uploadToServer(f);
    },
    [onFileSelect]
  );

  const uploadToServer = async (f: File) => {
    setUploadState({ status: "uploading", progress: 0 });

    const progressInterval = simulateProgress((pct) => {
      setUploadState({ status: "uploading", progress: pct });
    });

    try {
      const formData = new FormData();
      formData.append("file", f);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const body = await res.json().catch(() => null) as
          | { error?: { message?: string } }
          | null;
        const message =
          body?.error?.message ?? `Error del servidor (${res.status})`;
        setUploadState({ status: "error", message });
        onUploadError?.(message);
        return;
      }

      const body = await res.json() as { data: UploadResult };
      setUploadState({ status: "success", result: body.data });
      onUploadComplete?.(body.data);
    } catch (err) {
      clearInterval(progressInterval);
      const message =
        err instanceof Error ? err.message : "Error de conexión al subir el archivo";
      setUploadState({ status: "error", message });
      onUploadError?.(message);
    }
  };

  const handleRemove = () => {
    onFileRemove();
    setUploadState({ status: "idle" });
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES.document,
    maxSize: MAX_DOCUMENT_SIZE_MB * 1024 * 1024,
    multiple: false,
  });

  const rejectionMsg = fileRejections[0]?.errors[0]?.message;

  // ── Vista: archivo seleccionado ──────────────────────────────────────────
  if (file) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500/10">
            <FileText className="h-4 w-4 text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
            <p className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</p>
          </div>

          {uploadState.status === "uploading" && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-3 w-3 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
              <span className="text-[11px] text-muted-foreground">
                {uploadState.progress}%
              </span>
            </div>
          )}
          {uploadState.status === "success" && (
            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
          )}
          {uploadState.status === "error" && (
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          )}

          <button
            onClick={handleRemove}
            className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
            aria-label="Remover archivo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {uploadState.status === "uploading" && (
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-200"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        )}

        {uploadState.status === "success" && (
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground px-1">
            <span>{uploadState.result.metadata.wordCount.toLocaleString()} palabras</span>
            {uploadState.result.metadata.pages && (
              <span>· {uploadState.result.metadata.pages} páginas</span>
            )}
            <span>· {uploadState.result.metadata.charCount.toLocaleString()} caracteres</span>
          </div>
        )}

        {uploadState.status === "error" && (
          <p className="text-[11px] text-destructive px-1">
            {uploadState.message}
          </p>
        )}
      </div>
    );
  }

  // ── Vista: dropzone vacío ────────────────────────────────────────────────
  return (
    <div className="space-y-1.5">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border-[1.5px] border-dashed px-4 py-6 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-brand-500 bg-brand-500/8"
            : "border-border bg-muted/20 hover:border-brand-500/50 hover:bg-muted/40"
        )}
      >
        <input {...getInputProps()} />
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-sm transition-all",
          isDragActive && "border-brand-500/40 bg-brand-500/5"
        )}>
          <Upload className="h-5 w-5 text-brand-400" />
        </div>
        <div>
          <p className="font-heading text-xs font-600 text-foreground">
            {isDragActive ? "Suelta el archivo aquí" : "Arrastra tu archivo aquí"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            PDF, DOCX, TXT{" "}· o{" "}
            <span className="text-brand-400 font-medium">selecciona</span>
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            Máx {MAX_DOCUMENT_SIZE_MB} MB
          </p>
        </div>
      </div>
      {rejectionMsg && (
        <p className="text-[11px] text-destructive px-1">{rejectionMsg}</p>
      )}
    </div>
  );
}

// ─── Helper: simula progreso de upload ────────────────────────────────────────

function simulateProgress(onProgress: (pct: number) => void): ReturnType<typeof setInterval> {
  let current = 0;
  const interval = setInterval(() => {
    const increment = current < 50 ? 8 : current < 80 ? 4 : 1;
    current = Math.min(current + increment, 85);
    onProgress(current);
    if (current >= 85) clearInterval(interval);
  }, 150);
  return interval;
}
