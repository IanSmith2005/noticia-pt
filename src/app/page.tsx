"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TOPICS = [
  { value: "random", label: "Aleatório", emoji: "🎲" },
  { value: "internacional", label: "Mundo", emoji: "🌍" },
  { value: "economia", label: "Economia", emoji: "📈" },
  { value: "politica", label: "Política", emoji: "🏛️" },
  { value: "saude", label: "Saúde", emoji: "🏥" },
  { value: "educacao", label: "Educação", emoji: "🎓" },
  { value: "esportes", label: "Esportes", emoji: "⚽" },
  { value: "justica", label: "Justiça", emoji: "⚖️" },
  { value: "direitos-humanos", label: "Direitos Humanos", emoji: "🤝" },
];

const DIFFICULTIES = [
  {
    value: "easy",
    label: "Fácil",
    desc: "Perguntas em inglês · Fatos básicos",
    border: "border-green-400",
    bg: "bg-green-50",
    text: "text-green-800",
    activeBorder: "border-green-500",
    activeBg: "bg-green-100",
    ring: "ring-green-300",
  },
  {
    value: "medium",
    label: "Médio",
    desc: "Perguntas em português · Interpretação",
    border: "border-yellow-400",
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    activeBorder: "border-yellow-500",
    activeBg: "bg-yellow-100",
    ring: "ring-yellow-300",
  },
  {
    value: "hard",
    label: "Difícil",
    desc: "Perguntas em português · Pensamento crítico",
    border: "border-red-400",
    bg: "bg-red-50",
    text: "text-red-800",
    activeBorder: "border-red-500",
    activeBg: "bg-red-100",
    ring: "ring-red-300",
  },
];

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState("random");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");

  async function handleStart() {
    setLoading(true);
    setError("");
    setLoadingMsg("Buscando artigo...");

    try {
      const res = await fetch(`/api/articles?topic=${topic}&difficulty=${difficulty}`);
      const articles = await res.json();

      if (!articles.length) {
        setError("Nenhum artigo encontrado. Tente outro tópico.");
        setLoading(false);
        return;
      }

      const article = articles[0];
      setLoadingMsg("Gerando perguntas com IA...");

      const exRes = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article, difficulty }),
      });
      const { questions } = await exRes.json();

      sessionStorage.setItem("exercise", JSON.stringify({ article, questions, difficulty }));
      router.push("/workspace");
    } catch {
      setError("Algo deu errado. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <span className="text-4xl">📰</span>
          <h1 className="text-4xl font-bold text-navy">Notícia PT</h1>
        </div>
        <p className="text-lg text-slate-500 mt-1">Leia mais. Entenda mais.</p>
      </div>

      <div className="w-full max-w-2xl mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Dificuldade</h2>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map((d) => {
            const active = difficulty === d.value;
            return (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  active
                    ? `${d.activeBorder} ${d.activeBg} ${d.text} ring-2 ${d.ring}`
                    : `${d.border} ${d.bg} ${d.text} hover:opacity-80`
                }`}
              >
                <div className="font-semibold text-base">{d.label}</div>
                <div className="text-xs mt-1 opacity-75">{d.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-2xl mb-10">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Tópico</h2>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
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
        {loading ? loadingMsg : "Começar a Leitura →"}
      </button>

      <p className="text-xs text-slate-400 mt-6">
        Artigos da Agência Brasil · Licença Creative Commons
      </p>
    </main>
  );
}
