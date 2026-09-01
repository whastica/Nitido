import { Zap, Target, Clock } from "lucide-react";

const STATS = [
  { icon: Zap,    value: "3x",      label: "Prompts más efectivos",     color: "brand" as const },
  { icon: Target, value: "95%",     label: "Precisión en la intención", color: "green" as const },
  { icon: Clock,  value: "2 min",   label: "Tiempo promedio",           color: "amber" as const },
];

const COLOR_MAP = {
  brand: "bg-brand-500/10 text-brand-400",
  green: "bg-green-500/10 text-green-400",
  amber: "bg-amber-500/10 text-amber-400",
} as const;

export function AuthVisualPanel() {
  return (
    <div className="hidden md:flex flex-col justify-between p-8 bg-muted/20 border-r border-border relative overflow-hidden">
      <div
        className="absolute inset-0 bg-grid opacity-40 pointer-events-none"
        style={{
          maskImage: "radial-gradient(ellipse at 30% 40%, black 15%, transparent 66%)",
          WebkitMaskImage: "radial-gradient(ellipse at 30% 40%, black 15%, transparent 66%)",
        }}
      />
      <div className="absolute -top-16 -left-20 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      <div className="relative z-10 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
          <span className="text-[10px] font-700 uppercase tracking-widest text-brand-300">
            PromptOptimizer
          </span>
        </div>
        <h2 className="font-heading text-2xl font-800 text-foreground leading-tight">
          Optimiza tus prompts{" "}
          <em className="not-italic text-brand-300">con IA</em>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          Transforma tus ideas en prompts estructurados y de alta calidad para cualquier herramienta de IA.
        </p>
      </div>
      <div className="relative z-10 space-y-2.5">
        {STATS.map((s, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 backdrop-blur-sm">
            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${COLOR_MAP[s.color]}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-heading text-base font-700 text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
