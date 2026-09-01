"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap, LayoutDashboard, History,
  Settings, ChevronRight, Sparkles,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { Badge } from "@/components/ui/badge";

// Clerk DESHABILITADO temporalmente
// TODO: Re-habilitar con useUser de @clerk/nextjs

const NAV_ITEMS = [
  { label: "Dashboard",     href: ROUTES.dashboard, icon: LayoutDashboard, strict: true },
  { label: "Optimizar",     href: ROUTES.optimize,  icon: Sparkles,       strict: false },
  { label: "Historial",     href: ROUTES.history,   icon: History,        strict: false },
  { label: "Configuración", href: ROUTES.settings,  icon: Settings,       strict: false },
] as const;

// Mock user para desarrollo
const MOCK_USER = {
  fullName: "Usuario Demo",
  firstName: "Usuario",
  primaryEmailAddress: { emailAddress: "demo@promptoptimizer.dev" },
  imageUrl: undefined as string | undefined,
};

export function DashboardSidebar() {
  const pathname = usePathname();

  const displayName = MOCK_USER.fullName;
  const displayEmail = MOCK_USER.primaryEmailAddress.emailAddress;
  const initials = getInitials(displayName);
  const avatarUrl = MOCK_USER.imageUrl;

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card/50 backdrop-blur-sm">
      <Link href={ROUTES.dashboard} className="flex h-14 items-center gap-2.5 border-b border-border px-4 hover:bg-muted/40 transition-colors">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500">
          <Zap className="h-4 w-4 fill-white text-white" />
        </div>
        <span className="font-heading text-[15px] font-700">
          Prompt<span className="text-brand-400">Optimizer</span>
        </span>
        <Badge
          variant="outline"
          className="ml-auto text-[9px] px-1.5 py-0 border-brand-500/30 text-brand-400"
        >
          Beta
        </Badge>
      </Link>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = item.strict
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-brand-500/10 text-brand-400"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-brand-400"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight className="h-3 w-3 text-brand-400/60" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 px-1">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-300">
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-foreground">
              {displayName}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {displayEmail}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
