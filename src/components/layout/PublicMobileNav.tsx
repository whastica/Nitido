"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
}

export function MobileNav({
  links,
  loginHref,
}: {
  links: readonly NavLink[];
  loginHref: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Toggle button - visible only on mobile */}
      <button
        className="fixed top-4 right-20 z-50 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/80 backdrop-blur-xl md:hidden"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-down panel */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl transition-all duration-200 md:hidden ${
          open
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <div className="my-2 h-px bg-border/50" />
          <Link
            href={loginHref}
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </>
  );
}
