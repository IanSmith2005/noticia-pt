"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Newspaper, Sprout, Leaf, Trees, ArrowRight, Check, ChevronDown,
  Shuffle, Globe, TrendingUp, Landmark, HeartPulse, GraduationCap,
  Trophy, Scale, HandHeart, MapPin, Cpu, Palette, Sparkles,
  type LucideIcon,
} from "lucide-react";
import { LANGUAGES, DEFAULT_LANG, type LangCode } from "@/config/languages";
import { Flag } from "@/components/Flag";

const TOPIC_ICONS: Record<string, LucideIcon> = {
  Shuffle, Globe, TrendingUp, Landmark, HeartPulse, GraduationCap,
  Trophy, Scale, HandHeart, MapPin, Cpu, Palette,
};

type Diff = "easy" | "medium" | "hard";

const DIFFICULTY_ICONS: Record<Diff, LucideIcon> = {
  easy: Sprout,
  medium: Leaf,
  hard: Trees,
};

const DIFFICULTY_STYLES: Record<Diff, {
  border: string; bg: string; text: string; iconBg: string; iconText: string; ring: string;
}> = {
  easy: {
    border: "border-emerald-200", bg: "bg-emerald-50/50", text: "text-emerald-900",
    iconBg: "bg-emerald-100", iconText: "text-emerald-700", ring: "ring-emerald-300",
  },
  medium: {
    border: "border-amber-200", bg: "bg-amber-50/50", text: "text-amber-900",
    iconBg: "bg-amber-100", iconText: "text-amber-700", ring: "ring-amber-300",
  },
  hard: {
    border: "border-rose-200", bg: "bg-rose-50/50", text: "text-rose-900",
    iconBg: "bg-rose-100", iconText: "text-rose-700", ring: "ring-rose-300",
  },
};

const DATE_LOCALE: Record<LangCode, string> = { pt: "pt-BR", nl: "nl-NL" };

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<LangCode>(DEFAULT_LANG);
  const [topic, setTopic] = useState("random");
  const [difficulty, setDifficulty] = useState<Diff>("medium");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lang") as LangCode | null;
    if (saved && saved in LANGUAGES) setLang(saved);
  }, []);

  const config = LANGUAGES[lang];

  function changeLang(newLang: LangCode) {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    setTopic("random");
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

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(DATE_LOCALE[lang], {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  }, [lang]);

  const selectedTopicLabel = config.topics.find((t) => t.value === topic)?.label ?? "";
  const summaryText =
    lang === "pt"
      ? `Você lerá um artigo de ${selectedTopicLabel.toLowerCase()} com perguntas de nível ${config.difficultyMeta[difficulty].label.toLowerCase()}.`
      : `Je leest een artikel over ${selectedTopicLabel.toLowerCase()} met vragen op ${config.difficultyMeta[difficulty].label.toLowerCase()} niveau.`;

  return (
    <main className="min-h-screen bg-grain relative overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" aria-hidden />

      {/* Top bar */}
      <header className="relative max-w-5xl mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="capitalize">{today}</span>
        </div>

        {/* Language dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2.5 bg-white border border-line rounded-full px-3.5 py-2 shadow-sm hover:shadow-md transition-all text-sm font-medium"
          >
            <Flag code={lang} className="h-4 w-6" />
            <span className="text-slate-700">{config.label}</span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${langOpen ? "rotate-180" : ""}`} />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-line rounded-2xl shadow-xl overflow-hidden min-w-[200px] z-20">
              {(Object.keys(LANGUAGES) as LangCode[]).map((code) => {
                const c = LANGUAGES[code];
                const active = code === lang;
                return (
                  <button
                    key={code}
                    onClick={() => changeLang(code)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${active ? "bg-blue-50" : ""}`}
                  >
                    <Flag code={code} className="h-4 w-6" />
                    <span className={active ? "font-semibold text-slate-900" : "text-slate-700"}>{c.label}</span>
                    {active && <Check className="h-4 w-4 text-accent ml-auto" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-3xl mx-auto px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
          <Newspaper className="h-3.5 w-3.5 text-accent" />
          {lang === "pt" ? "Leitura Diária" : "Dagelijkse Lezing"}
        </div>
        <h1 className="font-serif text-6xl md:text-7xl font-bold text-navy leading-[0.95] mb-4">
          {config.brand}
        </h1>
        <p className="font-serif italic text-xl text-slate-500">{config.tagline}</p>
      </section>

      {/* Difficulty + Topic + Action */}
      <section className="relative max-w-3xl mx-auto px-6 pb-16">
        {/* Difficulty */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] mb-3">
            {config.ui.difficulty}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {(["easy", "medium", "hard"] as const).map((d) => {
              const meta = config.difficultyMeta[d];
              const s = DIFFICULTY_STYLES[d];
              const Icon = DIFFICULTY_ICONS[d];
              const active = difficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`lift-on-hover relative p-4 rounded-2xl border-2 text-left bg-white ${s.border} ${active ? `ring-2 ${s.ring}` : ""}`}
                >
                  {active && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-navy text-white flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${s.iconBg} ${s.iconText} mb-2.5`}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className={`font-semibold text-base ${s.text}`}>{meta.label}</div>
                  <div className={`text-xs mt-1 leading-snug ${s.text} opacity-70`}>{meta.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] mb-3">
            {config.ui.topic}
          </h2>
          <div className="flex flex-wrap gap-2">
            {config.topics.map((t) => {
              const Icon = TOPIC_ICONS[t.icon] ?? Sparkles;
              const active = topic === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTopic(t.value)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border font-medium text-sm transition-all ${
                    active
                      ? "border-navy bg-navy text-white shadow-md"
                      : "border-line bg-white text-slate-600 hover:border-navy/30 hover:text-navy"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live summary */}
        <div className="mb-6 text-center">
          <p className="text-sm text-slate-500">{summaryText}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-center text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        {/* Start button */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            disabled={loading}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-navy hover:bg-slate-800 text-white font-semibold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                {loadingMsg}
              </>
            ) : (
              <>
                {config.ui.startButton.replace(/\s*→\s*$/, "")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative max-w-3xl mx-auto px-6 pb-10 text-center">
        <p className="text-xs text-slate-400">
          {config.ui.sourceCredit}
        </p>
      </footer>
    </main>
  );
}
