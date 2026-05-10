"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, Sprout, Leaf, Trees, ArrowRight, Check, ChevronDown,
  Shuffle, Globe, TrendingUp, Landmark, HeartPulse, GraduationCap,
  Trophy, Scale, HandHeart, MapPin, Cpu, Palette, Sparkles, Loader2,
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
  border: string; iconBg: string; iconText: string; ring: string; text: string;
}> = {
  easy: { border: "border-emerald-200", iconBg: "bg-emerald-100", iconText: "text-emerald-700", ring: "ring-emerald-300", text: "text-emerald-900" },
  medium: { border: "border-amber-200", iconBg: "bg-amber-100", iconText: "text-amber-700", ring: "ring-amber-300", text: "text-amber-900" },
  hard: { border: "border-rose-200", iconBg: "bg-rose-100", iconText: "text-rose-700", ring: "ring-rose-300", text: "text-rose-900" },
};

const DATE_LOCALE: Record<LangCode, string> = { pt: "pt-BR", nl: "nl-NL" };

// Stagger config for entrance
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

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
      {/* Aurora — three large gradient washes drifting across the page */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute h-[60vh] w-[60vw] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(245, 158, 11, 0.5), transparent 70%)" }}
          animate={{
            x: ["-15%", "30%", "-10%", "-15%"],
            y: ["-10%", "20%", "10%", "-10%"],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute h-[55vh] w-[55vw] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(37, 99, 235, 0.45), transparent 70%)", right: 0 }}
          animate={{
            x: ["20%", "-10%", "30%", "20%"],
            y: ["50%", "20%", "60%", "50%"],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute h-[50vh] w-[50vw] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(167, 139, 250, 0.35), transparent 70%)" }}
          animate={{
            x: ["60%", "20%", "70%", "60%"],
            y: ["-20%", "40%", "10%", "-20%"],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Top bar */}
      <header className="relative max-w-5xl mx-auto px-6 pt-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="capitalize">{today}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2.5 bg-white border border-line rounded-full px-3.5 py-2 shadow-sm hover:shadow-md transition-all text-sm font-medium"
          >
            <Flag code={lang} className="h-4 w-6" />
            <span className="text-slate-700">{config.label}</span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${langOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-0 mt-2 bg-white border border-line rounded-2xl shadow-xl overflow-hidden min-w-[200px] z-20"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </header>

      {/* Form OR loading skeleton */}
      <AnimatePresence mode="wait">
        {!loading ? (
          <motion.div
            key="form"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            {/* Hero */}
            <section className="relative max-w-3xl mx-auto px-6 pt-12 pb-8 text-center">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-line text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
                <Newspaper className="h-3.5 w-3.5 text-accent" />
                {lang === "pt" ? "Leitura Diária" : "Dagelijkse Lezing"}
              </motion.div>
              <motion.h1 variants={itemVariants} className="font-serif text-6xl md:text-7xl font-bold text-navy leading-[0.95] mb-4">
                {config.brand}
              </motion.h1>
              <motion.p variants={itemVariants} className="font-serif italic text-xl text-slate-500">
                {config.tagline}
              </motion.p>
            </section>

            {/* Selectors */}
            <section className="relative max-w-3xl mx-auto px-6 pb-16">
              {/* Difficulty */}
              <motion.div variants={itemVariants} className="mb-8">
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
                      <motion.button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`relative p-4 rounded-2xl border-2 text-left bg-white ${s.border} ${active ? `ring-2 ${s.ring}` : ""}`}
                      >
                        <AnimatePresence>
                          {active && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 18 }}
                              className="absolute top-2 right-2 h-5 w-5 rounded-full bg-navy text-white flex items-center justify-center"
                            >
                              <Check className="h-3 w-3" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${s.iconBg} ${s.iconText} mb-2.5`}>
                          <Icon className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div className={`font-semibold text-base ${s.text}`}>{meta.label}</div>
                        <div className={`text-xs mt-1 leading-snug ${s.text} opacity-70`}>{meta.desc}</div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Topic */}
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.18em] mb-3">
                  {config.ui.topic}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {config.topics.map((t) => {
                    const Icon = TOPIC_ICONS[t.icon] ?? Sparkles;
                    const active = topic === t.value;
                    return (
                      <motion.button
                        key={t.value}
                        onClick={() => setTopic(t.value)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border font-medium text-sm transition-colors ${
                          active
                            ? "border-navy bg-navy text-white shadow-md"
                            : "border-line bg-white text-slate-600 hover:border-navy/30 hover:text-navy"
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={2} />
                        {t.label}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Live summary */}
              <motion.div variants={itemVariants} className="mb-6 text-center">
                <p className="text-sm text-slate-500">{summaryText}</p>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 text-center text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Start button */}
              <motion.div variants={itemVariants} className="flex justify-center">
                <motion.button
                  onClick={handleStart}
                  whileHover={{ y: -2, boxShadow: "0 12px 32px -8px rgba(26, 35, 50, 0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-navy text-white font-semibold text-base rounded-2xl shadow-lg"
                >
                  {config.ui.startButton.replace(/\s*→\s*$/, "")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </motion.button>
              </motion.div>
            </section>
          </motion.div>
        ) : (
          <LoadingSkeleton key="loading" message={loadingMsg} />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative max-w-3xl mx-auto px-6 pb-10 text-center">
        <p className="text-xs text-slate-400">{config.ui.sourceCredit}</p>
      </footer>
    </main>
  );
}

function LoadingSkeleton({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative max-w-3xl mx-auto px-6 pt-20 pb-16 text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white border border-line shadow-sm mb-6"
      >
        <Loader2 className="h-7 w-7 text-accent" strokeWidth={2.5} />
      </motion.div>
      <h2 className="font-serif text-3xl font-bold text-navy mb-2">{message}</h2>
      <p className="text-sm text-slate-500 mb-10">
        {message.includes("perguntas") || message.includes("vragen") ? "Claude está pensando..." : "Aguarde alguns segundos."}
      </p>

      {/* Shimmer skeleton lines */}
      <div className="max-w-md mx-auto space-y-3">
        {[100, 88, 95, 70].map((width, i) => (
          <motion.div
            key={i}
            className="h-3 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200"
            style={{ width: `${width}%`, backgroundSize: "200% 100%" }}
            animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
