import { getSupabaseServer } from "@/lib/supabase";

export interface DashboardData {
  totalPrompts: number;
  avgQuality: number;
  totalTokens: number;
  timeSaved: number;
  recentPrompts: Array<{
    id: string;
    inputText: string;
    qualityScore: number | null;
    createdAt: string;
  }>;
  activityByDay: Array<{ day: string; count: number }>;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = getSupabaseServer();

  const { data: prompts, error } = await supabase
    .from("prompts")
    .select("id, input_text, quality_score, tokens_used, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error obteniendo datos del dashboard: ${error.message}`);
  }

  const allPrompts = prompts ?? [];

  const totalPrompts = allPrompts.length;

  const qualityScores = allPrompts
    .filter((p) => p.quality_score !== null)
    .map((p) => p.quality_score as number);
  const avgQuality = qualityScores.length > 0
    ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
    : 0;

  const totalTokens = allPrompts.reduce((sum, p) => sum + (p.tokens_used ?? 0), 0);

  // Estimación: cada prompt ahorra ~2 minutos de edición manual
  const timeSaved = totalPrompts * 2;

  const recentPrompts = allPrompts.slice(0, 5).map((p) => ({
    id: p.id,
    inputText: p.input_text,
    qualityScore: p.quality_score,
    createdAt: p.created_at,
  }));

  // Actividad por día (últimos 7 días)
  const now = new Date();
  const activityByDay: Array<{ day: string; count: number }> = [];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const count = allPrompts.filter((p) => {
      const created = new Date(p.created_at);
      return created >= d && created < nextD;
    }).length;

    activityByDay.push({
      day: dayNames[d.getDay()] ?? "??",
      count,
    });
  }

  return {
    totalPrompts,
    avgQuality,
    totalTokens,
    timeSaved,
    recentPrompts,
    activityByDay,
  };
}
