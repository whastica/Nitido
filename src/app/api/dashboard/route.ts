import { NextResponse } from "next/server";
import { catchApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { useMockDB } from "@/lib/env";
import { getDashboardData } from "@/services/db/dashboard.service";
import type { DashboardData } from "@/types";

const mockDashboard: DashboardData = {
  totalPrompts: 0,
  avgQuality: 0,
  totalTokens: 0,
  timeSaved: 0,
  recentPrompts: [],
};

export async function GET() {
  return catchApiError(async () => {
    const { userId } = await requireAuth();

    if (useMockDB) {
      return NextResponse.json({ data: mockDashboard });
    }

    const data = await getDashboardData(userId);

    const response: DashboardData = {
      totalPrompts: data.totalPrompts,
      avgQuality: data.avgQuality,
      totalTokens: data.totalTokens,
      timeSaved: data.timeSaved,
      recentPrompts: data.recentPrompts.map((p) => ({
        id: p.id,
        inputText: p.inputText,
        sourceType: "text" as const,
        generatedPrompt: "",
        compactPrompt: "",
        qualityScore: p.qualityScore ?? 0,
        config: {
          language: "es" as const,
          detailLevel: "standard" as const,
          includeConstraints: true,
          targetTool: "chatbot" as const,
          outputFormat: "libre" as const,
        },
        createdAt: new Date(p.createdAt),
      })),
    };

    return NextResponse.json({ data: response });
  });
}
