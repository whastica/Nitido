import { redirect } from "next/navigation";

// Clerk DESHABILITADO temporalmente
// TODO: Re-habilitar con AuthenticateWithRedirectCallback de @clerk/nextjs

export default function SSOCallbackPage() {
  // Mock SSO callback - redirigir directamente al dashboard
  redirect("/dashboard");
}
