import type { LanguageConfig } from "./index";

export const ptConfig: LanguageConfig = {
  code: "pt",
  label: "Português",
  flag: "🇧🇷",
  brand: "Notícia PT",
  tagline: "Leia mais. Entenda mais.",

  feeds: [
    { url: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml", source: "Agência Brasil", topic: "geral" },
    { url: "https://agenciabrasil.ebc.com.br/rss/internacional/feed.xml", source: "Agência Brasil", topic: "internacional" },
    { url: "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml", source: "Agência Brasil", topic: "economia" },
    { url: "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml", source: "Agência Brasil", topic: "politica" },
    { url: "https://agenciabrasil.ebc.com.br/rss/saude/feed.xml", source: "Agência Brasil", topic: "saude" },
    { url: "https://agenciabrasil.ebc.com.br/rss/educacao/feed.xml", source: "Agência Brasil", topic: "educacao" },
    { url: "https://agenciabrasil.ebc.com.br/rss/esportes/feed.xml", source: "Agência Brasil", topic: "esportes" },
    { url: "https://agenciabrasil.ebc.com.br/rss/justica/feed.xml", source: "Agência Brasil", topic: "justica" },
    { url: "https://agenciabrasil.ebc.com.br/rss/direitos-humanos/feed.xml", source: "Agência Brasil", topic: "direitos-humanos" },
  ],

  topics: [
    { value: "random", label: "Aleatório", icon: "Shuffle" },
    { value: "internacional", label: "Mundo", icon: "Globe" },
    { value: "economia", label: "Economia", icon: "TrendingUp" },
    { value: "politica", label: "Política", icon: "Landmark" },
    { value: "saude", label: "Saúde", icon: "HeartPulse" },
    { value: "educacao", label: "Educação", icon: "GraduationCap" },
    { value: "esportes", label: "Esportes", icon: "Trophy" },
    { value: "justica", label: "Justiça", icon: "Scale" },
    { value: "direitos-humanos", label: "Direitos Humanos", icon: "HandHeart" },
  ],

  ui: {
    difficulty: "Dificuldade",
    topic: "Tópico",
    startButton: "Começar a Leitura →",
    loadingArticle: "Buscando artigo...",
    loadingQuestions: "Gerando perguntas com IA...",
    notFound: "Nenhum artigo encontrado. Tente outro tópico.",
    sourceCredit: "Artigos da Agência Brasil · Licença Creative Commons",
    questionLabel: "Pergunta",
    answerPlaceholder: "Escreva sua resposta em português...",
    answerPlaceholderEn: "Write your answer in English...",
    answerInLabel: "Responder em",
    seeExcerpt: "Ver trecho →",
    answeredCount: (a, b) => `${a}/${b} respondidas`,
    checkAnswers: "Verificar Respostas →",
    checking: "Verificando com IA...",
    newArticle: "Novo Artigo →",
    result: "Resultado",
    correct: "corretas",
    partial: "parciais",
    incorrect: "incorretas",
    correctLabel: "✓ Correto",
    partialLabel: "◑ Parcialmente correto",
    incorrectLabel: "✗ Incorreto",
    betterAnswer: "Better answer",
    minutes: "min",
    seeOriginal: "Ver original ↗",
    articleTab: "Artigo",
    questionsTab: "Perguntas",
  },

  difficultyMeta: {
    easy: { label: "Fácil", desc: "Perguntas em inglês · Fatos básicos", questionLang: "en" },
    medium: { label: "Médio", desc: "Perguntas em inglês · Interpretação", questionLang: "en" },
    hard: { label: "Difícil", desc: "Perguntas em português · Pensamento crítico", questionLang: "native" },
  },

  cleanContent: (text) => text.trim(),

  claude: {
    systemPrompt: `You are an educational tool that helps people improve their Brazilian Portuguese reading comprehension.
Return ONLY a valid JSON array of question objects. No explanation, no markdown, just the JSON array.
Each object must have: idx (number starting at 1), text (string), relatedParagraph (number, 1-indexed guess), type (one of: fact, interpretation, critical, vocabulary).`,
    questionPrompts: {
      easy: `Generate 4 comprehension questions in ENGLISH about this Brazilian Portuguese news article.
Focus on: basic facts, who/what/where/when, main idea.
Keep questions simple and direct.`,
      medium: `Generate 5 comprehension questions in ENGLISH about this Brazilian Portuguese news article.
Focus on: causes and effects, connections between ideas, what quotes mean, implications.
Questions should require reading carefully, not just skimming.`,
      hard: `Generate 6 critical thinking questions in PORTUGUESE (Brazilian) about this news article.
Focus on: assumptions made, missing perspectives, bias detection, predicting consequences, evaluating arguments.
Questions should challenge the reader to think beyond the text.`,
    },
  },
};
