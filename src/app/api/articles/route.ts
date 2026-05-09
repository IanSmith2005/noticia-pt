import { NextRequest, NextResponse } from "next/server";
import { fetchArticleList, fetchArticleContent, estimateReadingMinutes, assignDifficulty } from "@/lib/articles";
import { getConfig } from "@/config/languages";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic") || "random";
  const lang = req.nextUrl.searchParams.get("lang");
  const config = getConfig(lang);

  try {
    const list = await fetchArticleList(config, topic, 12);

    const settled = await Promise.allSettled(
      list.slice(0, 6).map(async (meta) => {
        const content = await fetchArticleContent(meta.link, config.cleanContent);
        return {
          id: Buffer.from(meta.link).toString("base64url").slice(0, 20),
          title: meta.title,
          source: meta.source,
          sourceUrl: meta.link,
          publishedAt: meta.pubDate,
          content,
          topic: meta.topic,
          difficulty: assignDifficulty(content),
          estimatedMinutes: estimateReadingMinutes(content),
        };
      })
    );

    const articles = settled
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<unknown>).value);

    return NextResponse.json(articles.slice(0, 5));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
