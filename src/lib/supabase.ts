import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Supabase no está configurado. Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local"
    );
  }

  _client = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  return _client;
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
