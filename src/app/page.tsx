"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LANGUAGES, DEFAULT_LANG, type LangCode } from "@/config/languages";

const DIFFICULTY_STYLES = {
  easy:   { border: "border-green-400",  bg: "bg-green-50",  text: "text-green-800",  activeBorder: "border-green-500",  activeBg: "bg-green-100",  ring: "ring-green-300" },
  medium: { border: "border-yellow-400", bg: "bg-yellow-50", text: "text-yellow-800", activeBorder: "border-yellow-500", activeBg: "bg-yellow-100", ring: "ring-yellow-300" },
  hard:   { border: "border-red-400",    bg: "bg-red-50",    text: "text-red-800",    activeBorder: "border-red-500",    activeBg: "bg-red-100",    ring: "ring-red-300" },
} as const;

type Diff = keyof typeof DIFFICULTY_STYLES;

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<LangCode>(DEFAULT_LANG);
  const [topic, setTopic] = useState("random");
  const [difficulty, setDifficulty] = useState<Diff>("medium");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [langOpen, setLangOpen] = useState(false);

  // Load saved language preference
  useEffect(() => {
    const saved = localStorage.getItem("lang") as LangCode | null;
    if (saved && saved in LANGUAGES) setLang(saved);
  }, []);

  const config = LANGUAGES[lang];

  function changeLang(newLang: LangCode) {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    setTopic("random"); // reset topic since lists differ between langs
    setLangOpen(false);
  }

  async function handleStart() {
    setLoading(true);
    setError("");
    setLoadingMsg(config.ui.loadingArticle);

    try {
      const res = await fetch(`/api/articles?topic=${topic}&lang=${lang}`);
      const articles = await res.json();

      if (!articles.length) {
        setError(config.ui.notFound);
        setLoading(false);
        return;
      }

      const article = articles[0];
      setLoadingMsg(config.ui.loadingQuestions);

      const exRes = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article, difficulty, lang }),
      });
      const { questions } = await exRes.json();

      sessionStorage.setItem("exercise", JSON.stringify({ article, questions, difficulty, lang }));
      router.push("/workspace");
    } catch {
      setError(config.ui.notFound);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center px-4 py-12 relative">
      {/* Language dropdown — top right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLangOpen(!langOpen)}
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm hover:bg-slate-50 transition-all text-sm font-medium"
        >
          <span className="text-xl">{config.flag}</span>
          <span className="text-navy">{config.label}</span>
          <span className="text-slate-400 text-xs">▼</span>
        </button>

        {langOpen && (
          <div className="absolute right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[180px]">
            {(Object.keys(LANGUAGES) as LangCode[]).map((code) => {
              const c = LANGUAGES[code];
              const active = code === lang;
              return (
                <button
                  key={code}
                  onClick={() => changeLang(code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${active ? "bg-blue-50 text-accent font-semibold" : "text-navy"}`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="text-center mb-12 mt-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <span className="text-4xl">📰</span>
          <h1 className="text-4xl font-bold text-navy">{config.brand}</h1>
        </div>
        <p className="text-lg text-slate-500 mt-1">{config.tagline}</p>
      </div>

      {/* Difficulty */}
      <div className="w-full max-w-2xl mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{config.ui.difficulty}</h2>
        <div className="grid grid-cols-3 gap-3">
          {(["easy", "medium", "hard"] as const).map((d) => {
            const meta = config.difficultyMeta[d];
            const s = DIFFICULTY_STYLES[d];
            const active = difficulty === d;
            return (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  active
                    ? `${s.activeBorder} ${s.activeBg} ${s.text} ring-2 ${s.ring}`
                    : `${s.border} ${s.bg} ${s.text} hover:opacity-80`
                }`}
              >
                <div className="font-semibold text-base">{meta.label}</div>
                <div className="text-xs mt-1 opacity-75">{meta.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic */}
      <div className="w-full max-w-2xl mb-10">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{config.ui.topic}</h2>
        <div className="flex flex-wrap gap-2">
          {config.topics.map((t) => (
            <button
              key={t.value}
              onClick={() => setTopic(t.value)}
              className={`px-4 py-2 rounded-full border-2 font-medium text-sm transition-all ${
                topic === t.value
                  ? "border-accent bg-accent text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-accent hover:text-accent"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={handleStart}
        disabled={loading}
        className="px-10 py-4 bg-accent hover:bg-accent-dark text-white font-semibold text-lg rounded-2xl shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? loadingMsg : config.ui.startButton}
      </button>

      <p className="text-xs text-slate-400 mt-6">{config.ui.sourceCredit}</p>
    </main>
  );
}
