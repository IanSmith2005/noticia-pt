import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuestions } from "@/lib/claude";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: { article: true, answers: true },
  });

  if (!exercise) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (exercise.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const questions = await generateQuestions(
    exercise.article.content,
    exercise.article.title,
    exercise.difficulty as "easy" | "medium" | "hard"
  );

  return NextResponse.json({ exercise, article: exercise.article, questions });
}
