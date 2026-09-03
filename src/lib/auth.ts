import { auth } from "@clerk/nextjs/server";
import { ApiRouteError } from "@/lib/api";

export interface AuthContext {
  userId: string;
  getToken: () => Promise<string | null>;
}

export async function requireAuth(): Promise<AuthContext> {
  const session = await auth();

  if (!session.userId) {
    throw new ApiRouteError("UNAUTHORIZED", "Debes iniciar sesión para realizar esta acción");
  }

  return {
    userId: session.userId,
    getToken: session.getToken,
  };
}
