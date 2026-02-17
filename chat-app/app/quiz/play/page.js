"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getQuizSession,
  saveQuizSession,
  clearQuizSession,
} from "@/frontend/services/quizSession.service";

function seedFakeSession() {
  return {
    quizId: "demo_" + Date.now(),
    questions: [
      {
        id: "q1",
        topic: "React",
        difficulty: "easy",
        question: "À quoi sert useState ?",
        choices: [
          "À gérer l'état local d'un composant",
          "À faire des requêtes HTTP automatiquement",
          "À créer des routes Next.js",
          "À compiler Tailwind CSS",
        ],
        answerIndex: 0,
        explanation:
          "useState permet de stocker et mettre à jour un état local dans un composant React.",
      },
      {
        id: "q2",
        topic: "JavaScript",
        difficulty: "medium",
        question: "Quelle est la différence entre == et === ?",
        choices: [
          "Aucune différence",
          "=== compare aussi le type, == peut convertir (coercion)",
          "== compare aussi le type, === peut convertir",
          "=== ne marche que sur les nombres",
        ],
        answerIndex: 1,
        explanation:
          "=== est une comparaison stricte (valeur + type). == peut faire de la coercion de type.",
      },
      {
        id: "q3",
        topic: "Next.js",
        difficulty: "medium",
        question: "Avec App Router, où place-t-on un endpoint /api/test ?",
        choices: [
          "pages/api/test.js",
          "app/api/test/route.js",
          "app/test/api.js",
          "src/api/test.ts",
        ],
        answerIndex: 1,
        explanation:
          "En App Router, les routes API sont dans app/api/<route>/route.js.",
      },
      {
        id: "q4",
        topic: "SQL",
        difficulty: "easy",
        question: "Que fait la clause WHERE en SQL ?",
        choices: [
          "Elle trie les résultats",
          "Elle limite le nombre de lignes",
          "Elle filtre les lignes selon une condition",
          "Elle renomme une colonne",
        ],
        answerIndex: 2,
        explanation:
          "WHERE sert à filtrer les lignes selon une condition (ex: WHERE age > 18).",
      },
      {
        id: "q5",
        topic: "DevOps",
        difficulty: "medium",
        question: "Quel est l'objectif principal d'un Dockerfile ?",
        choices: [
          "Dessiner l'architecture du système",
          "Décrire comment construire une image Docker",
          "Optimiser les performances du CPU",
          "Gérer les permissions Linux uniquement",
        ],
        answerIndex: 1,
        explanation:
          "Un Dockerfile décrit les étapes pour construire une image Docker (base image, commandes, etc.).",
      },
    ],
    currentIndex: 0,
    answers: [],
    score: 0,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    meta: {
      scoreMatch: 68,
      cvSkills: ["React", "Node.js", "Docker", "SQL"],
      jobSkills: ["React", "Next.js", "TypeScript", "Docker"],
      matchedSkills: ["React", "Docker"],
      missingSkills: ["Next.js", "TypeScript"],
      decision: "MATCH_LOW",
    },
  };
}

const DIFFICULTY_COLORS = {
  easy: { bg: "hsl(142,40%,15%,0.6)", border: "hsl(142,50%,30%,0.5)", text: "hsl(142,50%,65%)" },
  medium: { bg: "hsl(42,50%,15%,0.6)", border: "hsl(42,50%,40%,0.5)", text: "hsl(42,50%,65%)" },
  hard: { bg: "hsl(0,50%,15%,0.6)", border: "hsl(0,50%,40%,0.5)", text: "hsl(0,50%,65%)" },
};

export default function QuizPlayPage() {
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;

    let s = getQuizSession();

    if (!s || !Array.isArray(s.questions) || s.questions.length === 0) {
      s = seedFakeSession();
      saveQuizSession(s);
    }

    if (typeof s.currentIndex !== "number" || s.currentIndex < 0) {
      s.currentIndex = 0;
      saveQuizSession(s);
    }
    if (s.currentIndex >= s.questions.length) {
      s.currentIndex = Math.max(0, s.questions.length - 1);
      saveQuizSession(s);
    }

    setSession(s);
  }, []);

  const total = session?.questions?.length || 0;

  const currentQuestion = useMemo(() => {
    if (!session) return null;
    return session.questions[session.currentIndex] || null;
  }, [session]);

  const progressLabel = useMemo(() => {
    if (!session) return "";
    return `Question ${Math.min(session.currentIndex + 1, total)} / ${total}`;
  }, [session, total]);

  const progressPercent = useMemo(() => {
    if (!session || !total) return 0;
    return Math.round(((session.currentIndex + 1) / total) * 100);
  }, [session, total]);

  const handleStop = () => {
    if (!session) return;
    const updated = { ...session, finishedAt: new Date().toISOString() };
    saveQuizSession(updated);
    router.push("/quiz/result");
  };

  const handlePick = (idx) => {
    if (!session || !currentQuestion) return;
    if (showResult) return;

    setSelectedIndex(idx);
    setShowResult(true);

    const isCorrect = idx === currentQuestion.answerIndex;

    const updated = {
      ...session,
      answers: [
        ...session.answers,
        {
          questionId: currentQuestion.id ?? `q_${session.currentIndex}`,
          selectedIndex: idx,
          correct: isCorrect,
        },
      ],
      score: session.score + (isCorrect ? 1 : 0),
    };

    saveQuizSession(updated);
    setSession(updated);
  };

  const handleContinue = () => {
    if (!session) return;

    const nextIndex = session.currentIndex + 1;

    if (nextIndex >= total) {
      const updated = {
        ...session,
        finishedAt: new Date().toISOString(),
        currentIndex: nextIndex,
      };
      saveQuizSession(updated);
      router.push("/quiz/result");
      return;
    }

    const updated = { ...session, currentIndex: nextIndex };
    saveQuizSession(updated);
    setSession(updated);

    setSelectedIndex(null);
    setShowResult(false);
  };

  const handleNew = () => {
    clearQuizSession();
    const fresh = seedFakeSession();
    saveQuizSession(fresh);
    setSession(fresh);
    setSelectedIndex(null);
    setShowResult(false);
  };

  if (!session) return null;

  if (!currentQuestion) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, hsl(260,25%,7%) 0%, hsl(260,20%,10%) 60%, hsl(0,20%,8%) 100%)" }}
      >
        <div className="text-center space-y-5 p-8">
          <p className="text-[hsl(42,30%,65%)]">Session invalide ou épreuve terminée.</p>
          <button
            onClick={handleNew}
            className="px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-sm text-[hsl(42,50%,70%)]"
            style={{
              background: "linear-gradient(135deg, hsl(0,60%,28%), hsl(30,50%,30%))",
              border: "1px solid hsl(0,50%,40%,0.5)",
              boxShadow: "0 0 20px rgba(139,0,0,0.3)",
            }}
          >
            Recommencer l'Épreuve
          </button>
        </div>
      </div>
    );
  }

  const correctIndex = currentQuestion.answerIndex;
  const isCorrect = showResult && selectedIndex === correctIndex;
  const diffStyle = DIFFICULTY_COLORS[currentQuestion.difficulty] || DIFFICULTY_COLORS.medium;

  return (
    <div
      className="min-h-screen text-[hsl(42,30%,82%)]"
      style={{
        background: "linear-gradient(135deg, hsl(260,25%,7%) 0%, hsl(260,20%,10%) 60%, hsl(0,20%,8%) 100%)",
      }}
    >
      {/* Motif de fond */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(42,50%,54%) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Barre supérieure sticky */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{
          background: "hsl(260,25%,7%,0.92)",
          borderColor: "hsl(42,50%,54%,0.12)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-3xl mx-auto px-6 py-3">
          {/* Progress bar */}
          <div className="w-full h-1 rounded-full mb-3 overflow-hidden" style={{ background: "hsl(260,15%,14%)" }}>
            <div
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, hsl(0,60%,35%), hsl(42,50%,54%))",
                boxShadow: "0 0 8px rgba(212,175,55,0.4)",
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[hsl(0,60%,35%,0.2)] border border-[hsl(0,60%,35%,0.4)] flex items-center justify-center">
                <svg className="w-4 h-4 text-[hsl(42,50%,60%)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 3.07 1.39 5.81 3.57 7.63L7 22h4v-2h2v2h4l1.43-2.37C20.61 17.81 22 15.07 22 12c0-5.52-4.48-10-10-10zm-3 14c-.83 0-1.5-.67-1.5-1.5S8.17 13 9 13s1.5.67 1.5 1.5S9.83 16 9 16zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 13 15 13s1.5.67 1.5 1.5S15.83 16 15 16zm-3-4c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-widest uppercase text-[hsl(42,50%,60%)]">
                {progressLabel}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleNew}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all text-[hsl(42,30%,55%)] hover:text-[hsl(42,30%,75%)]"
                style={{
                  border: "1px solid hsl(260,15%,18%)",
                  background: "hsl(260,20%,10%)",
                }}
              >
                Recharger
              </button>
              <button
                onClick={handleStop}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all text-[hsl(0,40%,60%)] hover:text-[hsl(0,40%,75%)]"
                style={{
                  border: "1px solid hsl(0,40%,25%,0.5)",
                  background: "hsl(0,40%,12%,0.5)",
                }}
              >
                Abandonner
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 relative z-10">
        {/* Carte question */}
        <div
          className="rounded-2xl p-7 mb-6 border"
          style={{
            background: "hsl(260,20%,10%)",
            borderColor: "hsl(260,15%,18%)",
            boxShadow: "0 0 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)",
          }}
        >
          {/* Badges topic + difficulty */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {currentQuestion.topic && (
              <span
                className="text-xs px-3 py-1 rounded-lg font-semibold tracking-wider uppercase"
                style={{
                  background: "hsl(0,60%,20%,0.4)",
                  border: "1px solid hsl(0,50%,35%,0.4)",
                  color: "hsl(42,50%,65%)",
                }}
              >
                {currentQuestion.topic}
              </span>
            )}
            {currentQuestion.difficulty && (
              <span
                className="text-xs px-3 py-1 rounded-lg font-semibold tracking-wider uppercase"
                style={{
                  background: diffStyle.bg,
                  border: `1px solid ${diffStyle.border}`,
                  color: diffStyle.text,
                }}
              >
                {currentQuestion.difficulty}
              </span>
            )}
          </div>

          {/* Question */}
          <h1
            className="text-lg font-bold mb-7 leading-relaxed"
            style={{ color: "hsl(42,40%,85%)" }}
          >
            {currentQuestion.question}
          </h1>

          {/* Choix */}
          <div className="space-y-3">
            {(currentQuestion.choices || []).map((choice, idx) => {
              const isPicked = selectedIndex === idx;
              const isCorrectChoice = showResult && idx === correctIndex;
              const isWrongPicked = showResult && isPicked && idx !== correctIndex;

              let btnStyle = {
                background: "hsl(260,25%,7%,0.6)",
                border: "1px solid hsl(260,15%,18%)",
                color: "hsl(42,30%,75%)",
              };
              if (!showResult && isPicked) {
                btnStyle = {
                  background: "hsl(42,50%,15%,0.6)",
                  border: "1px solid hsl(42,50%,40%,0.5)",
                  color: "hsl(42,50%,80%)",
                };
              }
              if (isCorrectChoice) {
                btnStyle = {
                  background: "hsl(142,40%,12%,0.8)",
                  border: "1px solid hsl(142,50%,35%,0.6)",
                  color: "hsl(142,50%,75%)",
                  boxShadow: "0 0 15px rgba(50,180,80,0.1)",
                };
              }
              if (isWrongPicked) {
                btnStyle = {
                  background: "hsl(0,50%,12%,0.8)",
                  border: "1px solid hsl(0,50%,35%,0.6)",
                  color: "hsl(0,50%,75%)",
                  boxShadow: "0 0 15px rgba(180,50,50,0.1)",
                };
              }

              return (
                <button
                  key={idx}
                  onClick={() => handlePick(idx)}
                  disabled={showResult}
                  className="w-full text-left p-4 rounded-xl transition-all flex items-start gap-4 group"
                  style={{
                    ...btnStyle,
                    cursor: showResult ? "default" : "pointer",
                  }}
                >
                  {/* Lettre d'index */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold tracking-wider transition-all"
                    style={{
                      background: isCorrectChoice
                        ? "hsl(142,50%,25%,0.6)"
                        : isWrongPicked
                        ? "hsl(0,50%,25%,0.6)"
                        : isPicked && !showResult
                        ? "hsl(42,50%,25%,0.6)"
                        : "hsl(260,20%,16%)",
                      color: isCorrectChoice
                        ? "hsl(142,50%,75%)"
                        : isWrongPicked
                        ? "hsl(0,50%,75%)"
                        : isPicked && !showResult
                        ? "hsl(42,50%,75%)"
                        : "hsl(42,30%,50%)",
                      border: "1px solid currentColor",
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm leading-relaxed mt-0.5">{choice}</span>
                </button>
              );
            })}
          </div>

          {/* Explication */}
          {showResult && (
            <div
              className="mt-6 p-5 rounded-xl border"
              style={
                isCorrect
                  ? {
                      background: "hsl(142,40%,10%,0.7)",
                      border: "1px solid hsl(142,50%,30%,0.5)",
                    }
                  : {
                      background: "hsl(0,50%,10%,0.7)",
                      border: "1px solid hsl(0,50%,30%,0.5)",
                    }
              }
            >
              <div
                className="font-bold mb-2 text-sm tracking-wide uppercase flex items-center gap-2"
                style={{ color: isCorrect ? "hsl(142,50%,65%)" : "hsl(0,50%,65%)" }}
              >
                <span>{isCorrect ? "✦ Bonne réponse" : "✦ Mauvaise réponse"}</span>
              </div>
              {currentQuestion.explanation ? (
                <div className="text-sm text-[hsl(42,30%,70%)] leading-relaxed">
                  {currentQuestion.explanation}
                </div>
              ) : (
                <div className="text-sm text-[hsl(42,30%,65%)]">
                  Réponse correcte :{" "}
                  <span className="font-semibold text-[hsl(42,50%,70%)]">
                    {currentQuestion.choices?.[correctIndex]}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Footer carte */}
          <div className="mt-7 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[hsl(42,50%,54%,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm text-[hsl(42,30%,55%)]">
                Score :{" "}
                <span className="font-bold text-[hsl(42,50%,70%)]">{session.score}</span>
                <span className="text-[hsl(42,30%,40%)]"> / {total}</span>
              </span>
            </div>

            <button
              onClick={handleContinue}
              disabled={!showResult}
              className="px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-sm transition-all"
              style={
                showResult
                  ? {
                      background: "linear-gradient(135deg, hsl(0,60%,28%), hsl(30,50%,30%))",
                      color: "hsl(42,50%,75%)",
                      border: "1px solid hsl(0,50%,40%,0.5)",
                      boxShadow: "0 0 20px rgba(139,0,0,0.3)",
                    }
                  : {
                      background: "hsl(260,15%,14%)",
                      color: "hsl(260,10%,35%)",
                      border: "1px solid hsl(260,15%,18%)",
                      cursor: "not-allowed",
                    }
              }
            >
              Continuer →
            </button>
          </div>
        </div>

        {/* Meta démo */}
        <div
          className="rounded-xl p-5 border text-sm"
          style={{
            background: "hsl(260,20%,9%,0.6)",
            borderColor: "hsl(260,15%,15%)",
          }}
        >
          <div className="font-bold mb-2 text-xs tracking-widest uppercase text-[hsl(42,50%,54%,0.7)]">
            Données fictives (démo)
          </div>
          <div className="text-[hsl(42,30%,55%)]">
            Score de correspondance CV ↔ Offre :{" "}
            <span className="font-semibold text-[hsl(42,50%,65%)]">{session.meta?.scoreMatch}</span>/100
          </div>
          <div className="mt-1 text-xs text-[hsl(42,30%,38%)]">
            Vous pouvez supprimer le "seed" lorsque le backend sera prêt.
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}