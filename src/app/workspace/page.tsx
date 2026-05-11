"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Newspaper, Clock, ExternalLink, ArrowRight, BookOpen, ListChecks, CheckCircle2, CircleSlash, CircleDot } from "lucide-react";
import confetti from "canvas-confetti";
import { LANGUAGES, DEFAULT_LANG, type LangCode } from "@/config/languages";
import { Flag } from "@/components/Flag";

function AnimatedScore({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] });
    return controls.stop;
  }, [count, value]);

  return <motion.span>{rounded}</motion.span>;
}

function fireConfetti() {
  const duration = 1500;
  const end = Date.now() + duration;
  const colors = ["#2563eb", "#f59e0b", "#10b981", "#f43f5e"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

type Question = {
  idx: number;
  text: string;
  relatedParagraph: number;
  type: string;
};

type AnswerResult = {
  result: "correct" | "partly_correct" | "incorrect";
  feedback: string;
  betterAnswer: string;
};

type Article = {
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  estimatedMinutes: number;
  difficulty: string;
  content: string;
};

const RESULT_BORDER_BG = {
  correct: "border-green-400 bg-green-50",
  partly_correct: "border-yellow-400 bg-yellow-50",
  incorrect: "border-red-400 bg-red-50",
};

const RESULT_TEXT = {
  correct: "text-green-700",
  partly_correct: "text-yellow-700",
  incorrect: "text-red-700",
};

export default function WorkspacePage() {
  const router = useRouter();
  const [lang, setLang] = useState<LangCode>(DEFAULT_LANG);
  const [article, setArticle] = useState<Article | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [difficulty, setDifficulty] = useState("medium");
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<AnswerResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<"article" | "questions">("article");
  const [highlightedPara, setHighlightedPara] = useState<number | null>(null);
  const paraRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("exercise");
    if (!stored) { router.push("/"); return; }
    const data = JSON.parse(stored);
    setArticle(data.article);
    setQuestions(data.questions);
    setDifficulty(data.difficulty);
    setLang(data.lang || DEFAULT_LANG);
    setAnswers(new Array(data.questions.length).fill(""));
  }, [router]);

  function highlightParagraph(paraIdx: number) {
    setHighlightedPara(paraIdx);
    const el = paraRefs.current[paraIdx - 1];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight-pulse");
      setTimeout(() => el.classList.remove("highlight-pulse"), 1600);
    }
    setActiveTab("article");
  }

  async function handleCheckAnswers() {
    if (!article) return;
    setChecking(true);
    const res = await fetch("/api/check-answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleContent: article.content,
        questions,
        answers,
        lang,
      }),
    });
    const data = await res.json();
    setResults(data.results);
    setScore(data.score);
    setChecking(false);
    setActiveTab("questions");
    if (data.score === 100) {
      setTimeout(() => fireConfetti(), 400);
    }
  }

  const config = LANGUAGES[lang];

  if (!article) {
    return (
      <div className="min-h-screen bg-grain flex items-center justify-center">
        <div className="text-center">
          <Newspaper className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-slate-500">{config.ui.loadingArticle}</p>
        </div>
      </div>
    );
  }

  const paragraphs = article.content.split(/\n+/).filter((p) => p.trim().length > 50);

  const difficultyColor: Record<string, string> = {
    easy: "text-green-600 bg-green-100",
    medium: "text-yellow-700 bg-yellow-100",
    hard: "text-red-600 bg-red-100",
  };

  const localeMap: Record<LangCode, string> = { pt: "pt-BR", nl: "nl-NL" };

  return (
    <div className="min-h-screen bg-grain flex flex-col">
      {/* Top Nav */}
      <nav className="bg-white border-b border-line px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.push("/")} className="flex items-center gap-2.5 group">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 text-navy">
            <Newspaper className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="font-serif font-bold text-navy text-lg group-hover:text-slate-700 transition-colors">{config.brand}</span>
        </button>
        <div className="flex items-center gap-3">
          <Flag code={lang} className="h-3.5 w-5" />
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColor[difficulty] || "text-slate-600 bg-slate-100"}`}>
            {difficulty.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400 inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {article.estimatedMinutes} {config.ui.minutes}
          </span>
        </div>
      </nav>

      {/* Mobile Tabs */}
      <div className="md:hidden flex border-b border-line bg-white">
        <button
          onClick={() => setActiveTab("article")}
          className={`flex-1 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors ${activeTab === "article" ? "text-accent border-b-2 border-accent" : "text-slate-400"}`}
        >
          <BookOpen className="h-4 w-4" /> {config.ui.articleTab}
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`flex-1 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors ${activeTab === "questions" ? "text-accent border-b-2 border-accent" : "text-slate-400"}`}
        >
          <ListChecks className="h-4 w-4" /> {config.ui.questionsTab} ({questions.length})
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Article Panel */}
        <div className={`${activeTab === "article" ? "flex" : "hidden"} md:flex flex-col w-full md:w-3/5 overflow-y-auto border-r border-line bg-white thin-scroll`}>
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="mb-6">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy leading-tight mb-3">{article.title}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="font-medium text-slate-700">{article.source}</span>
                <span>·</span>
                <span>{new Date(article.publishedAt).toLocaleDateString(localeMap[lang], { day: "numeric", month: "long", year: "numeric" })}</span>
                <span>·</span>
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
                  {config.ui.seeOriginal.replace(/\s*↗\s*$/, "")}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <div className="article-body">
              {paragraphs.map((para, i) => (
                <p
                  key={i}
                  ref={(el) => { paraRefs.current[i] = el; }}
                  className={`transition-colors rounded px-1 -mx-1 ${highlightedPara === i + 1 ? "bg-blue-50" : ""}`}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Questions Panel */}
        <div className={`${activeTab === "questions" ? "flex" : "hidden"} md:flex flex-col w-full md:w-2/5 overflow-y-auto thin-scroll`}>
          <div className="px-5 py-6 space-y-5">
            {/* Score Summary */}
            {score !== null && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="bg-white rounded-2xl p-5 border border-line shadow-sm"
              >
                <h3 className="font-serif font-bold text-navy text-2xl mb-2">
                  {config.ui.result}: <AnimatedScore value={score} />%
                </h3>
                <div className="flex flex-wrap gap-3 text-sm mt-2">
                  <span className="inline-flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> {results?.filter((r) => r.result === "correct").length} {config.ui.correct}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-amber-700">
                    <CircleDot className="h-4 w-4" /> {results?.filter((r) => r.result === "partly_correct").length} {config.ui.partial}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-rose-700">
                    <CircleSlash className="h-4 w-4" /> {results?.filter((r) => r.result === "incorrect").length} {config.ui.incorrect}
                  </span>
                </div>
                <button
                  onClick={() => router.push("/")}
                  className="mt-4 w-full py-2.5 rounded-xl border-2 border-navy text-navy font-semibold text-sm hover:bg-navy hover:text-white transition-all inline-flex items-center justify-center gap-2"
                >
                  {config.ui.newArticle.replace(/\s*→\s*$/, "")} <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {/* Question Cards */}
            {questions.map((q, i) => {
              const result = results?.[i];
              return (
                <div
                  key={i}
                  className={`bg-white rounded-2xl p-5 border-2 shadow-sm transition-all ${result ? RESULT_BORDER_BG[result.result] : "border-line"}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {config.ui.questionLabel} {i + 1}
                    </span>
                    <button
                      onClick={() => highlightParagraph(q.relatedParagraph)}
                      className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                    >
                      {config.ui.seeExcerpt.replace(/\s*→\s*$/, "")}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  <p className="text-sm font-medium text-navy mb-3 leading-relaxed">{q.text}</p>

                  {!results ? (
                    <textarea
                      rows={3}
                      value={answers[i]}
                      onChange={(e) => {
                        const updated = [...answers];
                        updated[i] = e.target.value;
                        setAnswers(updated);
                      }}
                      placeholder={config.ui.answerPlaceholder}
                      className="w-full text-sm border border-line rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none bg-slate-50"
                    />
                  ) : (
                    <div className="space-y-2">
                      {result && (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${RESULT_TEXT[result.result]}`}>
                          {result.result === "correct" && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {result.result === "partly_correct" && <CircleDot className="h-3.5 w-3.5" />}
                          {result.result === "incorrect" && <CircleSlash className="h-3.5 w-3.5" />}
                          {result.result === "correct" ? config.ui.correctLabel.replace(/^\W+\s*/, "")
                          : result.result === "partly_correct" ? config.ui.partialLabel.replace(/^\W+\s*/, "")
                          : config.ui.incorrectLabel.replace(/^\W+\s*/, "")}
                        </span>
                      )}
                      {answers[i] && (
                        <p className="text-xs text-slate-500 italic">"{answers[i]}"</p>
                      )}
                      {result?.feedback && (
                        <p className="text-xs text-slate-700 bg-white rounded-lg p-2 border border-slate-100">
                          {result.feedback}
                        </p>
                      )}
                      {result?.betterAnswer && result.result !== "correct" && (
                        <div className="text-xs text-slate-600 bg-blue-50 rounded-lg p-2 border border-blue-100">
                          <span className="font-semibold text-blue-800">{config.ui.betterAnswer}: </span>
                          {result.betterAnswer}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-line px-4 py-3 flex items-center justify-between sticky bottom-0 z-10">
        <div className="text-sm text-slate-400">
          {config.ui.answeredCount(answers.filter((a) => a.trim()).length, questions.length)}
        </div>
        {!results ? (
          <button
            onClick={handleCheckAnswers}
            disabled={checking || answers.every((a) => !a.trim())}
            className="group px-6 py-2.5 bg-navy hover:bg-slate-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm inline-flex items-center gap-2"
          >
            {checking ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {config.ui.checking}
              </>
            ) : (
              <>
                {config.ui.checkAnswers.replace(/\s*→\s*$/, "")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => router.push("/")}
            className="group px-6 py-2.5 bg-navy hover:bg-slate-800 text-white font-semibold rounded-xl transition-all text-sm inline-flex items-center gap-2"
          >
            {config.ui.newArticle.replace(/\s*→\s*$/, "")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}
