-- ═══════════════════════════════════════════════════════════════
-- PromptOptimizer — Initial Schema Migration
-- ═══════════════════════════════════════════════════════════════

-- Tabla principal de prompts optimizados
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('text', 'pdf', 'docx', 'txt', 'voice')),
  source_metadata JSONB,
  input_text TEXT NOT NULL,
  generated_prompt TEXT NOT NULL,
  structured_prompt JSONB,
  compact_prompt TEXT,
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  quality_checklist JSONB,
  improvements TEXT[] DEFAULT '{}',
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de generaciones (historial de llamadas a la IA)
CREATE TABLE IF NOT EXISTS prompt_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  tokens_used INTEGER,
  latency_ms INTEGER,
  pipeline_stages JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompts_user_created ON prompts(user_id, created_at DESC);

CREATE INDEX idx_generations_user_id ON prompt_generations(user_id);
CREATE INDEX idx_generations_created_at ON prompt_generations(created_at DESC);
CREATE INDEX idx_generations_prompt_id ON prompt_generations(prompt_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_generations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para prompts (service_role tiene acceso completo)
CREATE POLICY "Service role can manage all prompts"
  ON prompts FOR ALL
  USING (auth.role() = 'service_role');

-- Políticas RLS para prompt_generations (service_role tiene acceso completo)
CREATE POLICY "Service role can manage all generations"
  ON prompt_generations FOR ALL
  USING (auth.role() = 'service_role');
