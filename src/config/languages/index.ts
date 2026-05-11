import { ptConfig } from "./pt";
import { nlConfig } from "./nl";
import { jaConfig } from "./ja";

export type LangCode = "pt" | "nl" | "ja";

export type Difficulty = "easy" | "medium" | "hard";

export type Topic = {
  value: string;
  label: string;
  icon: string;
};

export type Feed = {
  url: string;
  source: string;
  topic: string;
};

export type LanguageConfig = {
  code: LangCode;
  label: string;
  flag: string;
  brand: string;
  tagline: string;
  feeds: Feed[];
  topics: Topic[];
  ui: {
    difficulty: string;
    topic: string;
    startButton: string;
    loadingArticle: string;
    loadingQuestions: string;
    notFound: string;
    sourceCredit: string;
    questionLabel: string;
    answerPlaceholder: string;
    answerPlaceholderEn: string;
    answerInLabel: string;
    seeExcerpt: string;
    answeredCount: (a: number, b: number) => string;
    checkAnswers: string;
    checking: string;
    newArticle: string;
    result: string;
    correct: string;
    partial: string;
    incorrect: string;
    correctLabel: string;
    partialLabel: string;
    incorrectLabel: string;
    betterAnswer: string;
    minutes: string;
    seeOriginal: string;
    articleTab: string;
    questionsTab: string;
  };
  difficultyMeta: Record<Difficulty, {
    label: string;
    desc: string;
    questionLang: "en" | "native";
  }>;
  claude: {
    systemPrompt: string;
    questionPrompts: Record<Difficulty, string>;
  };
  cleanContent: (text: string) => string;
};

export const LANGUAGES: Record<LangCode, LanguageConfig> = {
  pt: ptConfig,
  nl: nlConfig,
  ja: jaConfig,
};

export const DEFAULT_LANG: LangCode = "pt";

export function getConfig(code: string | null | undefined): LanguageConfig {
  if (code && (code === "pt" || code === "nl" || code === "ja")) return LANGUAGES[code];
  return LANGUAGES[DEFAULT_LANG];
}
