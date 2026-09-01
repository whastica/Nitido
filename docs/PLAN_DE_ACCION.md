# Plan de Acción — PromptOptimizer

> Generado el 2026-09-01. Documento de referencia para continuar la implementación.

---

## Estado Actual

| Paso | Descripción | Estado |
|---|---|---|
| 1 | Crear repo, instalar deps, configurar proyecto base | ✅ Completado |
| 2 | Copiar y adaptar: layout, auth, UI components, lib utils | ✅ Completado |
| 3 | Copiar y adaptar: UploadZone, API routes (upload/transcribe) | ⚠️ API routes listas, **falta UploadZone** |
| 4 | Crear DB schema + migración Supabase | ❌ Pendiente |
| 5 | Implementar pipeline de IA (4 etapas) | ❌ Pendiente |
| 6 | Crear componentes del optimizador | ❌ Pendiente |
| 7 | Implementar hooks (useOptimization, useHistory, useDashboard) | ❌ Pendiente |
| 8 | Dashboard con métricas + historial | ❌ Pendiente |
| 9 | Testing y ajustes | ❌ Pendiente |

---

## Fase 3: Completar Upload + Constants (15 min)

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 3.1 | Crear UploadZone component | `src/features/upload/UploadZone.tsx` | Copiar de StoryForge, adaptar imports (`ACCEPTED_FILE_TYPES` en vez de `ACCEPTED_DOCUMENT_TYPES`), reemplazar `ACCEPTED_DOCUMENT_TYPES`/`ACCEPTED_AUDIO_TYPES` por `ACCEPTED_FILE_TYPES.document`/`.audio` |
| 3.2 | Actualizar constants | `src/constants/index.ts` | Agregar `ACCEPTED_DOCUMENT_TYPES`, `ACCEPTED_AUDIO_TYPES` (nombres compatibles con UploadZone de StoryForge), `DEFAULT_OPTIMIZATION_CONFIG` |

---

## Fase 4: DB Schema + Migración (15 min)

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 4.1 | Crear migración SQL | `supabase/migrations/001_initial_schema.sql` | Tablas: `prompts` (id, user_id, source_type, source_metadata, input_text, generated_prompt, structured_prompt, compact_prompt, quality_score, quality_checklist, improvements, tokens_used, latency_ms, created_at) + `prompt_generations` (id, user_id, prompt_id, source_type, config, tokens_used, latency_ms, pipeline_stages, created_at). Índices en `user_id` y `created_at` |
| 4.2 | Actualizar supabase types | `src/lib/supabase.ts` | Los types `DbPrompt` y `DbPromptGeneration` ya existen, verificar que coinciden con el schema |

---

## Fase 5: Pipeline de IA (45 min) — Componente Central

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 5.1 | Servicio OpenAI base | `src/services/ai/openai.service.ts` | Cliente OpenAI singleton, helper `parseJSON()`, helper `withRetry()`, const `PIPELINE_MODEL = "gpt-4o-mini"`, `AI_TEMPERATURE = 0.3` |
| 5.2 | P1: Analizar Intención | `openai.service.ts` | Prompt sistema: "Expert Prompt Engineer". Input: texto procesado. Output: `PipelineIntention` (tarea_principal, tipo_salida_esperada, nivel_detalle, contexto_disponible, posibles_ambiguedades, informacion_faltante). Max tokens: 1024 |
| 5.3 | P2: Estructurar Contexto | `openai.service.ts` | Prompt sistema: "Senior Information Architect". Input: `PipelineIntention`. Output: `PipelineContext` (dominio, audiencia, restricciones, reglas_negocio, dependencias, instrucciones_claras, ejemplos_mencionados, formato_salida_sugerido). Max tokens: 1024 |
| 5.4 | P3: Generar Prompt Optimizado | `openai.service.ts` | Prompt sistema: "Master Prompt Engineer (15+ years)". Input: `PipelineIntention` + `PipelineContext`. Output: `PipelineGeneratedPrompt` (prompt_estructurado con rol_sistema/contexto/tarea/instrucciones/formato/ejemplos/limitaciones/pregunta_clave, prompt_compacto, explicacion_mejoras). Max tokens: 4096 |
| 5.5 | P4: Validar y Refinar | `openai.service.ts` | Prompt sistema: "Prompt Quality Assurance Expert". Input: prompt generado. Output: `PipelineValidation` (puntuacion_calidad 0-100, checklist {claridad, especificidad, contexto_completo, formato_definido, ejemplos_incluidos}, prompt_final, sugerencias_mejora). Max tokens: 2048 |
| 5.6 | Función principal `runOptimizationPipeline()` | `openai.service.ts` | Orquesta P1→P2→P3→P4, emite progress vía callback, retorna `OptimizationResult`. Summarization si texto >3000 chars. Retry en cada etapa |
| 5.7 | Mock service | `src/services/ai/optimization.service.ts` | `runMockPipeline()` para USE_MOCK_AI=true. Retorna resultado hardcoded con prompt de ejemplo |
| 5.8 | API route optimize | `src/app/api/optimize/route.ts` | POST handler, SSE streaming, valida con Zod, persiste en DB si USE_MOCK_DB=false. Copiar patrón de `src/app/api/generate/route.ts` de StoryForge |

---

## Fase 6: Componentes del Optimizador (30 min)

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 6.1 | OptimizerContainer | `src/features/optimizer/OptimizerContainer.tsx` | Orquestador principal. Estado: `OptimizationConfig`. Usa `useOptimization()`. Layout: sidebar izquierda + results derecha. Copiar patrón de `GeneratorContainer` |
| 6.2 | OptimizerSidebar | `src/features/optimizer/OptimizerSidebar.tsx` | 3 tabs: Texto libre / Documento / Audio. UploadZone para file/audio. Textarea para texto. Config: outputFormat (generic), language (es/en), detailLevel (basic/standard/detailed), includeExamples (switch). Botón "Optimizar Prompt" |
| 6.3 | OptimizerResults | `src/features/optimizer/OptimizerResults.tsx` | Muestra prompt generado. Header: quality score badge, tokens, fuente. Secciones: prompt compacto (copy-all), prompt estructurado (rol/contexto/tarea/instrucciones/formato), mejoras aplicadas. Botones: Copiar, Nuevo |
| 6.4 | OptimizerLoader | `src/features/optimizer/OptimizerLoader.tsx` | Spinner + fases del pipeline + progreso. Copiar patrón de `GeneratorLoader`, adaptar labels a "Analizando intención", "Estructurando contexto", etc. |
| 6.5 | OptimizerEmpty | `src/features/optimizer/OptimizerEmpty.tsx` | Estado vacío con 3 pasos: "Escribe tu idea", "Configura opciones", "Optimiza con IA" |
| 6.6 | PromptCard | `src/features/optimizer/PromptCard.tsx` | Card expandible/colapsable. Muestra: source type badge, quality score, prompt compacto, fecha. Copy button individual |

---

## Fase 7: Hooks (20 min)

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 7.1 | useOptimization | `src/hooks/useOptimization.ts` | Copiar de `useGeneration.ts`, adaptar tipos: `OptimizationStatus`, `OptimizationStep`, `OptimizationResult`, `OptimizationConfig`. Leer SSE de `/api/optimize`. Deserializar fechas |
| 7.2 | useLastOptimization | `src/hooks/useLastOptimization.ts` | Copiar de `useLastGeneration.ts`, cambiar query key a `["lastOptimization"]` |
| 7.3 | useHistory | `src/hooks/useHistory.ts` | Fetch `/api/history`, retorna `HistoryItem[]` |
| 7.4 | useDashboard | `src/hooks/useDashboard.ts` | Fetch `/api/dashboard`, retorna `DashboardData` |

---

## Fase 8: API Routes + Dashboard + Historial (30 min)

| # | Tarea | Archivos | Detalle |
|---|---|---|---|
| 8.1 | API route history | `src/app/api/history/route.ts` | GET, retorna historial de prompts del usuario. Query a `prompt_generations` + `prompts` |
| 8.2 | API route dashboard | `src/app/api/dashboard/route.ts` | GET, retorna stats: totalPrompts, avgQuality, totalTokens, recentPrompts. Adaptar de StoryForge `dashboard.service.ts` |
| 8.3 | DB service prompts | `src/services/db/prompts.service.ts` | CRUD: `savePrompt()`, `getPromptsByUser()`, `getPromptById()` |
| 8.4 | DB service dashboard | `src/services/db/dashboard.service.ts` | `getDashboardData()`: 4 queries paralelas (count prompts, avg quality, tokens, recent) |
| 8.5 | Dashboard page real | `src/app/dashboard/page.tsx` | Stats cards (prompts generados, calidad promedio, tokens usados, tiempo ahorrado). Recent activity list. Usa `useDashboard()` |
| 8.6 | Optimize page real | `src/app/dashboard/optimize/page.tsx` | Renderiza `<OptimizerContainer />` |
| 8.7 | History page real | `src/app/dashboard/history/page.tsx` | Lista de prompts generados. Filtros por fecha/fuente. Usa `useHistory()` |

---

## Fase 9: Testing y Ajustes (15 min)

| # | Tarea | Detalle |
|---|---|---|
| 9.1 | Type check | `npx tsc --noEmit` — verificar 0 errores |
| 9.2 | Build test | `npm run build` — verificar que compila sin errores |
| 9.3 | Flujo completo | Probar: login → escribir texto → optimizar → ver resultado → copiar |
| 9.4 | Upload test | Probar: subir PDF → verificar extracción de texto → optimizar |
| 9.5 | Audio test | Probar: subir audio → verificar transcripción → optimizar |
| 9.6 | Historial test | Verificar que los prompts generados aparecen en historial |
| 9.7 | Dashboard test | Verificar que las stats se muestran correctamente |

---

## Resumen de Archivos

### Crear (20 archivos)

```
src/features/upload/UploadZone.tsx
src/features/optimizer/OptimizerContainer.tsx
src/features/optimizer/OptimizerSidebar.tsx
src/features/optimizer/OptimizerResults.tsx
src/features/optimizer/OptimizerLoader.tsx
src/features/optimizer/OptimizerEmpty.tsx
src/features/optimizer/PromptCard.tsx
src/services/ai/openai.service.ts
src/services/ai/optimization.service.ts
src/services/db/prompts.service.ts
src/services/db/dashboard.service.ts
src/hooks/useOptimization.ts
src/hooks/useLastOptimization.ts
src/hooks/useHistory.ts
src/hooks/useDashboard.ts
src/app/api/optimize/route.ts
src/app/api/history/route.ts
src/app/api/dashboard/route.ts
supabase/migrations/001_initial_schema.sql
```

### Modificar (4 archivos)

```
src/constants/index.ts
src/app/dashboard/page.tsx
src/app/dashboard/optimize/page.tsx
src/app/dashboard/history/page.tsx
```

---

## Tiempo Estimado Total: ~2.5 horas

## Paleta de Colores

- **Primary**: Emerald Green (`#10b981` / brand-500)
- **Glow**: `rgba(16, 185, 129, 0.35)`
- **Gradient**: `#ecfdf5 → #6ee7b7 → #10b981 → #047857`

## Stack Técnico

- Next.js 16 + TypeScript 6
- Tailwind CSS + shadcn/ui
- Clerk (Google OAuth)
- Supabase (PostgreSQL)
- OpenAI (gpt-4o-mini + Whisper-1)
- TanStack React Query
- Upstash Redis (rate limiting)

## Referencia de StoryForge

Los componentes se copian/adaptan de `D:\Proyectos\storyforge\src\`:
- `features/upload/UploadZone.tsx` → `features/upload/UploadZone.tsx`
- `features/generation/GeneratorContainer.tsx` → `features/optimizer/OptimizerContainer.tsx`
- `features/generation/GeneratorSidebar.tsx` → `features/optimizer/OptimizerSidebar.tsx`
- `features/generation/GeneratorResults.tsx` → `features/optimizer/OptimizerResults.tsx`
- `features/generation/GeneratorLoader.tsx` → `features/optimizer/OptimizerLoader.tsx`
- `features/generation/GeneratorEmpty.tsx` → `features/optimizer/OptimizerEmpty.tsx`
- `hooks/useGeneration.ts` → `hooks/useOptimization.ts`
- `hooks/useLastGeneration.ts` → `hooks/useLastOptimization.ts`
- `services/db/dashboard.service.ts` → `services/db/dashboard.service.ts`
