import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL no está configurada");
if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada");

export function getSupabaseServer() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

export interface DbPrompt {
  id: string;
  user_id: string;
  source_type: string;
  source_metadata: Record<string, unknown> | null;
  input_text: string;
  generated_prompt: string;
  structured_prompt: Record<string, unknown> | null;
  compact_prompt: string | null;
  quality_score: number | null;
  quality_checklist: Record<string, unknown> | null;
  improvements: string[];
  tokens_used: number | null;
  latency_ms: number | null;
  created_at: string;
}

export interface DbPromptGeneration {
  id: string;
  user_id: string;
  prompt_id: string | null;
  source_type: string;
  config: Record<string, unknown>;
  tokens_used: number | null;
  latency_ms: number | null;
  pipeline_stages: Record<string, unknown> | null;
  created_at: string;
}
