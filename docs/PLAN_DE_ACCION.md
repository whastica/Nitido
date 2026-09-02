# Plan de Acción — PromptOptimizer

> Última actualización: 2026-09-02. Documento de referencia para continuar la implementación.
> **Estrategia:** Front-end primero con mocks → Back-end + DB después.

---

## Estado Actual

| Paso | Descripción | Estado |
|---|---|---|
| 1 | Crear repo, instalar deps, configurar proyecto base | ✅ Completado |
| 2 | Copiar y adaptar: layout, auth, UI components, lib utils | ✅ Completado |
| 3 | API routes upload/transcribe + types + constants base | ✅ Completado |
| 0 | **Nueva paleta de colores** (fondo verde-gris, brand menos saturado, accent ámbar, sin púrpura) | ✅ Completado |
| 4 | Actualizar tipos y constants (nueva config: targetTool, outputFormat) | ❌ Pendiente |
| 5 | UploadZone + VoiceInput (Web Speech API) | ❌ Pendiente |
| 6 | Componentes del optimizador (6 archivos) | ❌ Pendiente |
| 7 | Hooks con mocks (useOptimization, useHistory, useDashboard) | ❌ Pendiente |
| 8 | Páginas del dashboard (real optimize, history, settings) | ❌ Pendiente |
| 9 | API Routes mock (optimize, history, dashboard) | ❌ Pendiente |
| 10 | DB Schema + Migración Supabase | ❌ Pendiente |
| 11 | DB Services (prompts, dashboard) | ❌ Pendiente |
| 12 | Pipeline de IA real (4 etapas OpenAI) | ❌ Pendiente |
| 13 | Testing y build | ❌ Pendiente |

---

## Fase 0: Nueva Paleta de Colores (15 min) ✅

**Objetivo:** Eliminar toda la púrpura (herencia de StoryForge) y establecer la paleta verde-gris + esmeralda + ámbar. Refactorizar referencias hardcodeadas a usar variables CSS.

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 0.1 | Actualizar variables CSS | `src/styles/globals.css` | Cambiar las 16 variables de `:root`: background `150 8% 6%`, foreground `60 9% 94%`, card `150 7% 9%`, primary `158 64% 40%`, accent `32 70% 65%`, accent-foreground `20 40% 12%`, border/input `150 6% 16%`, ring `158 64% 40%`, secondary `150 6% 13%`, muted `150 6% 11%`, muted-foreground `150 5% 60%`. |
| 0.2 | Actualizar brand-500 | `src/styles/globals.css` | `--brand-500: 16 185 129` → `--brand-500: 16 163 116` (RGB del nuevo esmeralda menos saturado). |
| 0.3 | Refactorizar hardcodeados CSS | `src/styles/globals.css` | Reemplazar las 8 referencias `rgba(16, 185, 129, ...)` por `rgb(var(--brand-500) / ...)` en: `--surface-glow`, `::selection`, `.border-premium`, `.bg-premium-radial`, `.card-hover`, `.glow-brand`, `.glow-brand-sm`. |
| 0.4 | Actualizar Tailwind config | `tailwind.config.ts` | Actualizar paleta `brand` (hex values del nuevo esmeralda). Reemplazar `brand-glow: "rgba(16, 185, 129, 0.35)"` → `"rgb(var(--brand-500) / 0.35)"`. Actualizar keyframes `pulse-glow` con `rgb(var(--brand-500) / ...)`. |
| 0.5 | Verificar sin púrpura | `src/**/*.css`, `src/**/*.tsx`, `tailwind.config.ts` | Buscar y eliminar cualquier referencia a `hue 260`, `hue 255`, `hue 270`, `260`, `255`, `270` que indique color púrpura. Confirmar que accent es ámbar, no púrpura. |

### Paleta de Colores — Valores Finales

| Token | Valor HSL | Uso |
|---|---|---|
| `--background` | `150 8% 6%` | Fondo base (verde-gris casi negro) |
| `--foreground` | `60 9% 94%` | Texto principal (blanco cálido) |
| `--card` | `150 7% 9%` | Superficies / cards |
| `--primary` | `158 64% 40%` | Esmeralda menos saturado (marca) |
| `--accent` | `32 70% 65%` | Ámbar cálido (hover/focus states) |
| `--border` | `150 6% 16%` | Bordes sutiles |
| `--brand-500` | `16 163 116` (RGB) | Esmeralda para brand components |

### Variables CSS hardcodeadas a refactorizar

```css
/* ANTES → DESPUÉS */
--surface-glow: rgba(16, 185, 129, 0.10)  → rgb(var(--brand-500) / 0.10)
::selection     rgba(16, 185, 129, 0.25)  → rgb(var(--brand-500) / 0.25)
.border-premium rgba(16, 185, 129, 0.14)  → rgb(var(--brand-500) / 0.14)
.bg-premium-radial rgba(16,185,129,0.16) → rgb(var(--brand-500) / 0.16)
.card-hover     rgba(16,185,129,0.18)     → rgb(var(--brand-500) / 0.18)
.card-hover     rgba(16,185,129,0.05)     → rgb(var(--brand-500) / 0.05)
.glow-brand     rgba(16, 185, 129, 0.25)  → rgb(var(--brand-500) / 0.25)
.glow-brand-sm  rgba(16, 185, 129, 0.2)   → rgb(var(--brand-500) / 0.2)
```

---

## Fase 1: Actualizar Tipos y Constants (10 min) ❌

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 1.1 | Actualizar tipos dominio | `src/types/index.ts` | Cambiar `OutputFormat` a `"libre" \| "vietas" \| "tabla" \| "json" \| "codigo"`. Agregar `TargetTool = "chatbot" \| "codigo" \| "imagen"`. Actualizar `OptimizationConfig` a: `{ language: Language, detailLevel: DetailLevel, includeConstraints: boolean, targetTool: TargetTool, outputFormat: OutputFormat }`. |
| 1.2 | Agregar tipos voz | `src/types/index.ts` | Agregar `VoiceInputState = "idle" \| "listening" \| "processing" \| "error"` y `VoiceInputResult = { text: string, confidence: number, language: string }`. |
| 1.3 | Actualizar constants | `src/constants/index.ts` | Agregar `TARGET_TOOLS` (array: [{value, label}]), `OUTPUT_FORMATS` (array: [{value, label}]), `DEFAULT_OPTIMIZATION_CONFIG` (con los 5 campos nuevos). Verificar `ACCEPTED_FILE_TYPES` para UploadZone. |
| 1.4 | Verificar types pipeline | `src/types/index.ts` | Confirmar que `PipelineIntention`, `PipelineContext`, `PipelineGeneratedPrompt`, `PipelineValidation` y `Prompt` son consistentes con la nueva config. Ajustar si es necesario. |

---

## Fase 2: UploadZone + VoiceInput (15 min) ❌

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 2.1 | Copiar/adaptar UploadZone | `src/features/upload/UploadZone.tsx` | Copiar de StoryForge `features/upload/UploadZone.tsx` (355 líneas). Adaptar: imports de `ACCEPTED_FILE_TYPES` en vez de `ACCEPTED_DOCUMENT_TYPES`/`ACCEPTED_AUDIO_TYPES`. **Eliminar modo audio** (solo documentos: PDF/DOCX/TXT). Mantener drag-and-drop, progress simulado, llamada a `/api/upload`. |
| 2.2 | Crear VoiceInput | `src/features/upload/VoiceInput.tsx` | Componente nuevo. Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`). Botón mic on/off con animación (pulsante rojo), estado grabando, transcripción en tiempo real, resultado final. Soporta `es` y `en`. **Sin dependencias externas** (solo browser API). |
| 2.3 | Barrel export | `src/features/upload/index.ts` | Exportar `UploadZone` y `VoiceInput`. |

### Detalle VoiceInput
- Hooks: `useRef` para `SpeechRecognition` instance, `useState` para estado/texto/transcripción parcial
- Config: `{ continuous: true, interimResults: true, lang: "es-ES" }`
- Eventos: `onresult` (actualiza texto parcial), `onend` (reinicia si no hay resultado), `onerror` (maneja errores)
- UI: Botón circular con icono Mic de lucide-react, animación pulse cuando graba, texto transcripción debajo

---

## Fase 3: Componentes del Optimizador (25 min) ❌

| # | Tarea | Archivos | Fuente | Detalle |
|---|---|---|---|---|
| 3.1 | OptimizerContainer | `src/features/optimizer/OptimizerContainer.tsx` | `GeneratorContainer.tsx` | Orquestador principal. Estado: `OptimizationConfig`. Usa `useOptimization()` y `useLastOptimization()`. **Eliminar** dependencia `useActiveProject`. Layout: sidebar izquierda + results derecha. Invalidar caches `["dashboard"]`, `["history"]`, `["lastOptimization"]`. |
| 3.2 | OptimizerSidebar | `src/features/optimizer/OptimizerSidebar.tsx` | `GeneratorSidebar.tsx` | **Reemplazar** contenido. 3 tabs: Texto / Documento / Voz. Texto: textarea. Documento: `<UploadZone mode="document" />`. Voz: `<VoiceInput />`. Config: Select targetTool, Select outputFormat, Select detailLevel, Select language, Switch includeConstraints. Botón "Optimizar Prompt" con icono Sparkles. |
| 3.3 | OptimizerResults | `src/features/optimizer/OptimizerResults.tsx` | `GeneratorResults.tsx` | **Reemplazar** contenido. Header: quality score badge (colores según score), tokens usados, fuente. Secciones: prompt compacto (copy-all button), prompt estructurado (rol/contexto/tarea/instrucciones/formato en cards), mejoras aplicadas (lista). Botones: Copiar todo, Nuevo. **Sin** exportar Excel/PDF. |
| 3.4 | OptimizerLoader | `src/features/optimizer/OptimizerLoader.tsx` | `GeneratorLoader.tsx` | Adaptar labels pipeline: "Analizando intención", "Estructurando contexto", "Generando prompt", "Validando calidad". Tiempos estimados: `[15, 12, 18, 10]` segundos. Mantener: spinner, progress bar, step checklist con done/active/pending states. |
| 3.5 | OptimizerEmpty | `src/features/optimizer/OptimizerEmpty.tsx` | Nuevo | Estado vacío. Icono Sparkles. 3 pasos: "Escribe tu idea", "Configura opciones", "Optimiza con IA". Card glass effect. |
| 3.6 | PromptCard | `src/features/optimizer/PromptCard.tsx` | Nuevo | Card expandible/colapsable. Source type badge (colores por tipo: texto=azul, documento=verde, voz=morado), quality score badge, prompt compacto preview, fecha relativa. Copy button individual. |
| 3.7 | Barrel export | `src/features/optimizer/index.ts` | Nuevo | Exportar: OptimizerContainer, OptimizerSidebar, OptimizerResults, OptimizerLoader, OptimizerEmpty, PromptCard. |

### Detalle OptimizerSidebar — Tabs de Entrada

| Tab | Componente | Descripción |
|---|---|---|
| Texto | `<textarea>` | Textarea con placeholder "Ejemplo: Necesito que la IA me ayude a escribir emails de ventas..." |
| Documento | `<UploadZone>` | Drag-and-drop para PDF/DOCX/TXT. Muestra archivo seleccionado con opción de eliminar. |
| Voz | `<VoiceInput>` | Botón mic, transcripción en tiempo real, resultado final editable. |

### Detalle OptimizerSidebar — Configuración

| Campo | Tipo | Opciones |
|---|---|---|
| Herramienta destino | Select | Chatbot (ChatGPT/Claude/Gemini), Agente de código (Claude Code/OpenCode), Generador de imágenes |
| Formato de salida | Select | Texto libre, Lista/viñetas, Tabla, JSON/estructurado, Código |
| Nivel de detalle | Select | Básico, Estándar, Detallado |
| Idioma | Select | Español, Inglés |
| Incluir restricciones | Switch | on/off |

---

## Fase 4: Hooks con Mocks (15 min) ❌

| # | Tarea | Archivos | Fuente | Detalle |
|---|---|---|---|---|
| 4.1 | useOptimization | `src/hooks/useOptimization.ts` | `useGeneration.ts` | Copiar estructura SSE. Adaptar tipos: `OptimizationStatus`, `OptimizationStep`, `OptimizationResult`, `OptimizationConfig`. El `optimize()` llama a `/api/optimize`. Cuando `USE_MOCK_AI=true`: simula 4 pasos con setTimeout (15s, 12s, 18s, 10s) y retorna mock result. Cuando `USE_MOCK_AI=false`: lee SSE events del endpoint. Retorno: `{ status, steps, progress, result, error, optimize(), reset() }`. |
| 4.2 | useLastOptimization | `src/hooks/useLastOptimization.ts` | `useLastGeneration.ts` | Cambiar tipo a `OptimizationResult`, query key `["lastOptimization"]`, staleTime Infinity. Retorno: `{ result, setResult, clearResult }`. |
| 4.3 | useHistory | `src/hooks/useHistory.ts` | Nuevo | `useQuery` que llama a `/api/history`. Tipo: `HistoryItem[]` (id, inputText, sourceType, generatedPrompt, qualityScore, createdAt). Mock: retorna array vacío. |
| 4.4 | useDashboard | `src/hooks/useDashboard.ts` | Nuevo | `useQuery` que llama a `/api/dashboard`. Tipo: `DashboardData` (totalPrompts, avgQuality, totalTokens, timeSaved, recentPrompts). Mock: retorna stats hardcodeadas. |

---

## Fase 5: Páginas del Dashboard (15 min) ❌

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 5.1 | Dashboard page real | `src/app/dashboard/page.tsx` | Reemplazar stats hardcoded. Usar `useDashboard()`. 4 StatCards reutilizando `components/shared/StatCard.tsx` (prompts generados, calidad promedio, tokens usados, tiempo ahorrado). Recent activity list (últimos 5 prompts). |
| 5.2 | Optimize page real | `src/app/dashboard/optimize/page.tsx` | Reemplazar textarea bare. Importar y renderizar `<OptimizerContainer />`. |
| 5.3 | History page real | `src/app/dashboard/history/page.tsx` | Reemplazar empty state. Lista de `PromptCard` con datos mock. Filtros por fecha/fuente (Select). Usa `useHistory()`. |
| 5.4 | Settings page nueva | `src/app/dashboard/settings/page.tsx` | **Crear**. Formulario de configuración del optimizador (targetTool, outputFormat, language, detailLevel, includeConstraints). Guarda defaults en localStorage. Botón "Guardar configuración". |

---

## Fase 6: API Routes Mock (10 min) ❌

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 6.1 | API route optimize | `src/app/api/optimize/route.ts` | POST handler. Valida input con Zod (text: string, config: OptimizationConfig). Cuando `USE_MOCK_AI=true`: retorna SSE con 4 progress events y mock result hardcoded después de delays progresivos. Cuando `USE_MOCK_AI=false`: llama a `runOptimizationPipeline()` (pendiente Fase 12). Copiar patrón de `src/app/api/generate/route.ts` de StoryForge. |
| 6.2 | API route history | `src/app/api/history/route.ts` | GET handler. Mock: retorna array de 3-5 prompts mock con datos variados. |
| 6.3 | API route dashboard | `src/app/api/dashboard/route.ts` | GET handler. Mock: retorna `{ totalPrompts: 12, avgQuality: 85, totalTokens: 45000, timeSaved: 180, recentPrompts: [...] }`. |

### Detalle Mock Optimize Response

```typescript
// Mock result hardcodeado
{
  id: "mock-001",
  prompt: {
    inputText: "[texto del usuario]",
    sourceType: "text",
    generatedPrompt: "Eres un experto en marketing digital...",
    structuredPrompt: {
      rol_sistema: "Experto en marketing digital",
      contexto: "[contexto extraído del input]",
      tarea: "[tarea principal identificada]",
      instrucciones: ["Paso 1...", "Paso 2...", "Paso 3..."],
      formato_salida: "Texto estructurado con párrafos claros",
      ejemplos: ["Ejemplo 1..."],
      limitaciones: ["No usar jerga técnica"],
      pregunta_clave: "¿Cuál es el objetivo principal?"
    },
    compactPrompt: "Eres un experto en marketing digital. [prompt compacto]...",
    qualityScore: 87,
    qualityChecklist: { claridad: true, especificidad: true, contexto_completo: true, formato_definido: true, ejemplos_incluidos: false },
    improvements: ["Se agregó contexto específico", "Se definieron instrucciones paso a paso"]
  },
  tokensUsed: 1250,
  config: { language: "es", detailLevel: "standard", targetTool: "chatbot", outputFormat: "libre", includeConstraints: true }
}
```

---

## Fase 7: DB Schema + Migración (15 min) ❌

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 7.1 | Crear migración SQL | `supabase/migrations/001_initial_schema.sql` | Tabla `prompts`: id (uuid), user_id (text), source_type (text), source_metadata (jsonb), input_text (text), generated_prompt (text), structured_prompt (jsonb), compact_prompt (text), quality_score (int), quality_checklist (jsonb), improvements (text[]), tokens_used (int), latency_ms (int), created_at (timestamptz). Tabla `prompt_generations`: id (uuid), user_id (text), prompt_id (uuid refs prompts), source_type (text), config (jsonb), tokens_used (int), latency_ms (int), pipeline_stages (jsonb), created_at (timestamptz). Índices en user_id y created_at. |
| 7.2 | Verificar supabase types | `src/lib/supabase.ts` | Los types `DbPrompt` y `DbPromptGeneration` ya existen. Verificar que coinciden con el schema SQL. Ajustar si es necesario. |

---

## Fase 8: DB Services (15 min) ❌

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 8.1 | DB service prompts | `src/services/db/prompts.service.ts` | CRUD: `savePrompt(data)`, `getPromptsByUser(userId, limit?)`, `getPromptById(id)`, `deletePrompt(id)`. Usa `getSupabaseServer()`. Tipos: `DbPrompt`. |
| 8.2 | DB service dashboard | `src/services/db/dashboard.service.ts` | `getDashboardData(userId)`: 4 queries paralelas (count prompts, avg quality, sum tokens, recent 5). Retorna `DashboardData`. Adaptar de StoryForge pero simplificado (sin projects/stories). |

---

## Fase 9: API Routes Reales (10 min) ❌

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 9.1 | Actualizar route optimize | `src/app/api/optimize/route.ts` | Cuando `USE_MOCK_DB=false`: llamar `savePrompt()` y `saveGeneration()` después de pipeline exitoso. |
| 9.2 | Actualizar route history | `src/app/api/history/route.ts` | Cuando `USE_MOCK_DB=false`: llamar `getPromptsByUser()`. |
| 9.3 | Actualizar route dashboard | `src/app/api/dashboard/route.ts` | Cuando `USE_MOCK_DB=false`: llamar `getDashboardData()`. |

---

## Fase 10: Pipeline de IA Real (45 min) ❌

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 10.1 | Servicio OpenAI base | `src/services/ai/openai.service.ts` | Cliente OpenAI singleton, helpers `parseJSON()`, `withRetry()`. Constantes: `PIPELINE_MODEL = "gpt-4o-mini"`, `AI_TEMPERATURE = 0.3`. |
| 10.2 | P1: Analizar Intención | `openai.service.ts` | Prompt sistema: "Eres un Experto Ingeniero de Prompts". Input: texto procesado + config (targetTool, outputFormat). Output: `PipelineIntention`. Max tokens: 1024. |
| 10.3 | P2: Estructurar Contexto | `openai.service.ts` | Prompt sistema: "Eres un Arquitecto de Información Senior". Input: `PipelineIntention` + config. Output: `PipelineContext`. Max tokens: 1024. |
| 10.4 | P3: Generar Prompt | `openai.service.ts` | Prompt sistema: "Eres un Maestro Ingeniero de Prompts (15+ años)". Input: `PipelineIntention` + `PipelineContext` + config (targetTool determina formato). Output: `PipelineGeneratedPrompt`. Max tokens: 4096. |
| 10.5 | P4: Validar y Refinar | `openai.service.ts` | Prompt sistema: "Eres un Experto en Garantía de Calidad de Prompts". Input: prompt generado. Output: `PipelineValidation` (score 0-100, checklist, prompt_final, sugerencias). Max tokens: 2048. |
| 10.6 | `runOptimizationPipeline()` | `openai.service.ts` | Orquesta P1→P2→P3→P4, emite progress vía callback, retorna `OptimizationResult`. Summarization si texto >3000 chars. Retry en cada etapa. Recibe `OptimizationConfig` para adaptar prompts del sistema. |
| 10.7 | Mock service | `src/services/ai/optimization.service.ts` | `runMockPipeline()` para `USE_MOCK_AI=true`. Retorna resultado hardcoded con delay simulado. |
| 10.8 | Conectar API route | `src/app/api/optimize/route.ts` | Cuando `USE_MOCK_AI=false`: usar `runOptimizationPipeline()`. Cuando `true`: usar `runMockPipeline()`. |

---

## Fase 11: Testing y Build (10 min) ❌

| # | Tarea | Detalle |
|---|---|---|
| 11.1 | Type check | `npx tsc --noEmit` — verificar 0 errores |
| 11.2 | Build test | `npm run build` — verificar que compila sin errores |
| 11.3 | Flujo completo | Probar: login → escribir texto → configurar → optimizar → ver resultado → copiar |
| 11.4 | Upload test | Probar: subir PDF → verificar extracción de texto → optimizar |
| 11.5 | Voice test | Probar: click mic → hablar → verificar transcripción → optimizar |
| 11.6 | History test | Verificar que los prompts generados aparecen en historial |
| 11.7 | Dashboard test | Verificar que las stats se muestran correctamente |
| 11.8 | Settings test | Verificar que la configuración se guarda y persiste |

---

## Resumen de Archivos

### Crear (25 archivos)

```
src/features/upload/VoiceInput.tsx
src/features/upload/index.ts
src/features/optimizer/OptimizerContainer.tsx
src/features/optimizer/OptimizerSidebar.tsx
src/features/optimizer/OptimizerResults.tsx
src/features/optimizer/OptimizerLoader.tsx
src/features/optimizer/OptimizerEmpty.tsx
src/features/optimizer/PromptCard.tsx
src/features/optimizer/index.ts
src/hooks/useOptimization.ts
src/hooks/useLastOptimization.ts
src/hooks/useHistory.ts
src/hooks/useDashboard.ts
src/app/api/optimize/route.ts
src/app/api/history/route.ts
src/app/api/dashboard/route.ts
src/app/dashboard/settings/page.tsx
src/services/ai/openai.service.ts
src/services/ai/optimization.service.ts
src/services/db/prompts.service.ts
src/services/db/dashboard.service.ts
supabase/migrations/001_initial_schema.sql
```

### Copiar/Adaptar de StoryForge (5 archivos)

```
src/features/upload/UploadZone.tsx           ← de features/upload/UploadZone.tsx
src/features/optimizer/OptimizerContainer.tsx ← patrón de GeneratorContainer.tsx
src/features/optimizer/OptimizerSidebar.tsx   ← patrón de GeneratorSidebar.tsx
src/features/optimizer/OptimizerResults.tsx   ← patrón de GeneratorResults.tsx
src/features/optimizer/OptimizerLoader.tsx    ← patrón de GeneratorLoader.tsx
```

### Modificar (7 archivos)

```
src/types/index.ts
src/constants/index.ts
src/app/dashboard/page.tsx
src/app/dashboard/optimize/page.tsx
src/app/dashboard/history/page.tsx
src/app/api/optimize/route.ts (cuando exista)
src/app/api/history/route.ts (cuando exista)
```

---

## Orden de Ejecución

```
Fase 0  (Paleta de colores)        ── PRIMERO (~15 min)
Fase 1  (Tipos/Constants)          ─┐
Fase 2  (UploadZone + VoiceInput)   │ Front-end
Fase 3  (Componentes Optimizador)   │ con mocks
Fase 4  (Hooks con mocks)           │ (~1.5h)
Fase 5  (Páginas Dashboard)         │
Fase 6  (API Routes mock)          ─┘
──────────────────────────────────────
Fase 7  (DB Schema)                ─┐
Fase 8  (DB Services)               │ Back-end
Fase 9  (API Routes reales)         │ + DB
Fase 10 (Pipeline IA real)         ─┘ (~1.5h)
──────────────────────────────────────
Fase 11 (Testing y Build)           ── (~10 min)
```

**Tiempo estimado total: ~3.25 horas**

---

## Stack Técnico

- Next.js 16 + TypeScript 6
- Tailwind CSS + shadcn/ui
- Clerk (Google OAuth) — deshabilitado, usar mock dev-user-mock
- Supabase (PostgreSQL)
- OpenAI (gpt-4o-mini) — sin Whisper, usar Web Speech API
- TanStack React Query
- Upstash Redis (rate limiting)
- react-dropzone (upload de archivos)
- Web Speech API (transcripción de voz del navegador)

## Paleta de Colores

- **Fondo**: Verde-gris oscuro (`hsl(150 8% 6%)`)
- **Primary**: Esmeralda menos saturado (`hsl(158 64% 40%)` / brand-500 `rgb(16, 163, 116)`)
- **Accent**: Ámbar cálido (`hsl(32 70% 65%)`) — hover/focus states
- **Foreground**: Blanco cálido (`hsl(60 9% 94%)`)
- **Border**: Verde-gris sutil (`hsl(150 6% 16%)`)
- **Sin púrpura** en ningún archivo del proyecto

## Referencia de StoryForge

Los componentes se copian/adaptan de `D:\Proyectos\storyforge\src\`:
- `features/upload/UploadZone.tsx` → `features/upload/UploadZone.tsx`
- `features/generation/GeneratorContainer.tsx` → `features/optimizer/OptimizerContainer.tsx`
- `features/generation/GeneratorSidebar.tsx` → `features/optimizer/OptimizerSidebar.tsx`
- `features/generation/GeneratorResults.tsx` → `features/optimizer/OptimizerResults.tsx`
- `features/generation/GeneratorLoader.tsx` → `features/optimizer/OptimizerLoader.tsx`
- `hooks/useGeneration.ts` → `hooks/useOptimization.ts`
- `hooks/useLastGeneration.ts` → `hooks/useLastOptimization.ts`

**Nota:** StoryForge NO tiene componente VoiceInput ni VoiceRecorder. VoiceInput se crea desde cero usando Web Speech API del navegador.
