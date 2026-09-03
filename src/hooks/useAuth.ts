"use client";

import { useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import type { User } from "@/types";

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();

  const user: User | null = clerkUser
    ? {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || "Usuario",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        avatarUrl: clerkUser.imageUrl,
        createdAt: clerkUser.createdAt ?? new Date(),
      }
    : null;

  const logout = useCallback(async () => {
    await signOut();
    window.location.href = "/";
  }, [signOut]);

  return {
    user,
    isLoading: !isLoaded,
    error: null,
    logout,
    clearError: () => {},
  };
}
