import type { LanguageConfig, Difficulty } from "./languages";

export type UiLang = "native" | "en";

const ENGLISH_DIFFICULTY_DESC: Record<Difficulty, string> = {
  easy: "Questions in English · Basic facts",
  medium: "Questions in English · Interpretation",
  hard: "Questions in target language · Critical thinking",
};

const ENGLISH_DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const ENGLISH_HERO: { dailyReading: string; sendFeedback: string; joinDiscord: string } = {
  dailyReading: "Daily Reading",
  sendFeedback: "Send feedback",
  joinDiscord: "Join Discord",
};

function englishSummary(topicLabel: string, difficultyKey: Difficulty): string {
  return `You'll read a ${topicLabel.toLowerCase()} article with ${ENGLISH_DIFFICULTY_LABEL[difficultyKey].toLowerCase()}-level questions.`;
}

function nativeSummary(config: LanguageConfig, topicLabel: string, difficultyKey: Difficulty): string {
  if (config.code === "pt") {
    return `Você lerá um artigo de ${topicLabel.toLowerCase()} com perguntas de nível ${config.difficultyMeta[difficultyKey].label.toLowerCase()}.`;
  }
  if (config.code === "nl") {
    return `Je leest een artikel over ${topicLabel.toLowerCase()} met vragen op ${config.difficultyMeta[difficultyKey].label.toLowerCase()} niveau.`;
  }
  return `${config.difficultyMeta[difficultyKey].label}レベルの「${topicLabel}」記事を読みます。`;
}

function nativeHero(config: LanguageConfig): { dailyReading: string; sendFeedback: string; joinDiscord: string } {
  if (config.code === "pt") return { dailyReading: "Leitura Diária", sendFeedback: "Enviar feedback", joinDiscord: "Entrar no Discord" };
  if (config.code === "nl") return { dailyReading: "Dagelijkse Lezing", sendFeedback: "Stuur feedback", joinDiscord: "Join Discord" };
  return { dailyReading: "毎日の読書", sendFeedback: "フィードバックを送る", joinDiscord: "Discordに参加" };
}

export function getUi(config: LanguageConfig, uiLang: UiLang) {
  if (uiLang === "en") {
    return {
      brand: config.brand,
      tagline: "Read more. Understand more.",
      difficulty: "Difficulty",
      topic: "Topic",
      startButton: "Start reading →",
      loadingArticle: "Finding article...",
      loadingQuestions: "Generating questions with AI...",
      notFound: "No article found. Try another topic.",
      sourceCredit: `Articles from ${config.feeds[0]?.source ?? "public sources"} · Creative Commons`,
    };
  }
  return {
    brand: config.brand,
    tagline: config.tagline,
    difficulty: config.ui.difficulty,
    topic: config.ui.topic,
    startButton: config.ui.startButton,
    loadingArticle: config.ui.loadingArticle,
    loadingQuestions: config.ui.loadingQuestions,
    notFound: config.ui.notFound,
    sourceCredit: config.ui.sourceCredit,
  };
}

export function getDifficultyMeta(config: LanguageConfig, uiLang: UiLang, difficultyKey: Difficulty) {
  if (uiLang === "en") {
    return { label: ENGLISH_DIFFICULTY_LABEL[difficultyKey], desc: ENGLISH_DIFFICULTY_DESC[difficultyKey] };
  }
  return config.difficultyMeta[difficultyKey];
}

export function getTopicLabel(config: LanguageConfig, uiLang: UiLang, value: string): string {
  const t = config.topics.find((x) => x.value === value);
  if (!t) return "";
  if (uiLang !== "en") return t.label;
  const enMap: Record<string, string> = {
    random: "Random",
    internacional: "World", economia: "Economy", politica: "Politics",
    saude: "Health", educacao: "Education", esportes: "Sports", justica: "Justice", "direitos-humanos": "Human Rights",
    buitenland: "World", binnenland: "Netherlands", economie: "Economy", politiek: "Politics",
    tech: "Tech", cultuur: "Culture", sport: "Sports",
    shuyou: "Main", kokusai: "World", keizai: "Economy", seiji: "Politics",
    shakai: "Society", kagaku: "Science", bunka: "Culture", sports: "Sports",
  };
  return enMap[value] ?? t.label;
}

export function getHeroStrings(config: LanguageConfig, uiLang: UiLang) {
  return uiLang === "en" ? ENGLISH_HERO : nativeHero(config);
}

export function getSummary(config: LanguageConfig, uiLang: UiLang, topicValue: string, difficultyKey: Difficulty): string {
  const topicLabel = getTopicLabel(config, uiLang, topicValue);
  if (uiLang === "en") return englishSummary(topicLabel, difficultyKey);
  return nativeSummary(config, topicLabel, difficultyKey);
}
