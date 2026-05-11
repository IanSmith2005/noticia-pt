import { NextRequest, NextResponse } from "next/server";
import { checkAnswers } from "@/lib/claude";
import { getConfig } from "@/config/languages";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { articleContent, questions, answers, answerLang, lang } = await req.json();

  if (!articleContent || !questions?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const config = getConfig(lang);
  const answerLangName = answerLang === "en" ? "English" : config.label;

  const results = await checkAnswers(articleContent, questions, answers, answerLangName);

  const correct = results.filter((r) => r.result === "correct").length;
  const partial = results.filter((r) => r.result === "partly_correct").length;
  const score = Math.round(((correct + partial * 0.5) / questions.length) * 100);

  return NextResponse.json({ results, score });
}
