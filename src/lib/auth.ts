import { ApiRouteError } from "@/lib/api";

// Clerk DESHABILITADO temporalmente
// TODO: Re-habilitar con auth() de @clerk/nextjs/server cuando se configuren las credenciales

export interface AuthContext {
  userId: string;
  getToken: () => Promise<string | null>;
}

/**
 * Mock auth para desarrollo sin Clerk.
 * Retorna un usuario mock para poder probar las API routes.
 */
export async function requireAuth(): Promise<AuthContext> {
  // TODO: Re-habilitar cuando Clerk esté configurado:
  // const session = await auth();
  // if (!session.userId) {
  //   throw new ApiRouteError("UNAUTHORIZED", "Debes iniciar sesión...");
  // }
  // return { userId: session.userId, getToken: session.getToken };

  // Mock temporal - usuario de desarrollo
  return {
    userId: "dev-user-mock",
    getToken: async () => null,
  };
}
