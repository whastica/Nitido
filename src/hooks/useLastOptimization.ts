"use client";

import { useState, useCallback, useEffect } from "react";
import type { OptimizationResult } from "@/types";

const STORAGE_KEY = "promptoptimizer:lastResult";

function loadFromStorage(): OptimizationResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OptimizationResult & { generatedAt: string };
    return { ...parsed, generatedAt: new Date(parsed.generatedAt) };
  } catch {
    return null;
  }
}

function saveToStorage(result: OptimizationResult | null) {
  if (typeof window === "undefined") return;
  if (result) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

interface UseLastOptimizationReturn {
  result: OptimizationResult | null;
  setResult: (result: OptimizationResult) => void;
  clearResult: () => void;
}

export function useLastOptimization(): UseLastOptimizationReturn {
  const [result, setResultState] = useState<OptimizationResult | null>(null);

  useEffect(() => {
    setResultState(loadFromStorage());
  }, []);

  const setResult = useCallback((result: OptimizationResult) => {
    setResultState(result);
    saveToStorage(result);
  }, []);

  const clearResult = useCallback(() => {
    setResultState(null);
    saveToStorage(null);
  }, []);

  return { result, setResult, clearResult };
}
