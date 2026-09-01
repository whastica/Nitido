import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Clerk middleware DESHABILITADO temporalmente
// Se re-habilitará cuando se configuren las credenciales de Clerk
// TODO: Re-habilitar Clerk siguiendo la guía de migración:
// https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher

export function middleware(req: NextRequest) {
  // Middleware vacío - todas las rutas son accesibles sin auth
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
