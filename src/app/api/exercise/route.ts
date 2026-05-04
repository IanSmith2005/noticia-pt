import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuestions } from "@/lib/claude";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { articleId, difficulty } = await req.json();

  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  const diff = (difficulty || article.difficulty) as "easy" | "medium" | "hard";
  const questionLang = diff === "easy" ? "en" : "pt";

  const questions = await generateQuestions(article.content, article.title, diff);

  const exercise = await prisma.exercise.create({
    data: {
      userId: session.user.id,
      articleId,
      difficulty: diff,
      questionLang,
      totalQ: questions.length,
    },
  });

  return NextResponse.json({ exercise, questions, article });
}
