"use client";

import { useState, useCallback, useRef } from "react";
import {
  type OptimizationStatus,
  type OptimizationStep,
  type OptimizationResult,
  type InputSourceType,
  type OptimizationConfig,
  type SSEEvent,
} from "@/types";
import { PIPELINE_STEPS } from "@/constants";

interface UseOptimizationOptions {
  onSuccess?: (result: OptimizationResult) => void;
}

interface UseOptimizationReturn {
  status: OptimizationStatus;
  steps: OptimizationStep[];
  result: OptimizationResult | null;
  error: string | null;
  warning: string | null;
  optimize: (
    file: File | null,
    text: string,
    sourceType: InputSourceType,
    config: OptimizationConfig
  ) => Promise<void>;
  reset: () => void;
}

const INITIAL_STEPS: OptimizationStep[] = PIPELINE_STEPS.map((s) => ({
  ...s,
  status: "pending" as const,
}));

export function useOptimization(options: UseOptimizationOptions = {}): UseOptimizationReturn {
  const { onSuccess } = options;

  const [status, setStatus] = useState<OptimizationStatus>("idle");
  const [steps, setSteps] = useState<OptimizationStep[]>(INITIAL_STEPS);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
    setSteps(INITIAL_STEPS);
    setResult(null);
    setError(null);
    setWarning(null);
  }, []);

  const updateStep = useCallback((stepId: string, stepStatus: OptimizationStep["status"]) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status: stepStatus } : s))
    );
  }, []);

  const optimize = useCallback(
    async (
      file: File | null,
      text: string,
      sourceType: InputSourceType,
      config: OptimizationConfig
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("uploading");
      setError(null);
      setWarning(null);
      setResult(null);
      setSteps(INITIAL_STEPS);

      try {
        let extractedText = text;
        let effectiveSourceType = sourceType;

        if (file && sourceType !== "text") {
          setStatus("uploading");
          const formData = new FormData();
          formData.append("file", file);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });

          if (!uploadRes.ok) {
            const errBody = await uploadRes.json().catch(() => null);
            throw new Error(errBody?.error?.message ?? "Error al subir el archivo");
          }

          const { data: uploadData } = await uploadRes.json();
          extractedText = uploadData.text;
          effectiveSourceType = uploadData.metadata.fileType;
        }

        if (sourceType === "voice" && text) {
          extractedText = text;
        }

        setStatus("transcribing");
        updateStep("analyzing", "active");

        const response = await fetch("/api/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: extractedText,
            sourceType: effectiveSourceType,
            config,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => null);
          throw new Error(errBody?.error?.message ?? "Error en la optimización");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No se pudo leer la respuesta del servidor");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;

            try {
              const event: SSEEvent = JSON.parse(jsonStr);
              handleSSEEvent(event, updateStep, setStatus, setResult, setWarning, setError, onSuccess);
            } catch {
              // skip malformed events
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Error desconocido";
        setStatus("error");
        setError(message);
      }
    },
    [updateStep, onSuccess]
  );

  return { status, steps, result, error, warning, optimize, reset };
}

function handleSSEEvent(
  event: SSEEvent,
  updateStep: (id: string, status: OptimizationStep["status"]) => void,
  setStatus: (s: OptimizationStatus) => void,
  setResult: (r: OptimizationResult) => void,
  setWarning: (w: string | null) => void,
  setError: (e: string | null) => void,
  onSuccess?: (r: OptimizationResult) => void
) {
  switch (event.type) {
    case "progress": {
      const phaseToStep: Record<string, string> = {
        analyzing: "analyzing",
        structuring: "structuring",
        generating: "generating",
        validating: "validating",
      };
      const stepId = phaseToStep[event.phase];
      if (stepId) {
        updateStep(stepId, "active");
        for (const id of Object.values(phaseToStep)) {
          const stepIdx = Object.values(phaseToStep).indexOf(id);
          const activeIdx = Object.values(phaseToStep).indexOf(stepId);
          if (stepIdx < activeIdx) updateStep(id, "done");
        }
      }
      if (event.phase === "upload") setStatus("uploading");
      else if (event.phase === "summarizing") setStatus("transcribing");
      else if (["analyzing", "structuring"].includes(event.phase)) setStatus("analyzing");
      else if (event.phase === "generating") setStatus("generating");
      else if (event.phase === "validating") setStatus("validating");
      break;
    }
    case "result":
      updateStep("validating", "done");
      setStatus("done");
      setResult(event.data);
      onSuccess?.(event.data);
      break;
    case "warning":
      setWarning(event.message);
      break;
    case "error":
      setStatus("error");
      setError(event.message);
      break;
  }
}
