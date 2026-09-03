import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { LoginForm } from "@/features/auth/LoginForm";
import { AuthVisualPanel } from "@/features/auth/AuthVisualPanel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full max-w-[860px] overflow-hidden rounded-2xl border border-border bg-card/70 shadow-2xl backdrop-blur-sm grid md:grid-cols-2">
      <AuthVisualPanel />
      <LoginForm />
    </div>
  );
}
