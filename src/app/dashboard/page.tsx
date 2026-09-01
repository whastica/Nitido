export default function DashboardPage() {
  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bienvenido a PromptOptimizer
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Prompts generados</p>
          <p className="font-heading text-2xl font-bold mt-1">0</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Tiempo ahorrado</p>
          <p className="font-heading text-2xl font-bold mt-1">0 min</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Calidad promedio</p>
          <p className="font-heading text-2xl font-bold mt-1">--</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Esta semana</p>
          <p className="font-heading text-2xl font-bold mt-1">0</p>
        </div>
      </div>
    </div>
  );
}
