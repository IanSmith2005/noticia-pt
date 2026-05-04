import { NextRequest, NextResponse } from "next/server";
import { fetchArticleList, fetchArticleContent, estimateReadingMinutes, assignDifficulty } from "@/lib/articles";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic") || "random";
  const difficulty = req.nextUrl.searchParams.get("difficulty") || null;

  try {
    const list = await fetchArticleList(topic, 20);
    const articles = [];

    for (const meta of list.slice(0, 5)) {
      try {
        // Check if already cached
        const existing = await prisma.article.findFirst({
          where: { sourceUrl: meta.link },
          select: { id: true, title: true, topic: true, difficulty: true, estimatedMinutes: true, source: true, publishedAt: true },
        });

        if (existing) {
          if (!difficulty || existing.difficulty === difficulty) {
            articles.push(existing);
          }
          continue;
        }

        const content = await fetchArticleContent(meta.link);
        const mins = estimateReadingMinutes(content);
        const diff = assignDifficulty(content);

        if (difficulty && diff !== difficulty) continue;

        const article = await prisma.article.create({
          data: {
            title: meta.title,
            source: meta.source,
            sourceUrl: meta.link,
            publishedAt: new Date(meta.pubDate),
            content,
            topic: meta.topic,
            difficulty: diff,
            estimatedMinutes: mins,
          },
          select: { id: true, title: true, topic: true, difficulty: true, estimatedMinutes: true, source: true, publishedAt: true },
        });

        articles.push(article);
      } catch {
        // Skip articles that fail to fetch
      }
    }

    return NextResponse.json(articles);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
