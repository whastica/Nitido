"use client";

import { useCallback, useState } from "react";
import type { User } from "@/types";

// Clerk DESHABILITADO temporalmente
// TODO: Re-habilitar con useUser y useClerk de @clerk/nextjs

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Mock user para desarrollo
const MOCK_USER: User = {
  id: "dev-user-mock",
  name: "Usuario Demo",
  email: "demo@promptoptimizer.dev",
  avatarUrl: undefined,
  createdAt: new Date(),
};

export function useAuth(): UseAuthReturn {
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    // Mock logout - redirigir a home
    window.location.href = "/";
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    user: MOCK_USER,
    isLoading: false,
    error,
    logout,
    clearError,
  };
}
