import Parser from "rss-parser";
import { extractFromHtml } from "@extractus/article-extractor";
import { decode } from "he";
import type { LanguageConfig } from "@/config/languages";

export type ArticleMeta = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  topic: string;
};

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/xml,application/xhtml+xml,text/html,text/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,nl;q=0.8,en;q=0.7",
};

const parser = new Parser({
  headers: BROWSER_HEADERS,
  timeout: 10000,
});

export async function fetchArticleList(config: LanguageConfig, topic: string = "random", limit = 10): Promise<ArticleMeta[]> {
  const feeds = topic === "random"
    ? config.feeds
    : config.feeds.filter((f) => f.topic === topic);

  const results: ArticleMeta[] = [];

  await Promise.all(
    feeds.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        for (const item of parsed.items.slice(0, limit)) {
          if (item.title && item.link) {
            results.push({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate || new Date().toISOString(),
              source: feed.source,
              topic: feed.topic,
            });
          }
        }
      } catch {
        // Feed temporarily unavailable, skip
      }
    })
  );

  return results.sort(() => Math.random() - 0.5).slice(0, limit);
}

export async function fetchArticleContent(
  url: string,
  cleanup: (text: string) => string = (t) => t.trim()
): Promise<string> {
  const res = await fetch(url, {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(10000),
    redirect: "follow",
  });
  const html = await res.text();

  // Run Mozilla Readability to find the actual article body (not nav/ads/footer)
  const article = await extractFromHtml(html, url);

  if (article?.content) {
    const text = cleanup(
      decode(
        article.content
          .replace(/<[^>]+>/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim()
      )
    );
    if (text.length >= 180) return text.slice(0, 8000);
  }

  // Fallback: tag-strip with proper entity decoding
  const fallback = cleanup(
    decode(
      html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<header[\s\S]*?<\/header>/gi, "")
        .replace(/<footer[\s\S]*?<\/footer>/gi, "")
        .replace(/<aside[\s\S]*?<\/aside>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
    )
  );

  if (fallback.length < 180) throw new Error("Content too short");
  return fallback.slice(0, 8000);
}

export function estimateReadingMinutes(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(2, Math.round(words / 200));
}

export function assignDifficulty(text: string): "easy" | "medium" | "hard" {
  const words = text.split(/\s+/).length;
  if (words < 400) return "easy";
  if (words < 800) return "medium";
  return "hard";
}
