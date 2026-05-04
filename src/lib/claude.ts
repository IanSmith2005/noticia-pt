import Anthropic from "@anthropic-ai/sdk";

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

const DIFFICULTY_PROMPTS = {
  easy: `Generate 4 comprehension questions in ENGLISH about this Brazilian Portuguese news article.
Focus on: basic facts, who/what/where/when, main idea.
Keep questions simple and direct.`,

  medium: `Generate 5 comprehension questions in PORTUGUESE (Brazilian) about this news article.
Focus on: causes and effects, connections between ideas, what quotes mean, implications.
Questions should require reading carefully, not just skimming.`,

  hard: `Generate 6 critical thinking questions in PORTUGUESE (Brazilian) about this news article.
Focus on: assumptions made, missing perspectives, bias detection, predicting consequences, evaluating arguments.
Questions should challenge the reader to think beyond the text.`,
};

export async function generateQuestions(
  articleContent: string,
  articleTitle: string,
  difficulty: "easy" | "medium" | "hard"
): Promise<Question[]> {
  const prompt = DIFFICULTY_PROMPTS[difficulty];

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are an educational tool that helps people improve their Brazilian Portuguese reading comprehension.
Return ONLY a valid JSON array of question objects. No explanation, no markdown, just the JSON array.
Each object must have: idx (number starting at 1), text (string), relatedParagraph (number, 1-indexed guess), type (one of: fact, interpretation, critical, vocabulary).`,
    messages: [
      {
        role: "user",
        content: `Article title: ${articleTitle}\n\nArticle content:\n${articleContent.slice(0, 4000)}\n\n${prompt}`,
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
  const qa = questions.map((q, i) => `Q${i + 1}: ${q.text}\nA${i + 1}: ${answers[i] || "(sem resposta)"}`).join("\n\n");

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
