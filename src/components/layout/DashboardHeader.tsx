"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  HelpCircle,
  Zap,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { ROUTES } from "@/constants";

// Clerk DESHABILITADO temporalmente
// TODO: Re-habilitar con useUser y useClerk de @clerk/nextjs

const BREADCRUMB_MAP: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/optimize": "Optimizar",
  "/dashboard/history": "Historial",
  "/dashboard/settings": "Configuración",
};

// Mock user para desarrollo
const MOCK_USER = {
  fullName: "Usuario Demo",
  firstName: "Usuario",
  primaryEmailAddress: { emailAddress: "demo@promptoptimizer.dev" },
};

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = BREADCRUMB_MAP[pathname] ?? "Dashboard";

  const displayName = MOCK_USER.fullName || MOCK_USER.firstName || "Usuario";
  const displayEmail = MOCK_USER.primaryEmailAddress.emailAddress || "";
  const initials = displayName.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    // Mock logout - redirigir a home
    router.push("/");
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card/30 backdrop-blur-sm px-4 md:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-60 p-0">
          <Link
            href={ROUTES.dashboard}
            className="flex h-14 items-center gap-2.5 border-b border-border px-4 hover:bg-muted/40 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500">
              <Zap className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="font-heading text-[15px] font-700">
              Prompt<span className="text-brand-400">Optimizer</span>
            </span>
          </Link>

          <nav className="space-y-0.5 px-2 py-4">
            {Object.entries(BREADCRUMB_MAP).map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <h1 className="text-sm font-semibold text-foreground">
        {pageTitle}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-300">
                {initials}
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium">{displayName}</p>
              <p className="text-[11px] text-muted-foreground">{displayEmail}</p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href={ROUTES.settings}>Configuración</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
