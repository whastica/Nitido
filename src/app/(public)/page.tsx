import Link from "next/link";
import {
  Zap,
  FileText,
  Mic,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Star,
  MessageSquareCode,
  Image,
  BrainCircuit,
  Copy,
  BarChart3,
} from "lucide-react";
import { ROUTES } from "@/constants";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Optimización con IA",
    description:
      "Motor de inteligencia artificial que transforma ideas brutas en prompts profesionales y efectivos.",
  },
  {
    icon: FileText,
    title: "Múltiples fuentes",
    description:
      "Escribe texto directamente, sube un PDF, DOCX o TXT, o graba tu voz — la app se adapta a ti.",
  },
  {
    icon: Sparkles,
    title: "Estructura profesional",
    description:
      "Cada prompt incluye rol, contexto, instrucciones, formato de salida y limitaciones claras.",
  },
  {
    icon: BarChart3,
    title: "Score de calidad",
    description:
      "Puntuación instantánea y checklist de calidad para que sepas qué tan bueno es tu prompt.",
  },
  {
    icon: MessageSquareCode,
    title: "Multi-herramienta",
    description:
      "Optimiza para chatbots, agentes de código o generadores de imágenes — elige tu destino.",
  },
  {
    icon: Copy,
    title: "Copia y usa",
    description:
      "Un clic para copiar el prompt completo o por secciones. Listo para pegar en tu herramienta de IA favorita.",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Describe tu idea",
    description:
      "Escribe lo que necesitas, sube un documento o habla al micrófono. No necesitas ser preciso.",
  },
  {
    number: "2",
    title: "Configura y optimiza",
    description:
      "Elige la herramienta destino, idioma, formato de salida y nivel de detalle. La IA hace el resto.",
  },
  {
    number: "3",
    title: "Copia y usa",
    description:
      "Obtén tu prompt optimizado con score de calidad. Cópialo y úsalo directamente en ChatGPT, Claude o la que prefieras.",
  },
];

const TOOLS = [
  {
    icon: MessageSquareCode,
    name: "Chatbots",
    examples: "ChatGPT, Claude, Gemini",
    color: "brand" as const,
  },
  {
    icon: Zap,
    name: "Agentes de código",
    examples: "Claude Code, OpenCode",
    color: "green" as const,
  },
  {
    icon: Image,
    name: "Imágenes con IA",
    examples: "DALL-E, Midjourney",
    color: "amber" as const,
  },
];

const TOOL_COLORS = {
  brand: "bg-brand-500/10 text-brand-400 border-brand-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
} as const;

const TESTIMONIALS = [
  {
    name: "María G.",
    role: "Marketing Manager",
    text: "Pasaba 30 minutos redactando prompts. Ahora obtengo mejores resultados en menos de 2 minutos. PromptOptimizer cambió mi flujo de trabajo.",
  },
  {
    name: "Carlos R.",
    role: "Desarrollador Full Stack",
    text: "La función de agentes de código es increíble. Mis prompts para Claude Code mejoraron un 300% en claridad y efectividad.",
  },
  {
    name: "Ana L.",
    role: "Diseñadora Freelance",
    text: "Uso la función de voz para dictar mis ideas y la IA las transforma en prompts perfectos para Midjourney. Genial.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-500/15 blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
              <span className="text-[10px] font-700 uppercase tracking-widest text-brand-300">
                Beta gratuita
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-4xl font-800 tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Transforma tus ideas en{" "}
              <span className="gradient-text">prompts perfectos</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-base text-muted-foreground leading-relaxed sm:text-lg">
              Optimiza tus prompts con inteligencia artificial. Obtén
              instrucciones claras, estructuradas y listas para usar en
              cualquier herramienta de IA.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href={ROUTES.login}
                className="group flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-600 text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30"
              >
                Comenzar gratis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-border/80 hover:text-foreground"
              >
                Ver cómo funciona
              </a>
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-3 gap-6 sm:gap-10">
              {[
                { value: "3x", label: "Prompts más efectivos" },
                { value: "95%", label: "Precisión en intención" },
                { value: "<2 min", label: "Tiempo promedio" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-heading text-2xl font-700 text-foreground sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" className="relative border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <p className="text-[10px] font-700 uppercase tracking-widest text-brand-400">
              Características
            </p>
            <h2 className="mt-2 font-heading text-2xl font-700 text-foreground sm:text-3xl">
              Todo lo que necesitas para crear prompts perfectos
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Herramientas diseñadas para que obtengas los mejores resultados de
              la IA.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border/60 bg-card/40 p-5 transition-all duration-200 hover:border-brand-500/20 hover:bg-card/60"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 transition-colors group-hover:bg-brand-500/15">
                  <feature.icon className="h-5 w-5 text-brand-400" />
                </div>
                <h3 className="font-heading text-sm font-600 text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section
        id="how-it-works"
        className="relative border-t border-border/50 bg-card/20"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <p className="text-[10px] font-700 uppercase tracking-widest text-brand-400">
              Cómo funciona
            </p>
            <h2 className="mt-2 font-heading text-2xl font-700 text-foreground sm:text-3xl">
              Optimiza tu prompt en tres pasos
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Sin configuraciones complicadas. Describe, configura y copia.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative text-center">
                {/* Connector line (hidden on mobile and last item) */}
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[calc(50%+40px)] top-6 hidden h-px w-[calc(100%-80px)] bg-border sm:block" />
                )}

                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-500/30 bg-brand-500/10">
                  <span className="font-heading text-lg font-700 text-brand-400">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-heading text-sm font-600 text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TOOLS ═══════════════ */}
      <section id="tools" className="relative border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <p className="text-[10px] font-700 uppercase tracking-widest text-brand-400">
              Herramientas
            </p>
            <h2 className="mt-2 font-heading text-2xl font-700 text-foreground sm:text-3xl">
              Optimiza para la herramienta que uses
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Elige tu destino y la IA adapta el prompt al contexto ideal.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TOOLS.map((tool) => (
              <div
                key={tool.name}
                className="group rounded-xl border border-border/60 bg-card/40 p-6 text-center transition-all duration-200 hover:border-brand-500/20 hover:bg-card/60"
              >
                <div
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${TOOL_COLORS[tool.color]}`}
                >
                  <tool.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading text-sm font-600 text-foreground">
                  {tool.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tool.examples}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="relative border-t border-border/50 bg-card/20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="text-center">
            <p className="text-[10px] font-700 uppercase tracking-widest text-brand-400">
              Testimonios
            </p>
            <h2 className="mt-2 font-heading text-2xl font-700 text-foreground sm:text-3xl">
              Lo que dicen nuestros usuarios
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border/60 bg-card/40 p-5"
              >
                <div className="mb-3 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-4 border-t border-border/50 pt-3">
                  <p className="text-xs font-600 text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="relative overflow-hidden border-t border-border/50">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h2 className="font-heading text-2xl font-700 text-foreground sm:text-3xl">
            Optimiza tu primer prompt ahora
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Unete a los usuarios que ya transforman sus ideas en prompts
            efectivos. Gratis, sin tarjeta de crédito.
          </p>
          <Link
            href={ROUTES.login}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-3.5 text-sm font-600 text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30"
          >
            <CheckCircle2 className="h-4 w-4" />
            Comenzar gratis
          </Link>
          <p className="mt-4 text-[11px] text-muted-foreground/60">
            No se requiere tarjeta de crédito &middot; Beta gratuita
          </p>
        </div>
      </section>
    </>
  );
}
