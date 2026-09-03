"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { Check } from "lucide-react";
import { ROUTES } from "@/constants";

export function LoginForm() {
  const { signIn, fetchStatus } = useSignIn();
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    if (!signIn) return;

    setIsLoading(true);
    setServerError(null);

    try {
      await signIn.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: "/sso-callback",
        redirectUrl: "/dashboard",
      });
    } catch (err) {
      console.error("Error de autenticación:", err);
      setServerError("Error al conectar con Google. Intenta de nuevo.");
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/10">
          <Check className="h-6 w-6 text-green-400" />
        </div>
        <p className="font-heading text-base font-700 text-foreground">¡Bienvenido!</p>
        <p className="text-sm text-muted-foreground">Redirigiendo a tu workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center p-7 space-y-5">
      <div>
        <h1 className="font-heading text-xl font-700 text-foreground">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Accede a tu workspace de PromptOptimizer
        </p>
      </div>

      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {serverError}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isLoading || fetchStatus === "fetching"}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/60 hover:border-border/80 transition-all duration-150 disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {isLoading ? "Conectando..." : "Continuar con Google"}
      </button>
    </div>
  );
}
