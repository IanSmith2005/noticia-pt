import type { LanguageConfig } from "./index";

export const jaConfig: LanguageConfig = {
  code: "ja",
  label: "日本語",
  flag: "🇯🇵",
  brand: "ニュース JP",
  tagline: "もっと読もう。もっと理解しよう。",

  feeds: [
    { url: "https://www3.nhk.or.jp/rss/news/cat0.xml", source: "NHK", topic: "shuyou" },
    { url: "https://www3.nhk.or.jp/rss/news/cat1.xml", source: "NHK", topic: "shakai" },
    { url: "https://www3.nhk.or.jp/rss/news/cat2.xml", source: "NHK", topic: "bunka" },
    { url: "https://www3.nhk.or.jp/rss/news/cat3.xml", source: "NHK", topic: "kagaku" },
    { url: "https://www3.nhk.or.jp/rss/news/cat4.xml", source: "NHK", topic: "seiji" },
    { url: "https://www3.nhk.or.jp/rss/news/cat5.xml", source: "NHK", topic: "keizai" },
    { url: "https://www3.nhk.or.jp/rss/news/cat6.xml", source: "NHK", topic: "kokusai" },
    { url: "https://www3.nhk.or.jp/rss/news/cat7.xml", source: "NHK", topic: "sports" },
  ],

  topics: [
    { value: "random", label: "ランダム", icon: "Shuffle" },
    { value: "shuyou", label: "主要", icon: "Newspaper" },
    { value: "kokusai", label: "国際", icon: "Globe" },
    { value: "keizai", label: "経済", icon: "TrendingUp" },
    { value: "seiji", label: "政治", icon: "Landmark" },
    { value: "shakai", label: "社会", icon: "Users" },
    { value: "kagaku", label: "科学・医療", icon: "HeartPulse" },
    { value: "bunka", label: "文化", icon: "Palette" },
    { value: "sports", label: "スポーツ", icon: "Trophy" },
  ],

  ui: {
    difficulty: "難易度",
    topic: "トピック",
    startButton: "読み始める →",
    loadingArticle: "記事を探しています...",
    loadingQuestions: "AIで質問を生成中...",
    notFound: "記事が見つかりません。別のトピックを試してください。",
    sourceCredit: "記事提供: NHKニュース",
    questionLabel: "質問",
    answerPlaceholder: "ここに日本語で答えを書いてください...",
    answerPlaceholderEn: "Write your answer in English...",
    answerInLabel: "回答言語",
    seeExcerpt: "該当箇所を見る →",
    answeredCount: (a, b) => `${a}/${b} 回答済み`,
    checkAnswers: "回答を確認 →",
    checking: "AIで確認中...",
    newArticle: "新しい記事 →",
    result: "結果",
    correct: "正解",
    partial: "部分正解",
    incorrect: "不正解",
    correctLabel: "✓ 正解",
    partialLabel: "◑ 部分的に正解",
    incorrectLabel: "✗ 不正解",
    betterAnswer: "Better answer",
    minutes: "分",
    seeOriginal: "元の記事を見る ↗",
    articleTab: "記事",
    questionsTab: "質問",
  },

  difficultyMeta: {
    easy: { label: "初級", desc: "英語の質問・基本的な事実", questionLang: "en" },
    medium: { label: "中級", desc: "英語の質問・解釈と推論", questionLang: "en" },
    hard: { label: "上級", desc: "日本語の質問・批判的思考", questionLang: "native" },
  },

  cleanContent: (text) => {
    let t = text.trim();

    // Strip NHK leading nav menu by cutting up to the first article timestamp
    // (NHK timestamps look like "2026年5月11日6:06" or "2026年5月11日6:06 (2026年5月11日14:25更新)")
    const tsMatch = t.match(/\d{4}年\d{1,2}月\d{1,2}日\d{1,2}:\d{2}(?:\s*\(\d{4}年\d{1,2}月\d{1,2}日\d{1,2}:\d{2}\s*更新\))?/);
    if (tsMatch && tsMatch.index !== undefined && tsMatch.index < 600) {
      t = t.slice(tsMatch.index + tsMatch[0].length).trim();
    }

    // Cut at NHK end-of-article markers (related tags, etc.)
    const markers = [
      "注目ワード",
      "あわせて読みたい",
      "おすすめ記事",
      "注目のコンテンツ",
      "関連ニュース",
      "関連リンク",
      "ページの先頭へ",
    ];
    let cutAt = t.length;
    for (const m of markers) {
      const idx = t.indexOf(m);
      if (idx > 50 && idx < cutAt) cutAt = idx;
    }
    return t.slice(0, cutAt).trim();
  },

  claude: {
    systemPrompt: `You are an educational tool that helps people improve their Japanese reading comprehension.
Return ONLY a valid JSON array of question objects. No explanation, no markdown, just the JSON array.
Each object must have: idx (number starting at 1), text (string), relatedParagraph (number, 1-indexed guess), type (one of: fact, interpretation, critical, vocabulary).`,
    questionPrompts: {
      easy: `Generate 4 comprehension questions in ENGLISH about this Japanese news article.
Focus on: basic facts, who/what/where/when, main idea.
Keep questions simple and direct.`,
      medium: `Generate 5 comprehension questions in ENGLISH about this Japanese news article.
Focus on: causes and effects, connections between ideas, what quotes mean, implications.
Questions should require reading carefully, not just skimming.`,
      hard: `Generate 6 critical thinking questions in JAPANESE about this news article.
Focus on: assumptions made, missing perspectives, bias detection, predicting consequences, evaluating arguments.
Questions should challenge the reader to think beyond the text.`,
    },
  },
};
