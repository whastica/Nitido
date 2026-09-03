import { NextResponse } from "next/server";
import { apiError, catchApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { useMockDB } from "@/lib/env";
import { getPromptsByUser } from "@/services/db/prompts.service";
import type { HistoryItem } from "@/types";

const mockHistory: HistoryItem[] = [];

export async function GET() {
  return catchApiError(async () => {
    const { userId } = await requireAuth();

    if (useMockDB) {
      return NextResponse.json({ data: mockHistory });
    }

    const prompts = await getPromptsByUser(userId);

    const items: HistoryItem[] = prompts.map((p) => ({
      id: p.id,
      inputText: p.input_text,
      sourceType: p.source_type as HistoryItem["sourceType"],
      generatedPrompt: p.generated_prompt,
      compactPrompt: p.compact_prompt ?? "",
      qualityScore: p.quality_score ?? 0,
      config: (p.source_metadata as unknown as HistoryItem["config"]) ?? {
        language: "es",
        detailLevel: "standard",
        includeConstraints: true,
        targetTool: "chatbot",
        outputFormat: "libre",
      },
      createdAt: new Date(p.created_at),
    }));

    return NextResponse.json({ data: items });
  });
}
