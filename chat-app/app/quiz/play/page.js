"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getQuizSession,
  saveQuizSession,
  clearQuizSession,
} from "@/frontend/services/quizSession.service";

const DIFFICULTY_COLORS = {
  easy: { bg: "hsl(142,40%,15%,0.6)", border: "hsl(142,50%,30%,0.5)", text: "hsl(142,50%,65%)" },
  medium: { bg: "hsl(42,50%,15%,0.6)", border: "hsl(42,50%,40%,0.5)", text: "hsl(42,50%,65%)" },
  hard: { bg: "hsl(0,50%,15%,0.6)", border: "hsl(0,50%,40%,0.5)", text: "hsl(0,50%,65%)" },
};

export default function QuizPlayPage() {
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);

  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const s = getQuizSession();

    // ✅ Plus de seed fictif ici
    if (!s || !Array.isArray(s.questions) || s.questions.length === 0) {
      setSession(null);
      return;
    }

    // ✅ sécurise currentIndex
    const safe = { ...s };
    if (typeof safe.currentIndex !== "number" || safe.currentIndex < 0) safe.currentIndex = 0;
    if (safe.currentIndex >= safe.questions.length) safe.currentIndex = Math.max(0, safe.questions.length - 1);

    saveQuizSession(safe);
    setSession(safe);
  }, []);

  const total = session?.questions?.length || 0;

  const gradableTotal = useMemo(() => {
    if (!session?.questions) return 0;
    return session.questions.filter((q) => q.gradable).length;
  }, [session]);

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

  const gradeMcq = (q, idx) => typeof q.answerIndex === "number" && idx === q.answerIndex;

  const gradeTrueFalse = (q, idx) => {
    // idx 0 => Vrai, idx 1 => Faux
    const picked = idx === 0;
    return picked === Boolean(q.correctBool);
  };

  const handlePick = (idx) => {
    if (!session || !currentQuestion) return;
    if (showResult) return;
    if (!currentQuestion.gradable) return;

    setSelectedIndex(idx);
    setShowResult(true);

    let isCorrect = false;
    if (currentQuestion.type === "mcq") isCorrect = gradeMcq(currentQuestion, idx);
    if (currentQuestion.type === "true_false") isCorrect = gradeTrueFalse(currentQuestion, idx);

    const updated = {
      ...session,
      answers: [
        ...session.answers,
        {
          questionId: currentQuestion.id ?? `q_${session.currentIndex}`,
          type: currentQuestion.type,
          selectedIndex: idx,
          text: null,
          correct: isCorrect,
        },
      ],
      score: session.score + (isCorrect ? 1 : 0),
    };

    saveQuizSession(updated);
    setSession(updated);
  };

  const handleSubmitText = () => {
    if (!session || !currentQuestion) return;
    if (showResult) return;
    if (currentQuestion.gradable) return;

    const txt = (typedAnswer || "").trim();
    if (!txt) return;

    setShowResult(true);

    const updated = {
      ...session,
      answers: [
        ...session.answers,
        {
          questionId: currentQuestion.id ?? `q_${session.currentIndex}`,
          type: currentQuestion.type,
          selectedIndex: null,
          text: txt,
          correct: null,
        },
      ],
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
    setTypedAnswer("");
    setShowResult(false);
  };

  const handleClearAndGoGenerate = () => {
    clearQuizSession();
    router.push("/quiz"); // ✅ à créer
  };

  // ✅ Si aucune session : écran propre
  if (!session) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-[hsl(42,30%,82%)]"
        style={{
          background: "linear-gradient(135deg, hsl(260,25%,7%) 0%, hsl(260,20%,10%) 60%, hsl(0,20%,8%) 100%)",
        }}
      >
        <div className="max-w-md w-full p-8 rounded-2xl border"
          style={{ background: "hsl(260,20%,10%)", borderColor: "hsl(260,15%,18%)" }}
        >
          <h1 className="text-xl font-bold mb-2" style={{ color: "hsl(42,40%,85%)" }}>
            Aucun quiz en cours
          </h1>
          <p className="text-sm mb-6 text-[hsl(42,30%,65%)]">
            Génère un quiz à partir de ton CV et de l’offre, puis reviens ici pour le jouer.
          </p>

          <button
            onClick={handleClearAndGoGenerate}
            className="w-full px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-sm transition-all"
            style={{
              background: "linear-gradient(135deg, hsl(0,60%,28%), hsl(30,50%,30%))",
              color: "hsl(42,50%,75%)",
              border: "1px solid hsl(0,50%,40%,0.5)",
              boxShadow: "0 0 20px rgba(139,0,0,0.3)",
            }}
          >
            Générer un quiz
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  // ✅ Pour afficher résultat gradable
  let correctIndex = null;
  if (currentQuestion.type === "mcq") correctIndex = currentQuestion.answerIndex;
  if (currentQuestion.type === "true_false") correctIndex = currentQuestion.correctBool ? 0 : 1;
  const isCorrect = showResult && currentQuestion.gradable && selectedIndex === correctIndex;

  const diffStyle = DIFFICULTY_COLORS[currentQuestion.difficulty] || DIFFICULTY_COLORS.medium;

  return (
    <div
      className="min-h-screen text-[hsl(42,30%,82%)]"
      style={{
        background: "linear-gradient(135deg, hsl(260,25%,7%) 0%, hsl(260,20%,10%) 60%, hsl(0,20%,8%) 100%)",
      }}
    >
      {/* Barre sticky */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{
          background: "hsl(260,25%,7%,0.92)",
          borderColor: "hsl(42,50%,54%,0.12)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-3xl mx-auto px-6 py-3">
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
            <span className="text-sm font-bold tracking-widest uppercase text-[hsl(42,50%,60%)]">
              {progressLabel}
            </span>

            <div className="flex gap-2">
              <button
                onClick={handleClearAndGoGenerate}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all text-[hsl(42,30%,55%)] hover:text-[hsl(42,30%,75%)]"
                style={{ border: "1px solid hsl(260,15%,18%)", background: "hsl(260,20%,10%)" }}
              >
                Nouveau quiz
              </button>
              <button
                onClick={handleStop}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all text-[hsl(0,40%,60%)] hover:text-[hsl(0,40%,75%)]"
                style={{ border: "1px solid hsl(0,40%,25%,0.5)", background: "hsl(0,40%,12%,0.5)" }}
              >
                Abandonner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div
          className="rounded-2xl p-7 mb-6 border"
          style={{
            background: "hsl(260,20%,10%)",
            borderColor: "hsl(260,15%,18%)",
            boxShadow: "0 0 40px rgba(0,0,0,0.4)",
          }}
        >
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

            <span
              className="text-xs px-3 py-1 rounded-lg font-semibold tracking-wider uppercase"
              style={{
                background: "hsl(260,25%,7%,0.5)",
                border: "1px solid hsl(260,15%,18%)",
                color: "hsl(42,30%,65%)",
              }}
            >
              {currentQuestion.type}
            </span>
          </div>

          <h1 className="text-lg font-bold mb-7 leading-relaxed" style={{ color: "hsl(42,40%,85%)" }}>
            {currentQuestion.question}
          </h1>

          {/* MCQ + TRUE/FALSE */}
          {currentQuestion.gradable && (
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
                  };
                }
                if (isWrongPicked) {
                  btnStyle = {
                    background: "hsl(0,50%,12%,0.8)",
                    border: "1px solid hsl(0,50%,35%,0.6)",
                    color: "hsl(0,50%,75%)",
                  };
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handlePick(idx)}
                    disabled={showResult}
                    className="w-full text-left p-4 rounded-xl transition-all"
                    style={{ ...btnStyle, cursor: showResult ? "default" : "pointer" }}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          )}

          {/* OPEN + SCENARIO */}
          {!currentQuestion.gradable && (
            <div className="space-y-3">
              <textarea
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                disabled={showResult}
                placeholder="Écris ta réponse ici..."
                className="w-full min-h-[140px] rounded-xl p-4 outline-none text-sm"
                style={{
                  background: "hsl(260,25%,7%,0.6)",
                  border: "1px solid hsl(260,15%,18%)",
                  color: "hsl(42,30%,75%)",
                }}
              />
              <button
                onClick={handleSubmitText}
                disabled={showResult || !typedAnswer.trim()}
                className="px-5 py-3 rounded-xl font-bold tracking-widest uppercase text-sm transition-all"
                style={
                  showResult || !typedAnswer.trim()
                    ? {
                        background: "hsl(260,15%,14%)",
                        color: "hsl(260,10%,35%)",
                        border: "1px solid hsl(260,15%,18%)",
                        cursor: "not-allowed",
                      }
                    : {
                        background: "linear-gradient(135deg, hsl(0,60%,28%), hsl(30,50%,30%))",
                        color: "hsl(42,50%,75%)",
                        border: "1px solid hsl(0,50%,40%,0.5)",
                      }
                }
              >
                Valider la réponse
              </button>
            </div>
          )}

          {showResult && (
            <div className="mt-6 p-5 rounded-xl border" style={{ borderColor: "hsl(260,15%,18%)", background: "hsl(260,25%,7%,0.4)" }}>
              <div className="font-bold text-sm tracking-wide uppercase">
                {currentQuestion.gradable ? (isCorrect ? "Bonne réponse ✅" : "Mauvaise réponse ❌") : "Réponse enregistrée ✅"}
              </div>

              {currentQuestion.gradable && typeof correctIndex === "number" && (
                <div className="mt-2 text-sm">
                  Réponse correcte : <span className="font-semibold">{currentQuestion.choices?.[correctIndex]}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-7 flex items-center justify-between">
            <div className="text-sm text-[hsl(42,30%,55%)]">
              Score (corrigé) : <span className="font-bold text-[hsl(42,50%,70%)]">{session.score}</span>
              <span className="text-[hsl(42,30%,40%)]"> / {gradableTotal}</span>
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
      </div>
    </div>
  );
}

