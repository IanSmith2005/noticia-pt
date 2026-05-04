import Parser from "rss-parser";

export type ArticleMeta = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  topic: string;
};

const parser = new Parser();

const RSS_FEEDS: { url: string; source: string; topic: string }[] = [
  { url: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml", source: "Agência Brasil", topic: "world" },
  { url: "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml", source: "Agência Brasil", topic: "business" },
  { url: "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml", source: "Agência Brasil", topic: "politics" },
  { url: "https://agenciabrasil.ebc.com.br/rss/ciencia-e-saude/feed.xml", source: "Agência Brasil", topic: "science" },
  { url: "https://agenciabrasil.ebc.com.br/rss/cultura/feed.xml", source: "Agência Brasil", topic: "culture" },
  { url: "https://agenciabrasil.ebc.com.br/rss/tecnologia/feed.xml", source: "Agência Brasil", topic: "technology" },
];

export async function fetchArticleList(topic: string = "random", limit = 10): Promise<ArticleMeta[]> {
  const feeds = topic === "random"
    ? RSS_FEEDS
    : RSS_FEEDS.filter((f) => f.topic === topic);

  const results: ArticleMeta[] = [];

  for (const feed of feeds) {
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
  }

  return results.sort(() => Math.random() - 0.5).slice(0, limit);
}

export async function fetchArticleContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (educational reading app)" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();

    // Extract readable text from HTML — strip tags, clean whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s{2,}/g, " ")
      .trim();

    // Return only meaningful length content
    if (text.length < 300) throw new Error("Content too short");
    return text.slice(0, 8000);
  } catch (err) {
    throw new Error(`Could not fetch article: ${err}`);
  }
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
