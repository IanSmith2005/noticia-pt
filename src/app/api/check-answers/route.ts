import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAnswers } from "@/lib/claude";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { exerciseId, questions, answers } = await req.json();

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { article: true },
  });
  if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  if (exercise.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results = await checkAnswers(exercise.article.content, questions, answers);

  const correct = results.filter((r) => r.result === "correct").length;
  const partial = results.filter((r) => r.result === "partly_correct").length;
  const score = Math.round(((correct + partial * 0.5) / questions.length) * 100);

  await prisma.exercise.update({
    where: { id: exerciseId },
    data: {
      score,
      completedAt: new Date(),
      answers: {
        create: questions.map((q: { text: string }, i: number) => ({
          questionIdx: i,
          questionText: q.text,
          userAnswer: answers[i] || "",
          result: results[i]?.result || "incorrect",
          feedback: results[i]?.feedback || "",
          betterAnswer: results[i]?.betterAnswer || "",
        })),
      },
    },
  });

  // Update streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const streak = await prisma.streak.findUnique({ where: { userId: session.user.id } });
  if (streak) {
    const lastDate = streak.lastDate ? new Date(streak.lastDate) : null;
    lastDate?.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newCurrent = streak.current;
    if (!lastDate || lastDate < yesterday) {
      newCurrent = 1;
    } else if (lastDate.getTime() === yesterday.getTime()) {
      newCurrent += 1;
    }

    await prisma.streak.update({
      where: { userId: session.user.id },
      data: {
        current: newCurrent,
        longest: Math.max(streak.longest, newCurrent),
        lastDate: new Date(),
      },
    });
  }

  return NextResponse.json({ results, score });
}
