import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError, catchApiError } from "@/lib/api";
import { getOptionalAuth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { useMockAI, useMockDB, env } from "@/lib/env";
import { savePrompt, saveGeneration } from "@/services/db/prompts.service";
import type {
  OptimizationResult,
  OptimizationConfig,
  InputSourceType,
  StructuredPrompt,
  QualityChecklist,
  SSEEvent,
} from "@/types";

const requestSchema = z.object({
  text: z.string().min(20, "El texto debe tener al menos 20 caracteres"),
  sourceType: z.enum(["text", "pdf", "docx", "txt", "voice"]),
  config: z.object({
    language: z.enum(["es", "en"]),
    detailLevel: z.enum(["basic", "standard", "detailed"]),
    includeConstraints: z.boolean(),
    targetTool: z.enum(["chatbot", "codigo", "imagen"]),
    outputFormat: z.enum(["libre", "vietas", "tabla", "json", "codigo"]),
  }),
});

function sendEvent(controller: ReadableStreamDefaultController, encoder: TextEncoder, event: SSEEvent) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  controller.enqueue(encoder.encode(data));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockOptimizationPipeline(
  text: string,
  sourceType: InputSourceType,
  config: OptimizationConfig,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  requestId: string
): Promise<OptimizationResult> {
  logger.info("optimize: starting mock pipeline", { requestId, sourceType, language: config.language });

  sendEvent(controller, encoder, { type: "progress", phase: "analyzing", stepIndex: 0, totalSteps: 4, message: "Analizando intención del prompt..." });
  await delay(800);

  sendEvent(controller, encoder, { type: "progress", phase: "structuring", stepIndex: 1, totalSteps: 4, message: "Estructurando contexto..." });
  await delay(600);

  sendEvent(controller, encoder, { type: "progress", phase: "generating", stepIndex: 2, totalSteps: 4, message: "Generando prompt optimizado..." });
  await delay(1000);

  sendEvent(controller, encoder, { type: "progress", phase: "validating", stepIndex: 3, totalSteps: 4, message: "Validando calidad del prompt..." });
  await delay(500);

  const structured: StructuredPrompt = {
    rol_sistema: "Eres un asistente experto en " + (config.targetTool === "chatbot" ? "comunicación y marketing" : config.targetTool === "codigo" ? "desarrollo de software" : "creación de imágenes"),
    contexto: `El usuario necesita ayuda con una tarea relacionada a: ${text.slice(0, 200)}`,
    tarea: "Proporcionar una respuesta clara, específica y útil según la solicitud del usuario",
    instrucciones: [
      "Analiza cuidadosamente la solicitud del usuario",
      "Proporciona una respuesta detallada y bien estructurada",
      "Incluye ejemplos cuando sea apropiado",
      "Mantén un tono profesional y helpful",
    ],
    formato_salida: config.outputFormat === "json" ? "JSON estructurado" : config.outputFormat === "tabla" ? "Tabla markdown" : config.outputFormat === "vietas" ? "Lista con viñetas" : config.outputFormat === "codigo" ? "Bloque de código" : "Texto libre con párrafos claros",
    ejemplos: [
      "Ejemplo de solicitud: " + text.slice(0, 100) + "...",
      "Ejemplo de respuesta esperada: Respuesta estructurada con los puntos clave",
    ],
    limitaciones: config.includeConstraints
      ? [
          "No inventes información que no esté en la solicitud",
          "Si falta información relevante, pregúntala antes de responder",
          "Mantén la respuesta concisa pero completa",
        ]
      : [],
    pregunta_clave: "¿Cuál es el objetivo principal de esta solicitud?",
  };

  const compactPrompt = `[Rol: ${structured.rol_sistema}]\n\n[Contexto: ${structured.contexto}]\n\n[Tarea: ${structured.tarea}]\n\n[Instrucciones:\n${structured.instrucciones.map((i) => `- ${i}`).join("\n")}]\n\n[Formato: ${structured.formato_salida}]\n\n${structured.limitaciones.length > 0 ? `[Limitaciones:\n${structured.limitaciones.map((l) => `- ${l}`).join("\n")}]\n\n` : ""}[Pregunta clave: ${structured.pregunta_clave}]`;

  const checklist: QualityChecklist = {
    claridad: true,
    especificidad: true,
    contexto_completo: true,
    formato_definido: true,
    ejemplos_incluidos: true,
  };

  const improvements = [
    "Se estructuró el prompt con un rol claro y definido",
    "Se agregaron instrucciones específicas para guiar la respuesta",
    "Se definió el formato de salida esperado",
    "Se incluyeron ejemplos para mayor claridad",
    ...(config.includeConstraints ? ["Se agregaron limitaciones para evitar respuestas fuera de contexto"] : []),
  ];

  const result: OptimizationResult = {
    id: `opt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    prompt: {
      id: `prompt_${Date.now()}`,
      inputText: text,
      sourceType,
      generatedPrompt: compactPrompt,
      structuredPrompt: structured,
      compactPrompt,
      qualityScore: 88,
      qualityChecklist: checklist,
      improvements,
      tokensUsed: Math.floor(Math.random() * 500) + 200,
      latencyMs: Math.floor(Math.random() * 2000) + 1000,
      createdAt: new Date(),
    },
    generatedAt: new Date(),
    sourceType,
    config,
    tokensUsed: Math.floor(Math.random() * 500) + 200,
  };

  sendEvent(controller, encoder, { type: "result", data: result });
  logger.info("optimize: mock pipeline completed", { requestId, qualityScore: result.prompt.qualityScore });

  return result;
}

async function openAIOptimizationPipeline(
  text: string,
  sourceType: InputSourceType,
  config: OptimizationConfig,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  requestId: string
): Promise<OptimizationResult> {
  const { default: OpenAI } = await import("openai");

  if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === "sk-placeholder") {
    throw new Error("OPENAI_API_KEY no está configurada. Agrégala a .env.local o usa USE_MOCK_AI=true");
  }

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  logger.info("optimize: starting OpenAI pipeline", { requestId, sourceType, language: config.language });

  sendEvent(controller, encoder, { type: "progress", phase: "analyzing", stepIndex: 0, totalSteps: 4, message: "Analizando intención del prompt..." });

  const langLabel = config.language === "es" ? "español" : "inglés";
  const toolLabel = config.targetTool === "chatbot" ? "chatbots conversacionales (ChatGPT, Claude, Gemini)" : config.targetTool === "codigo" ? "agentes de código (Claude Code, OpenCode)" : "generadores de imágenes (DALL-E, Midjourney)";

  const systemPrompt = `Eres un experto en ingeniería de prompts. Tu tarea es transformar ideas brutas en prompts optimizados y estructurados.

REGLAS:
- Responde ÚNICAMENTE con JSON válido, sin texto adicional
- Usa el idioma: ${langLabel}
- El prompt debe estar optimizado para: ${toolLabel}
- Nivel de detalle: ${config.detailLevel}
- Formato de salida preferido: ${config.outputFormat}
${config.includeConstraints ? "- Incluye restricciones y limitaciones relevantes" : ""}

RESPONDE CON ESTE JSON EXACTO:
{
  "structuredPrompt": {
    "rol_sistema": "...",
    "contexto": "...",
    "tarea": "...",
    "instrucciones": ["..."],
    "formato_salida": "...",
    "ejemplos": ["..."],
    "limitaciones": ["..."],
    "pregunta_clave": "..."
  },
  "qualityScore": 85,
  "improvements": ["..."]
}`;

  const userMessage = `Transforma esta idea en un prompt optimizado:

"${text}"

Tipo de fuente: ${sourceType}
Herramienta destino: ${toolLabel}
Formato de salida: ${config.outputFormat}`;

  sendEvent(controller, encoder, { type: "progress", phase: "structuring", stepIndex: 1, totalSteps: 4, message: "Estructurando contexto..." });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: env.AI_TEMPERATURE,
    response_format: { type: "json_object" },
  });

  sendEvent(controller, encoder, { type: "progress", phase: "generating", stepIndex: 2, totalSteps: 4, message: "Generando prompt optimizado..." });

  const rawContent = completion.choices[0]?.message?.content;
  if (!rawContent) throw new Error("OpenAI no retornó contenido");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error("La respuesta de OpenAI no es JSON válido");
  }

  const sp = parsed.structuredPrompt as StructuredPrompt;
  const qualityScore = typeof parsed.qualityScore === "number" ? parsed.qualityScore : 75;
  const improvements = Array.isArray(parsed.improvements) ? parsed.improvements as string[] : [];

  if (!sp?.rol_sistema || !sp?.tarea) {
    throw new Error("La respuesta de OpenAI no tiene la estructura esperada");
  }

  sendEvent(controller, encoder, { type: "progress", phase: "validating", stepIndex: 3, totalSteps: 4, message: "Validando calidad del prompt..." });

  const compactPrompt = `[Rol: ${sp.rol_sistema}]\n\n[Contexto: ${sp.contexto}]\n\n[Tarea: ${sp.tarea}]\n\n[Instrucciones:\n${sp.instrucciones.map((i) => `- ${i}`).join("\n")}]\n\n[Formato: ${sp.formato_salida}]\n\n${sp.limitaciones.length > 0 ? `[Limitaciones:\n${sp.limitaciones.map((l) => `- ${l}`).join("\n")}]\n\n` : ""}[Pregunta clave: ${sp.pregunta_clave}]`;

  const checklist: QualityChecklist = {
    claridad: sp.tarea.length > 20,
    especificidad: sp.instrucciones.length >= 2,
    contexto_completo: sp.contexto.length > 30,
    formato_definido: sp.formato_salida.length > 0,
    ejemplos_incluidos: sp.ejemplos.length > 0,
  };

  const result: OptimizationResult = {
    id: `opt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    prompt: {
      id: `prompt_${Date.now()}`,
      inputText: text,
      sourceType,
      generatedPrompt: compactPrompt,
      structuredPrompt: sp,
      compactPrompt,
      qualityScore,
      qualityChecklist: checklist,
      improvements,
      tokensUsed: completion.usage?.total_tokens,
      latencyMs: 0,
      createdAt: new Date(),
    },
    generatedAt: new Date(),
    sourceType,
    config,
    tokensUsed: completion.usage?.total_tokens,
  };

  sendEvent(controller, encoder, { type: "result", data: result });
  logger.info("optimize: OpenAI pipeline completed", { requestId, qualityScore, tokensUsed: completion.usage?.total_tokens });

  return result;
}

export async function POST(req: NextRequest) {
  return catchApiError(async () => {
    const authCtx = await getOptionalAuth();
    const userId = authCtx?.userId ?? null;
    const requestId = `opt_${Date.now()}`;
    logger.info("optimize: request received", { requestId, authenticated: !!userId });

    const rateLimit = await checkRateLimit(getClientIp(req));
    if (!rateLimit.allowed) {
      return apiError("RATE_LIMITED", `Demasiadas solicitudes. Intenta de nuevo en ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} segundos.`);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "El body de la solicitud debe ser JSON válido");
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({ path: e.path.join("."), message: e.message }));
      return apiError("BAD_REQUEST", "Datos de entrada inválidos", 400, details);
    }

    const { text, sourceType, config } = parsed.data;

    const stream = new ReadableStream({
      start: async (controller) => {
        const encoder = new TextEncoder();
        try {
          let result: OptimizationResult;
          if (useMockAI) {
            result = await mockOptimizationPipeline(text, sourceType, config, controller, encoder, requestId);
          } else {
            result = await openAIOptimizationPipeline(text, sourceType, config, controller, encoder, requestId);
          }

          if (!useMockDB && userId) {
            try {
              const savedPrompt = await savePrompt({
                userId,
                sourceType,
                inputText: text,
                generatedPrompt: result.prompt.generatedPrompt,
                structuredPrompt: result.prompt.structuredPrompt as unknown as Record<string, unknown>,
                compactPrompt: result.prompt.compactPrompt,
                qualityScore: result.prompt.qualityScore,
                qualityChecklist: result.prompt.qualityChecklist as unknown as Record<string, unknown>,
                improvements: result.prompt.improvements,
                tokensUsed: result.tokensUsed,
                latencyMs: result.prompt.latencyMs,
              });

              await saveGeneration({
                userId,
                promptId: savedPrompt.id,
                sourceType,
                config: config as unknown as Record<string, unknown>,
                tokensUsed: result.tokensUsed,
                latencyMs: result.prompt.latencyMs,
              });

              logger.info("optimize: saved to database", { requestId, promptId: savedPrompt.id });
            } catch (dbError) {
              logger.error("optimize: failed to save to database", {
                requestId,
                error: dbError instanceof Error ? dbError.message : "Unknown DB error",
              });
            }
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Error desconocido en la optimización";
          logger.error("optimize: pipeline failed", { requestId, error: message });
          sendEvent(controller, encoder, { type: "error", code: "AI_ERROR", message });
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  });
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204 });
}
