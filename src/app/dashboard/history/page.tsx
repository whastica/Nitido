export default function HistoryPage() {
  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Historial</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Revisa los prompts que has generado anteriormente
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No hay prompts generados aún</p>
      </div>
    </div>
  );
}
