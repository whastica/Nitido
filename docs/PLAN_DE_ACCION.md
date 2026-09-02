# Plan de Acción — PromptOptimizer

> Última actualización: 2026-09-02.
> **Estrategia:** Front-end primero con mocks → Back-end + DB después.

---

## Estado: Front-end COMPLETO ✅ | Back-end PENDIENTE ❌

```
✅ Fase 0   Paleta de colores
✅ Fase 1   Tipos y Constants
✅ Fase 2   UploadZone + VoiceInput
✅ Fase 3   Componentes del Optimizador (6 archivos)
✅ Fase 4   Hooks (useOptimization, useLastOptimization)
✅ Fase 5   Páginas del Dashboard (4 páginas conectadas)
✅ Fase 6   API Routes mock (/api/optimize con SSE)
✅ Fase 10  Pipeline IA real (mock + OpenAI)
✅ Fase 11  Testing y Build (type-check + build pasan)
────────────────────────────────────────
❌ Fase 7   DB Schema + Migración Supabase     ← SIGUIENTE
❌ Fase 8   DB Services (prompts, dashboard)
❌ Fase 9   API Routes reales + conectar páginas
```

---

## ❌ Fase 7: DB Schema + Migración Supabase

| # | Tarea | Archivo | Detalle |
|---|---|---|---|
| 7.1 | Crear migración SQL | `supabase/migrations/001_initial_schema.sql` | Tabla `prompts` (id uuid, user_id text, source_type text, source_metadata jsonb, input_text text, generated_prompt text, structured_prompt jsonb, compact_prompt text, quality_score int, quality_checklist jsonb, improvements text[], tokens_used int, latency_ms int, created_at timestamptz). Tabla `prompt_generations` (id uuid, user_id text, prompt_id uuid FK→prompts, source_type text, config jsonb, tokens_used int, latency_ms int, pipeline_stages jsonb, created_at timestamptz). Índices en user_id y created_at. |
| 7.2 | Verificar supabase types | `src/lib/supabase.ts` | Confirmar que types existentes coinciden con el schema SQL. |

---

## ❌ Fase 8: DB Services

| # | Tarea | Archivo | Detalle |
|---|---|---|---|
| 8.1 | DB service prompts | `src/services/db/prompts.service.ts` | CRUD: `savePrompt(data)`, `getPromptsByUser(userId, limit?)`, `getPromptById(id)`, `deletePrompt(id)`. Usa `getSupabaseServer()`. |
| 8.2 | DB service dashboard | `src/services/db/dashboard.service.ts` | `getDashboardData(userId)`: count prompts, avg quality, sum tokens, recent 5. Retorna `DashboardData`. |

---

## ❌ Fase 9: API Routes Reales + Conectar Páginas

| # | Tarea | Archivo | Detalle |
|---|---|---|---|
| 9.1 | API route history | `src/app/api/history/route.ts` | GET handler. `USE_MOCK_DB=false` → `getPromptsByUser()`. Mock → array de ejemplo. |
| 9.2 | API route dashboard | `src/app/api/dashboard/route.ts` | GET handler. `USE_MOCK_DB=false` → `getDashboardData()`. Mock → stats hardcodeadas. |
| 9.3 | Actualizar route optimize | `src/app/api/optimize/route.ts` | `USE_MOCK_DB=false` → `savePrompt()` + `saveGeneration()` post-pipeline. |
| 9.4 | Conectar páginas | `dashboard/page.tsx`, `history/page.tsx` | `useQuery` apuntando a API routes reales en vez de mock inline. |

---

## Archivos Pendientes

### Por crear (5)
```
supabase/migrations/001_initial_schema.sql
src/services/db/prompts.service.ts
src/services/db/dashboard.service.ts
src/app/api/history/route.ts
src/app/api/dashboard/route.ts
```

### Por modificar (3)
```
src/app/api/optimize/route.ts           ← savePrompt() cuando USE_MOCK_DB=false
src/app/dashboard/page.tsx              ← usar /api/dashboard
src/app/dashboard/history/page.tsx      ← usar /api/history
```

---

## Stack Técnico

- Next.js 16 + TypeScript 6 + Tailwind CSS + shadcn/ui
- Clerk (deshabilitado, mock dev-user-mock)
- Supabase (PostgreSQL) — **pendiente configurar**
- OpenAI gpt-4o-mini — funcionando (mock + real)
- TanStack React Query + Upstash Redis + react-dropzone + Web Speech API

## Paleta de Colores

- Fondo: verde-gris oscuro `hsl(150 8% 6%)`
- Primary: esmeralda `hsl(158 64% 40%)` / brand-500 `rgb(16, 163, 116)`
- Accent: ámbar `hsl(32 70% 65%)`
- Sin púrpura en ningún archivo
