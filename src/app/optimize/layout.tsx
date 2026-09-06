import Link from "next/link";
import { Zap } from "lucide-react";
import { ROUTES } from "@/constants";

export default function OptimizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500">
              <Zap className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="font-heading text-[15px] font-700">
              Nit<span className="text-brand-400">ido</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.login}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Iniciar sesión
            </Link>
            <Link
              href={ROUTES.dashboard}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/20"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-14 flex-1 flex flex-col">{children}</main>
    </div>
  );
}
