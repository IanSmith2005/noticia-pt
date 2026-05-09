import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/claude";
import { getConfig } from "@/config/languages";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { article, difficulty, lang } = await req.json();

  if (!article?.content) {
    return NextResponse.json({ error: "Article content required" }, { status: 400 });
  }

  const config = getConfig(lang);
  const diff = (difficulty || article.difficulty) as "easy" | "medium" | "hard";
  const questions = await generateQuestions(config, article.content, article.title, diff);

  return NextResponse.json({ questions });
}
