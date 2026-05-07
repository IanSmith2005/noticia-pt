import Parser from "rss-parser";

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
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
};

const parser = new Parser({
  headers: BROWSER_HEADERS,
  timeout: 10000,
});

const RSS_FEEDS: { url: string; source: string; topic: string }[] = [
  { url: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml", source: "Agência Brasil", topic: "geral" },
  { url: "https://agenciabrasil.ebc.com.br/rss/internacional/feed.xml", source: "Agência Brasil", topic: "internacional" },
  { url: "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml", source: "Agência Brasil", topic: "economia" },
  { url: "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml", source: "Agência Brasil", topic: "politica" },
  { url: "https://agenciabrasil.ebc.com.br/rss/saude/feed.xml", source: "Agência Brasil", topic: "saude" },
  { url: "https://agenciabrasil.ebc.com.br/rss/educacao/feed.xml", source: "Agência Brasil", topic: "educacao" },
  { url: "https://agenciabrasil.ebc.com.br/rss/esportes/feed.xml", source: "Agência Brasil", topic: "esportes" },
  { url: "https://agenciabrasil.ebc.com.br/rss/justica/feed.xml", source: "Agência Brasil", topic: "justica" },
  { url: "https://agenciabrasil.ebc.com.br/rss/direitos-humanos/feed.xml", source: "Agência Brasil", topic: "direitos-humanos" },
];

export async function fetchArticleList(topic: string = "random", limit = 10): Promise<ArticleMeta[]> {
  const feeds = topic === "random"
    ? RSS_FEEDS
    : RSS_FEEDS.filter((f) => f.topic === topic);

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

export async function fetchArticleContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();

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
