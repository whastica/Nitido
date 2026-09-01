export default function OptimizePage() {
  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Optimizar Prompt</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Escribe tu idea y conviértela en un prompt de alta calidad
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <textarea
          placeholder="Ejemplo: Necesito que la IA me ayude a escriber emails de ventas para mi negocio de cosméticos naturales dirigidos a mujeres de 25-40 años..."
          className="w-full h-40 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
        />
      </div>
    </div>
  );
}
