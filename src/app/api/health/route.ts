import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "PromptOptimizer",
    timestamp: new Date().toISOString(),
  });
}
