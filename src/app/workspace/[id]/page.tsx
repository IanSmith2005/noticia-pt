"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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

type Exercise = {
  id: string;
  difficulty: string;
  questionLang: string;
  totalQ: number;
};

type Article = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  estimatedMinutes: number;
  difficulty: string;
  content: string;
  sourceUrl: string;
};

const RESULT_COLORS = {
  correct: "bg-green-50 border-green-400",
  partly_correct: "bg-yellow-50 border-yellow-400",
  incorrect: "bg-red-50 border-red-400",
};

const RESULT_LABELS = {
  correct: "✓ Correto",
  partly_correct: "◑ Parcialmente correto",
  incorrect: "✗ Incorreto",
};

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<AnswerResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<"article" | "questions">("article");
  const [highlightedPara, setHighlightedPara] = useState<number | null>(null);
  const paraRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    // Load exercise from sessionStorage (set by home page flow)
    const stored = sessionStorage.getItem(`exercise_${id}`);
    if (stored) {
      const data = JSON.parse(stored);
      setExercise(data.exercise);
      setArticle(data.article);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
    } else {
      // Fetch from API if navigated directly
      fetch(`/api/exercise/${id}`).then((r) => r.json()).then((data) => {
        if (data.exercise) {
          setExercise(data.exercise);
          setArticle(data.article);
          setQuestions(data.questions);
          setAnswers(new Array(data.questions.length).fill(""));
        }
      });
    }
  }, [id]);

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
    if (!exercise) return;
    setChecking(true);
    const res = await fetch("/api/check-answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: exercise.id, questions, answers }),
    });
    const data = await res.json();
    setResults(data.results);
    setScore(data.score);
    setChecking(false);
    setActiveTab("questions");
  }

  if (!exercise || !article) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📰</div>
          <p className="text-slate-500">Preparando seu artigo...</p>
        </div>
      </div>
    );
  }

  const paragraphs = article.content.split(/\n+/).filter((p) => p.trim().length > 50);

  const difficultyColor = {
    easy: "text-green-600 bg-green-100",
    medium: "text-yellow-700 bg-yellow-100",
    hard: "text-red-600 bg-red-100",
  }[exercise.difficulty] || "text-slate-600 bg-slate-100";

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Nav */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 font-bold text-navy text-lg">
          <span>📰</span> Notícia PT
        </button>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyColor}`}>
            {exercise.difficulty.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">⏱ {article.estimatedMinutes} min</span>
          {session?.user?.name && (
            <span className="text-xs text-slate-400 hidden md:inline">{session.user.name}</span>
          )}
        </div>
      </nav>

      {/* Mobile Tabs */}
      <div className="md:hidden flex border-b border-slate-200 bg-white">
        <button
          onClick={() => setActiveTab("article")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "article" ? "text-accent border-b-2 border-accent" : "text-slate-400"}`}
        >
          Artigo
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "questions" ? "text-accent border-b-2 border-accent" : "text-slate-400"}`}
        >
          Perguntas ({questions.length})
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Article Panel */}
        <div className={`${activeTab === "article" ? "flex" : "hidden"} md:flex flex-col w-full md:w-3/5 overflow-y-auto border-r border-slate-200 bg-white`}>
          <div className="max-w-2xl mx-auto px-6 py-8">
            {/* Article Meta */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-navy leading-tight mb-3">{article.title}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="font-medium text-slate-700">{article.source}</span>
                <span>·</span>
                <span>{new Date(article.publishedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</span>
                <span>·</span>
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  Ver original ↗
                </a>
              </div>
            </div>

            {/* Article Body */}
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
        <div className={`${activeTab === "questions" ? "flex" : "hidden"} md:flex flex-col w-full md:w-2/5 overflow-y-auto bg-surface`}>
          <div className="px-5 py-6 space-y-5">
            {/* Score Summary */}
            {score !== null && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-navy text-lg mb-1">
                  Resultado: {score}%
                </h3>
                <div className="flex gap-3 text-sm mt-2">
                  <span className="text-green-600">✓ {results?.filter((r) => r.result === "correct").length} corretas</span>
                  <span className="text-yellow-600">◑ {results?.filter((r) => r.result === "partly_correct").length} parciais</span>
                  <span className="text-red-600">✗ {results?.filter((r) => r.result === "incorrect").length} incorretas</span>
                </div>
                <button
                  onClick={() => router.push("/")}
                  className="mt-4 w-full py-2 rounded-xl border-2 border-accent text-accent font-semibold text-sm hover:bg-accent hover:text-white transition-all"
                >
                  Novo artigo →
                </button>
              </div>
            )}

            {/* Question Cards */}
            {questions.map((q, i) => {
              const result = results?.[i];
              return (
                <div
                  key={i}
                  className={`bg-white rounded-2xl p-5 border-2 shadow-sm transition-all ${
                    result ? RESULT_COLORS[result.result] : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Pergunta {i + 1}
                    </span>
                    <button
                      onClick={() => highlightParagraph(q.relatedParagraph)}
                      className="text-xs text-accent hover:underline"
                    >
                      Ver trecho →
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
                      placeholder={exercise.questionLang === "en" ? "Write your answer here..." : "Escreva sua resposta aqui..."}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none bg-slate-50"
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold">
                        {result && (
                          <span className={
                            result.result === "correct" ? "text-green-700" :
                            result.result === "partly_correct" ? "text-yellow-700" : "text-red-700"
                          }>
                            {RESULT_LABELS[result.result]}
                          </span>
                        )}
                      </div>
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
                          <span className="font-semibold text-blue-800">Better answer: </span>
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
      <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between sticky bottom-0 z-10">
        <div className="text-sm text-slate-400">
          {answers.filter((a) => a.trim()).length}/{questions.length} respondidas
        </div>
        {!results ? (
          <button
            onClick={handleCheckAnswers}
            disabled={checking || answers.every((a) => !a.trim())}
            className="px-6 py-2 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {checking ? "Verificando..." : "Verificar Respostas →"}
          </button>
        ) : (
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition-all text-sm"
          >
            Novo Artigo →
          </button>
        )}
      </div>
    </div>
  );
}
