import { NextResponse } from "next/server";
import { catchApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { useMockDB } from "@/lib/env";
import { getDashboardData } from "@/services/db/dashboard.service";
import type { DashboardData } from "@/types";

function generateMockActivity(): DashboardData["activityByDay"] {
  const now = new Date();
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return {
      day: dayNames[d.getDay()] ?? "??",
      count: i < 5 ? Math.floor(Math.random() * 4) : 0,
    };
  });
}

const mockDashboard: DashboardData = {
  totalPrompts: 0,
  avgQuality: 0,
  totalTokens: 0,
  timeSaved: 0,
  recentPrompts: [],
  activityByDay: generateMockActivity(),
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
      activityByDay: data.activityByDay,
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
