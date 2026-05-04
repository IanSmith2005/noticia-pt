import { NextRequest, NextResponse } from "next/server";
import { fetchArticleList, fetchArticleContent, estimateReadingMinutes, assignDifficulty } from "@/lib/articles";

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic") || "random";
  const difficulty = req.nextUrl.searchParams.get("difficulty") || null;

  try {
    const list = await fetchArticleList(topic, 20);
    const articles = [];

    for (const meta of list.slice(0, 8)) {
      try {
        const content = await fetchArticleContent(meta.link);
        const mins = estimateReadingMinutes(content);
        const diff = assignDifficulty(content);

        if (difficulty && diff !== difficulty) continue;

        articles.push({
          id: Buffer.from(meta.link).toString("base64url").slice(0, 20),
          title: meta.title,
          source: meta.source,
          sourceUrl: meta.link,
          publishedAt: meta.pubDate,
          content,
          topic: meta.topic,
          difficulty: diff,
          estimatedMinutes: mins,
        });

        if (articles.length >= 3) break;
      } catch {
        // skip articles that fail to fetch
      }
    }

    return NextResponse.json(articles);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
