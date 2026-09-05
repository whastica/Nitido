"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function SignedOutGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
