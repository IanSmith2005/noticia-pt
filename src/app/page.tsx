"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const TOPICS = [
  { value: "random", label: "Aleatório", emoji: "🎲" },
  { value: "world", label: "Mundo", emoji: "🌍" },
  { value: "business", label: "Economia", emoji: "📈" },
  { value: "technology", label: "Tecnologia", emoji: "💻" },
  { value: "science", label: "Ciência", emoji: "🔬" },
  { value: "politics", label: "Política", emoji: "🏛️" },
  { value: "culture", label: "Cultura", emoji: "🎭" },
];

const DIFFICULTIES = [
  {
    value: "easy",
    label: "Fácil",
    desc: "Perguntas em inglês · Fatos básicos",
    color: "border-green-400 bg-green-50 text-green-800",
    active: "border-green-500 bg-green-100 ring-2 ring-green-300",
  },
  {
    value: "medium",
    label: "Médio",
    desc: "Perguntas em português · Interpretação",
    color: "border-yellow-400 bg-yellow-50 text-yellow-800",
    active: "border-yellow-500 bg-yellow-100 ring-2 ring-yellow-300",
  },
  {
    value: "hard",
    label: "Difícil",
    desc: "Perguntas em português · Pensamento crítico",
    color: "border-red-400 bg-red-50 text-red-800",
    active: "border-red-500 bg-red-100 ring-2 ring-red-300",
  },
];

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [topic, setTopic] = useState("random");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  async function handleStart() {
    if (!session) {
      setShowLogin(true);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/articles?topic=${topic}&difficulty=${difficulty}`);
      const articles = await res.json();
      if (!articles.length) {
        setError("Nenhum artigo encontrado. Tente outro tópico ou dificuldade.");
        setLoading(false);
        return;
      }
      const article = articles[0];
      const exRes = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article.id, difficulty }),
      });
      const data = await exRes.json();
      sessionStorage.setItem(`exercise_${data.exercise.id}`, JSON.stringify(data));
      router.push(`/workspace/${data.exercise.id}`);
    } catch {
      setError("Algo deu errado. Tente novamente.");
      setLoading(false);
    }
  }

  async function handleGuestLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!guestEmail) return;
    await signIn("credentials", { email: guestEmail, name: guestName, redirect: false });
    setShowLogin(false);
    handleStart();
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="text-4xl">📰</span>
          <h1 className="text-4xl font-bold text-navy">Notícia PT</h1>
        </div>
        <p className="text-lg text-slate-500 mt-1">Leia mais. Entenda mais.</p>
        {session && (
          <p className="text-sm text-slate-400 mt-2">Bem-vindo, {session.user?.name || session.user?.email}</p>
        )}
      </div>

      {/* Difficulty */}
      <div className="w-full max-w-2xl mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Dificuldade</h2>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                difficulty === d.value ? d.active : `${d.color} hover:opacity-80`
              }`}
            >
              <div className="font-semibold text-base">{d.label}</div>
              <div className="text-xs mt-1 opacity-75">{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Topic */}
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

      {/* Start */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <button
        onClick={handleStart}
        disabled={loading}
        className="px-10 py-4 bg-accent hover:bg-accent-dark text-white font-semibold text-lg rounded-2xl shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Carregando artigo..." : "Começar a Leitura →"}
      </button>

      {/* Guest Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold text-navy mb-2">Entrar para continuar</h2>
            <p className="text-slate-500 text-sm mb-6">
              Não precisa de senha — use seu e-mail para salvar seu progresso.
            </p>
            <form onSubmit={handleGuestLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Seu nome (opcional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="email"
                placeholder="Seu e-mail"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded-xl transition-all"
              >
                Entrar e Começar
              </button>
            </form>
            <button
              onClick={() => setShowLogin(false)}
              className="mt-4 w-full text-slate-400 text-sm hover:text-slate-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
