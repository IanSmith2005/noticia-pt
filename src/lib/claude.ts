import Anthropic from "@anthropic-ai/sdk";
import type { LanguageConfig, Difficulty } from "@/config/languages";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type Question = {
  idx: number;
  text: string;
  relatedParagraph: number;
  type: "fact" | "interpretation" | "critical" | "vocabulary";
};

export type AnswerResult = {
  result: "correct" | "partly_correct" | "incorrect";
  feedback: string;
  betterAnswer: string;
};

export async function generateQuestions(
  config: LanguageConfig,
  articleContent: string,
  articleTitle: string,
  difficulty: Difficulty
): Promise<Question[]> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: config.claude.systemPrompt,
    messages: [
      {
        role: "user",
        content: `Article title: ${articleTitle}\n\nArticle content:\n${articleContent.slice(0, 4000)}\n\n${config.claude.questionPrompts[difficulty]}`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "[]";
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  }
}

export async function checkAnswers(
  articleContent: string,
  questions: { text: string }[],
  answers: string[]
): Promise<AnswerResult[]> {
  const qa = questions.map((q, i) => `Q${i + 1}: ${q.text}\nA${i + 1}: ${answers[i] || "(no answer)"}`).join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: `You are an educational assistant evaluating reading comprehension answers.
Be fair but thorough. Partial credit for answers that get part of the idea right.
Return ONLY a valid JSON array. Each object: result ("correct"|"partly_correct"|"incorrect"), feedback (in English, 1-2 sentences), betterAnswer (in English, what a good answer would say).`,
    messages: [
      {
        role: "user",
        content: `Article (excerpt):\n${articleContent.slice(0, 3000)}\n\nQuestions and student answers:\n${qa}\n\nEvaluate each answer based on the article content.`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "[]";
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  }
}
