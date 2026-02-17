"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuizSession, resetQuizProgress, clearQuizSession } from "@/frontend/services/quizSession.service";
import Sidebar from "@/frontend/components/sideBar";

function getRankData(percent) {
  if (percent >= 85)
    return {
      label: "Gardien de Nazarick",
      rank: "Ⅸ",
      style: {
        bg: "hsl(42,50%,15%,0.6)",
        border: "hsl(42,50%,40%,0.6)",
        text: "hsl(42,50%,72%)",
        glow: "rgba(212,175,55,0.25)",
      },
      desc: "Vous avez prouvé votre valeur au Seigneur Ainz.",
    };
  if (percent >= 60)
    return {
      label: "Serviteur Loyal",
      rank: "Ⅵ",
      style: {
        bg: "hsl(210,40%,15%,0.6)",
        border: "hsl(210,40%,40%,0.6)",
        text: "hsl(210,50%,72%)",
        glow: "rgba(80,130,200,0.2)",
      },
      desc: "Vos connaissances méritent reconnaissance.",
    };
  if (percent >= 40)
    return {
      label: "Initié de la Tombe",
      rank: "Ⅲ",
      style: {
        bg: "hsl(30,40%,12%,0.6)",
        border: "hsl(30,40%,35%,0.6)",
        text: "hsl(30,50%,65%)",
        glow: "rgba(180,120,50,0.2)",
      },
      desc: "L'entraînement doit continuer.",
    };
  return {
    label: "Âme Errante",
    rank: "Ⅰ",
    style: {
      bg: "hsl(0,40%,12%,0.6)",
      border: "hsl(0,40%,30%,0.5)",
      text: "hsl(0,40%,65%)",
      glow: "rgba(180,50,50,0.2)",
    },
    desc: "Revenez plus préparé face au Sorcier Suprême.",
  };
}

export default function QuizResultPage({ sidebarProps = {} }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const s = getQuizSession();
    if (!s || !Array.isArray(s.questions) || s.questions.length === 0) {
      router.replace("/quiz");
      return;
    }
    setSession(s);
  }, [router]);

  const total = session?.questions?.length || 0;
  const score = session?.score || 0;

  const percent = useMemo(() => {
    if (!total) return 0;
    return Math.round((score / total) * 100);
  }, [score, total]);

  const rankData = useMemo(() => getRankData(percent), [percent]);

  const correctAnswers = useMemo(() => {
    if (!session?.answers) return [];
    return session.answers.filter((a) => a.correct);
  }, [session]);

  const wrongAnswers = useMemo(() => {
    if (!session?.answers) return [];
    return session.answers.filter((a) => !a.correct);
  }, [session]);

  const handleRestartSameQuiz = () => {
    const s = resetQuizProgress();
    if (!s) return router.push("/quiz");
    setSession(s);
    router.push("/quiz/play");
  };

  const handleNewQuiz = () => {
    clearQuizSession();
    router.push("/quiz");
  };

  if (!session) return null;

  return (
    <div
      className="min-h-screen text-[hsl(42,30%,82%)]"
      style={{
        background: "linear-gradient(135deg, hsl(260,25%,7%) 0%, hsl(260,20%,10%) 60%, hsl(0,20%,8%) 100%)",
      }}
    >
      {/* ── Sidebar drawer overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 flex-shrink-0 shadow-[4px_0_30px_rgba(0,0,0,0.5)]">
            <Sidebar
              {...sidebarProps}
              onSelectConversation={(id) => {
                sidebarProps.onSelectConversation?.(id);
                setSidebarOpen(false);
                router.push("/");
              }}
              onNewConversation={() => {
                sidebarProps.onNewConversation?.();
                setSidebarOpen(false);
                router.push("/");
              }}
            />
          </div>
        </div>
      )}

      {/* Motif de fond */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(42,50%,54%) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* En-tête */}
      <div
        className="relative border-b"
        style={{
          background: "hsl(260,25%,7%,0.8)",
          borderColor: "hsl(42,50%,54%,0.12)",
        }}
      >
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-4">
          {/* Bouton hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-[hsl(260,15%,14%)]"
            style={{ border: "1px solid hsl(260,15%,18%)" }}
            title="Ouvrir le menu"
          >
            <svg className="w-5 h-5 text-[hsl(42,50%,54%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "hsl(0,60%,35%,0.2)",
              border: "1px solid hsl(0,60%,35%,0.4)",
              boxShadow: "0 0 15px rgba(139,0,0,0.25)",
            }}
          >
            <svg className="w-6 h-6 text-[hsl(42,50%,60%)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-widest uppercase text-[hsl(42,50%,60%)]">
              Résultats de l'Épreuve
            </h1>
            <p className="text-xs text-[hsl(42,30%,45%)] tracking-wide">Jugement du Sorcier Suprême</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-3 translate-y-1/2">
          <div className="w-20 h-px bg-gradient-to-r from-transparent to-[hsl(42,50%,54%,0.4)]" />
          <div className="w-2 h-2 border border-[hsl(42,50%,54%,0.6)] rotate-45 bg-[hsl(260,25%,7%)]" />
          <div className="w-20 h-px bg-gradient-to-l from-transparent to-[hsl(42,50%,54%,0.4)]" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 relative z-10">

        {/* Carte Score principale */}
        <div
          className="rounded-2xl p-8 mb-6 border"
          style={{
            background: "hsl(260,20%,10%)",
            borderColor: "hsl(260,15%,18%)",
            boxShadow: "0 0 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.05)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Score numérique */}
            <div>
              <div className="text-6xl font-extrabold tracking-tight" style={{ color: "hsl(42,50%,65%)" }}>
                {score}
                <span className="text-3xl text-[hsl(42,30%,40%)] font-normal">/{total}</span>
              </div>
              <div className="mt-1 text-sm text-[hsl(42,30%,45%)] tracking-wide">
                {percent}% de réussite
              </div>
            </div>

            {/* Badge de rang */}
            <div
              className="px-5 py-3 rounded-xl border text-right"
              style={{
                background: rankData.style.bg,
                borderColor: rankData.style.border,
                boxShadow: `0 0 20px ${rankData.style.glow}`,
              }}
            >
              <div
                className="text-2xl font-extrabold tracking-widest mb-0.5"
                style={{ color: rankData.style.text }}
              >
                Rang {rankData.rank}
              </div>
              <div className="text-sm font-bold tracking-wide" style={{ color: rankData.style.text }}>
                {rankData.label}
              </div>
              <div className="text-xs mt-1" style={{ color: rankData.style.text, opacity: 0.7 }}>
                {rankData.desc}
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-7">
            <div
              className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ background: "hsl(260,20%,15%)" }}
            >
              <div
                className="h-2.5 rounded-full transition-all duration-700"
                style={{
                  width: `${percent}%`,
                  background: "linear-gradient(90deg, hsl(0,60%,35%), hsl(30,55%,40%), hsl(42,55%,54%))",
                  boxShadow: "0 0 10px rgba(212,175,55,0.4)",
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-[hsl(42,30%,38%)]">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Score CV↔Offre optionnel */}
          {session.meta?.scoreMatch !== null && session.meta?.scoreMatch !== undefined && (
            <div
              className="mt-5 p-3 rounded-lg border flex items-center gap-3"
              style={{
                background: "hsl(260,25%,8%,0.6)",
                borderColor: "hsl(260,15%,16%)",
              }}
            >
              <svg className="w-4 h-4 text-[hsl(42,50%,54%,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm text-[hsl(42,30%,55%)]">
                Pertinence CV ↔ Offre :{" "}
                <span className="font-bold text-[hsl(42,50%,65%)]">{session.meta.scoreMatch}</span>
                /100
              </span>
            </div>
          )}
        </div>

        {/* Résumé par bonne/mauvaise réponse */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            className="rounded-xl p-5 border text-center"
            style={{
              background: "hsl(142,30%,10%,0.5)",
              borderColor: "hsl(142,40%,25%,0.4)",
            }}
          >
            <div className="text-3xl font-extrabold text-[hsl(142,50%,60%)]">{correctAnswers.length}</div>
            <div className="text-xs tracking-widest uppercase text-[hsl(142,30%,50%)] mt-1">Correctes</div>
          </div>
          <div
            className="rounded-xl p-5 border text-center"
            style={{
              background: "hsl(0,40%,10%,0.5)",
              borderColor: "hsl(0,40%,25%,0.4)",
            }}
          >
            <div className="text-3xl font-extrabold text-[hsl(0,50%,60%)]">{wrongAnswers.length}</div>
            <div className="text-xs tracking-widest uppercase text-[hsl(0,30%,50%)] mt-1">Incorrectes</div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRestartSameQuiz}
            className="flex-1 py-3.5 rounded-xl font-bold tracking-widest uppercase text-sm transition-all"
            style={{
              background: "hsl(260,20%,12%)",
              border: "1px solid hsl(260,15%,22%)",
              color: "hsl(42,30%,65%)",
            }}
          >
            Recommencer
          </button>

          <button
            onClick={handleNewQuiz}
            className="flex-1 py-3.5 rounded-xl font-bold tracking-widest uppercase text-sm transition-all"
            style={{
              background: "linear-gradient(135deg, hsl(0,60%,28%), hsl(30,50%,30%))",
              color: "hsl(42,50%,75%)",
              border: "1px solid hsl(0,50%,40%,0.5)",
              boxShadow: "0 0 20px rgba(139,0,0,0.3)",
            }}
          >
            Nouvelle Épreuve
          </button>

          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 py-3.5 px-5 rounded-xl font-bold tracking-widest uppercase text-sm transition-all group"
            style={{
              background: "hsl(260,20%,12%)",
              border: "1px solid hsl(260,15%,22%)",
              color: "hsl(42,30%,48%)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "hsl(260,20%,14%)";
              e.currentTarget.style.borderColor = "hsl(42,50%,54%,0.2)";
              e.currentTarget.style.color = "hsl(42,30%,65%)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "hsl(260,20%,12%)";
              e.currentTarget.style.borderColor = "hsl(260,15%,22%)";
              e.currentTarget.style.color = "hsl(42,30%,48%)";
            }}
            title="Retour au chat"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Chat
          </button>
        </div>

        {/* Décoration finale */}
        <div className="mt-10 flex justify-center items-center gap-4">
          <div className="w-24 h-px bg-gradient-to-r from-transparent to-[hsl(42,50%,54%,0.2)]" />
          <svg className="w-5 h-5 text-[hsl(42,50%,54%,0.25)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 3.07 1.39 5.81 3.57 7.63L7 22h4v-2h2v2h4l1.43-2.37C20.61 17.81 22 15.07 22 12c0-5.52-4.48-10-10-10zm-3 14c-.83 0-1.5-.67-1.5-1.5S8.17 13 9 13s1.5.67 1.5 1.5S9.83 16 9 16zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 13 15 13s1.5.67 1.5 1.5S15.83 16 15 16zm-3-4c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z" />
          </svg>
          <div className="w-24 h-px bg-gradient-to-l from-transparent to-[hsl(42,50%,54%,0.2)]" />
        </div>
      </div>
    </div>
  );
}