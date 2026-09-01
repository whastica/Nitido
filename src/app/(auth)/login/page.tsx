import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/LoginForm";
import { AuthVisualPanel } from "@/features/auth/AuthVisualPanel";
import type { Metadata } from "next";

// Clerk DESHABILITADO temporalmente
// TODO: Re-habilitar con auth() de @clerk/nextjs/server

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage() {
  // Mock auth check - en desarrollo siempre mostrar login
  // TODO: Re-habilitar cuando Clerk esté configurado:
  // const { userId } = await auth();
  // if (userId) {
  //   redirect("/dashboard");
  // }

  return (
    <div className="w-full max-w-[860px] overflow-hidden rounded-2xl border border-border bg-card/70 shadow-2xl backdrop-blur-sm grid md:grid-cols-2">
      <AuthVisualPanel />
      <LoginForm />
    </div>
  );
}
