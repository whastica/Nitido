import { getSupabaseServer, type DbPrompt, type DbPromptGeneration } from "@/lib/supabase";

export interface SavePromptData {
  userId: string;
  sourceType: string;
  sourceMetadata?: Record<string, unknown>;
  inputText: string;
  generatedPrompt: string;
  structuredPrompt?: Record<string, unknown>;
  compactPrompt?: string;
  qualityScore?: number;
  qualityChecklist?: Record<string, unknown>;
  improvements?: string[];
  tokensUsed?: number;
  latencyMs?: number;
}

export interface SaveGenerationData {
  userId: string;
  promptId?: string;
  sourceType: string;
  config: Record<string, unknown>;
  tokensUsed?: number;
  latencyMs?: number;
  pipelineStages?: Record<string, unknown>;
}

export async function savePrompt(data: SavePromptData): Promise<DbPrompt> {
  const supabase = getSupabaseServer();

  const { data: prompt, error } = await supabase
    .from("prompts")
    .insert({
      user_id: data.userId,
      source_type: data.sourceType,
      source_metadata: data.sourceMetadata ?? null,
      input_text: data.inputText,
      generated_prompt: data.generatedPrompt,
      structured_prompt: data.structuredPrompt ?? null,
      compact_prompt: data.compactPrompt ?? null,
      quality_score: data.qualityScore ?? null,
      quality_checklist: data.qualityChecklist ?? null,
      improvements: data.improvements ?? [],
      tokens_used: data.tokensUsed ?? null,
      latency_ms: data.latencyMs ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error guardando prompt: ${error.message}`);
  }

  return prompt;
}

export async function saveGeneration(data: SaveGenerationData): Promise<DbPromptGeneration> {
  const supabase = getSupabaseServer();

  const { data: generation, error } = await supabase
    .from("prompt_generations")
    .insert({
      user_id: data.userId,
      prompt_id: data.promptId ?? null,
      source_type: data.sourceType,
      config: data.config,
      tokens_used: data.tokensUsed ?? null,
      latency_ms: data.latencyMs ?? null,
      pipeline_stages: data.pipelineStages ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error guardando generación: ${error.message}`);
  }

  return generation;
}

export async function getPromptsByUser(userId: string, limit = 50): Promise<DbPrompt[]> {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Error obteniendo prompts: ${error.message}`);
  }

  return data ?? [];
}

export async function getPromptById(id: string): Promise<DbPrompt | null> {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Error obteniendo prompt: ${error.message}`);
  }

  return data;
}

export async function deletePrompt(id: string): Promise<void> {
  const supabase = getSupabaseServer();

  const { error } = await supabase
    .from("prompts")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error eliminando prompt: ${error.message}`);
  }
}
