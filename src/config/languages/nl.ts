import type { LanguageConfig } from "./index";

export const nlConfig: LanguageConfig = {
  code: "nl",
  label: "Nederlands",
  flag: "🇳🇱",
  brand: "Nieuws NL",
  tagline: "Lees meer. Begrijp meer.",

  feeds: [
    { url: "https://feeds.nos.nl/nosnieuwsalgemeen", source: "NOS", topic: "algemeen" },
    { url: "https://feeds.nos.nl/nosnieuwsbinnenland", source: "NOS", topic: "binnenland" },
    { url: "https://feeds.nos.nl/nosnieuwsbuitenland", source: "NOS", topic: "buitenland" },
    { url: "https://feeds.nos.nl/nosnieuwspolitiek", source: "NOS", topic: "politiek" },
    { url: "https://feeds.nos.nl/nosnieuwseconomie", source: "NOS", topic: "economie" },
    { url: "https://feeds.nos.nl/nosnieuwscultuurenmedia", source: "NOS", topic: "cultuur" },
    { url: "https://feeds.nos.nl/nossportalgemeen", source: "NOS", topic: "sport" },
    { url: "https://feeds.nos.nl/nosnieuwstech", source: "NOS", topic: "tech" },
  ],

  topics: [
    { value: "random", label: "Willekeurig", emoji: "🎲" },
    { value: "buitenland", label: "Wereld", emoji: "🌍" },
    { value: "binnenland", label: "Nederland", emoji: "🇳🇱" },
    { value: "economie", label: "Economie", emoji: "📈" },
    { value: "politiek", label: "Politiek", emoji: "🏛️" },
    { value: "tech", label: "Tech", emoji: "💻" },
    { value: "cultuur", label: "Cultuur", emoji: "🎭" },
    { value: "sport", label: "Sport", emoji: "⚽" },
  ],

  ui: {
    difficulty: "Moeilijkheid",
    topic: "Onderwerp",
    startButton: "Begin met lezen →",
    loadingArticle: "Artikel zoeken...",
    loadingQuestions: "Vragen genereren met AI...",
    notFound: "Geen artikel gevonden. Probeer een ander onderwerp.",
    sourceCredit: "Artikelen van NOS · CC-licentie",
    questionLabel: "Vraag",
    answerPlaceholder: "Schrijf hier je antwoord...",
    seeExcerpt: "Toon passage →",
    answeredCount: (a, b) => `${a}/${b} beantwoord`,
    checkAnswers: "Antwoorden controleren →",
    checking: "Controleren met AI...",
    newArticle: "Nieuw artikel →",
    result: "Resultaat",
    correct: "correct",
    partial: "gedeeltelijk",
    incorrect: "incorrect",
    correctLabel: "✓ Correct",
    partialLabel: "◑ Gedeeltelijk correct",
    incorrectLabel: "✗ Incorrect",
    betterAnswer: "Better answer",
    minutes: "min",
    seeOriginal: "Zie origineel ↗",
    articleTab: "Artikel",
    questionsTab: "Vragen",
  },

  difficultyMeta: {
    easy: { label: "Makkelijk", desc: "Vragen in het Engels · Basisfeiten", questionLang: "en" },
    medium: { label: "Gemiddeld", desc: "Vragen in het Nederlands · Interpretatie", questionLang: "native" },
    hard: { label: "Moeilijk", desc: "Vragen in het Nederlands · Kritisch denken", questionLang: "native" },
  },

  cleanContent: (text) => {
    let t = text;
    // Strip leading NOS dateline like "NOS Nieuws • woensdag, 16:36 "
    t = t.replace(/^NOS\s+Nieuws[\s\S]{0,80}?\d{1,2}:\d{2}\s*/i, "");
    // Strip "(opent in nieuw venster)" link annotations
    t = t.replace(/\s*\(opent in nieuw venster\)/gi, "");
    // Cut off at NOS-specific end-of-article markers (share buttons + related articles)
    const markers = ["Deel artikel:", "Meer bekijken?"];
    let cutAt = t.length;
    for (const m of markers) {
      const idx = t.indexOf(m);
      if (idx > 0 && idx < cutAt) cutAt = idx;
    }
    return t.slice(0, cutAt).trim();
  },

  claude: {
    systemPrompt: `You are an educational tool that helps people improve their Dutch (Netherlands Dutch) reading comprehension.
Return ONLY a valid JSON array of question objects. No explanation, no markdown, just the JSON array.
Each object must have: idx (number starting at 1), text (string), relatedParagraph (number, 1-indexed guess), type (one of: fact, interpretation, critical, vocabulary).`,
    questionPrompts: {
      easy: `Generate 4 comprehension questions in ENGLISH about this Dutch news article.
Focus on: basic facts, who/what/where/when, main idea.
Keep questions simple and direct.`,
      medium: `Generate 5 comprehension questions in DUTCH (Netherlands Dutch) about this news article.
Focus on: causes and effects, connections between ideas, what quotes mean, implications.
Questions should require reading carefully, not just skimming.`,
      hard: `Generate 6 critical thinking questions in DUTCH (Netherlands Dutch) about this news article.
Focus on: assumptions made, missing perspectives, bias detection, predicting consequences, evaluating arguments.
Questions should challenge the reader to think beyond the text.`,
    },
  },
};
