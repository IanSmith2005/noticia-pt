import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const { article, difficulty } = await req.json();

  if (!article?.content) {
    return NextResponse.json({ error: "Article content required" }, { status: 400 });
  }

  const diff = (difficulty || article.difficulty) as "easy" | "medium" | "hard";
  const questions = await generateQuestions(article.content, article.title, diff);

  return NextResponse.json({ questions });
}
