"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { OptimizerSidebar } from "./OptimizerSidebar";
import { OptimizerResults } from "./OptimizerResults";
import { OptimizerEmpty } from "./OptimizerEmpty";
import { OptimizerLoader } from "./OptimizerLoader";
import { useOptimization } from "@/hooks/useOptimization";
import { useLastOptimization } from "@/hooks/useLastOptimization";
import type { OptimizationConfig, InputSourceType } from "@/types";
import { DEFAULT_OPTIMIZATION_CONFIG } from "@/constants";

export function OptimizerContainer() {
  const [config, setConfig] = useState<OptimizationConfig>(DEFAULT_OPTIMIZATION_CONFIG);
  const queryClient = useQueryClient();
  const { result: persistedResult, setResult: saveResult, clearResult } = useLastOptimization();

  const invalidateCaches = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["history"] });
    void queryClient.invalidateQueries({ queryKey: ["lastOptimization"] });
  }, [queryClient]);

  const onOptimizationSuccess = useCallback(
    (result: import("@/types").OptimizationResult) => {
      saveResult(result);
      invalidateCaches();
    },
    [saveResult, invalidateCaches]
  );

  const { status, steps, result: freshResult, error, warning, optimize, reset } =
    useOptimization({ onSuccess: onOptimizationSuccess });

  const activeResult = freshResult ?? (status === "idle" ? persistedResult : null);
  const showResults = !!(status === "done" && (freshResult || persistedResult));

  const handleOptimize = async (
    file: File | null,
    text: string,
    sourceType: InputSourceType
  ) => {
    await optimize(file, text, sourceType, config);
  };

  const handleReset = () => {
    clearResult();
    reset();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden md:flex-row">
      <OptimizerSidebar
        config={config}
        onConfigChange={setConfig}
        onOptimize={handleOptimize}
        isOptimizing={
          status === "uploading" ||
          status === "transcribing" ||
          status === "analyzing" ||
          status === "generating" ||
          status === "validating"
        }
        onReset={handleReset}
        hasDone={showResults}
      />

      <div className="flex flex-1 flex-col overflow-auto md:overflow-hidden bg-background min-h-0">
        {status === "idle" && !persistedResult && <OptimizerEmpty />}
        {status === "idle" && persistedResult && (
          <OptimizerResults result={persistedResult} warning={null} onReset={handleReset} />
        )}
        {(status === "uploading" ||
          status === "transcribing" ||
          status === "analyzing" ||
          status === "generating" ||
          status === "validating") && (
          <OptimizerLoader steps={steps} status={status} />
        )}
        {status === "done" && freshResult && (
          <OptimizerResults result={freshResult} warning={warning} onReset={handleReset} />
        )}
        {status === "error" && (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-destructive">Error en la optimización</p>
              <p className="text-xs text-muted-foreground">{error}</p>
              <button
                onClick={handleReset}
                className="mt-4 text-xs text-brand-400 hover:text-brand-300 underline underline-offset-4"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
