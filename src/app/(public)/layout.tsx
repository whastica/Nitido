import Link from "next/link";
import { Zap } from "lucide-react";
import { ROUTES } from "@/constants";
import { MobileNav } from "@/components/layout/PublicMobileNav";

const NAV_LINKS = [
  { label: "Características", href: "#features" },
  { label: "Cómo funciona", href: "#how-it-works" },
  { label: "Herramientas", href: "#tools" },
] as const;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500">
              <Zap className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="font-heading text-[15px] font-700">
              Nit<span className="text-brand-400">ido</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.login}
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
            >
              Iniciar sesión
            </Link>
            <Link
              href={ROUTES.optimize}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/20"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile nav overlay */}
      <MobileNav links={NAV_LINKS} loginHref={ROUTES.login} />

      {/* Content */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500">
                  <Zap className="h-4 w-4 fill-white text-white" />
                </div>
                <span className="font-heading text-[15px] font-700">
                  Nit<span className="text-brand-400">ido</span>
                </span>
              </Link>
              <p className="max-w-xs text-xs text-muted-foreground">
                Transforma tus ideas en prompts estructurados y de alta calidad
                para cualquier herramienta de IA.
              </p>
            </div>

            <div className="flex gap-12">
              <div className="space-y-2.5">
                <p className="text-xs font-600 uppercase tracking-wider text-foreground">
                  Producto
                </p>
                <ul className="space-y-1.5">
                  <li>
                    <a
                      href="#features"
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Características
                    </a>
                  </li>
                  <li>
                    <a
                      href="#how-it-works"
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Cómo funciona
                    </a>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.optimize}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Comenzar
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-2.5">
                <p className="text-xs font-600 uppercase tracking-wider text-foreground">
                  Legal
                </p>
                <ul className="space-y-1.5">
                  <li>
                    <span className="text-xs text-muted-foreground">
                      Privacidad
                    </span>
                  </li>
                  <li>
                    <span className="text-xs text-muted-foreground">
                      Términos
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-border/50 pt-6 text-center">
            <p className="text-[11px] text-muted-foreground/60">
              &copy; {new Date().getFullYear()} Nitido. Todos los
              derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
