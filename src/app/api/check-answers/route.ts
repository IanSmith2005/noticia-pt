import { NextRequest, NextResponse } from "next/server";
import { checkAnswers } from "@/lib/claude";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { articleContent, questions, answers } = await req.json();

  if (!articleContent || !questions?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const results = await checkAnswers(articleContent, questions, answers);

  const correct = results.filter((r) => r.result === "correct").length;
  const partial = results.filter((r) => r.result === "partly_correct").length;
  const score = Math.round(((correct + partial * 0.5) / questions.length) * 100);

  return NextResponse.json({ results, score });
}
