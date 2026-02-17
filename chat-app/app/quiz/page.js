"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { generateQuiz } from "@/frontend/services/quiz.service";
import { saveQuizSession, clearQuizSession } from "@/frontend/services/quizSession.service";
import Sidebar from "@/frontend/components/sideBar";

export default function QuizSetupPage({ sidebarProps = {} }) {
  const router = useRouter();

  const [cvFile, setCvFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [jobMode, setJobMode] = useState("text"); // "text" | "pdf"
  const [jobText, setJobText] = useState("");
  const [jobFile, setJobFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    if (!cvFile) return false;
    if (jobMode === "text") return jobText.trim().length > 20;
    if (jobMode === "pdf") return !!jobFile;
    return false;
  }, [cvFile, jobMode, jobText, jobFile]);

  const handleGenerate = async () => {
    setError("");
    if (!canSubmit) return;

    setLoading(true);
    try {
      clearQuizSession();

      const data = await generateQuiz({ cvFile, jobMode, jobText, jobFile });

      const questions = data.quiz || data.questions || [];
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Le serveur n'a renvoyé aucune question.");
      }

      const quizSession = {
        quizId: data.quizId || String(Date.now()),
        questions,
        currentIndex: 0,
        answers: [],
        score: 0,
        startedAt: new Date().toISOString(),
        finishedAt: null,
        meta: {
          scoreMatch: data.score ?? null,
          cvSkills: data.cvSkills ?? null,
          jobSkills: data.jobSkills ?? null,
          missingSkills: data.missingSkills ?? null,
          matchedSkills: data.matchedSkills ?? null,
          decision: data.decision ?? null,
        },
      };

      saveQuizSession(quizSession);
      router.push("/quiz/play");
    } catch (e) {
      setError(e?.message || "Erreur lors de la génération.");
    } finally {
      setLoading(false);
    }
  };

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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Panel */}
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

      {/* Motif de fond — grille Nazarick */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(42,50%,54%) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* En-tête décoratif */}
      <div className="relative border-b border-[hsl(42,50%,54%,0.12)] bg-[hsl(260,25%,7%,0.8)]">
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

          {/* Bouton retour subtil vers le chat */}
          <button
            onClick={() => router.push("/")}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all group"
            style={{
              background: "transparent",
              border: "1px solid hsl(260,15%,16%)",
              color: "hsl(42,30%,40%)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "hsl(260,15%,12%)";
              e.currentTarget.style.borderColor = "hsl(42,50%,54%,0.2)";
              e.currentTarget.style.color = "hsl(42,30%,62%)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "hsl(260,15%,16%)";
              e.currentTarget.style.color = "hsl(42,30%,40%)";
            }}
            title="Retour au chat"
          >
            <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-xs tracking-wide hidden sm:inline">Chat</span>
          </button>

          <div className="w-10 h-10 rounded-xl bg-[hsl(0,60%,35%,0.2)] border border-[hsl(0,60%,35%,0.4)] flex items-center justify-center shadow-[0_0_15px_rgba(139,0,0,0.25)]">
            <svg className="w-6 h-6 text-[hsl(42,50%,60%)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 3.07 1.39 5.81 3.57 7.63L7 22h4v-2h2v2h4l1.43-2.37C20.61 17.81 22 15.07 22 12c0-5.52-4.48-10-10-10zm-3 14c-.83 0-1.5-.67-1.5-1.5S8.17 13 9 13s1.5.67 1.5 1.5S9.83 16 9 16zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 13 15 13s1.5.67 1.5 1.5S15.83 16 15 16zm-3-4c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-widest uppercase text-[hsl(42,50%,60%)]">
              Épreuve de Nazarick
            </h1>
            <p className="text-xs text-[hsl(42,30%,45%)] tracking-wide">Générateur de Quiz</p>
          </div>
        </div>
        {/* Séparateur ornemental */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-3 translate-y-1/2">
          <div className="w-20 h-px bg-gradient-to-r from-transparent to-[hsl(42,50%,54%,0.4)]" />
          <div className="w-2 h-2 border border-[hsl(42,50%,54%,0.6)] rotate-45 bg-[hsl(260,25%,7%)]" />
          <div className="w-20 h-px bg-gradient-to-l from-transparent to-[hsl(42,50%,54%,0.4)]" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 relative z-10">
        <p className="text-[hsl(42,30%,55%)] mb-10 text-sm tracking-wide">
          Soumettez votre parchemin (CV) et la missive du Sorcier Suprême (offre d'emploi) pour commencer l'épreuve.
        </p>

        {/* Bloc CV */}
        <div
          className="rounded-2xl p-6 mb-6 border"
          style={{
            background: "hsl(260,20%,10%)",
            borderColor: "hsl(260,15%,18%)",
            boxShadow: "0 0 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.05)",
          }}
        >
          {/* Titre de section */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[hsl(0,60%,30%,0.25)] border border-[hsl(0,60%,30%,0.4)] text-[hsl(42,50%,60%)] text-xs font-bold">
              Ⅰ
            </div>
            <h2 className="font-bold tracking-widest uppercase text-[hsl(42,50%,60%)] text-sm">
              Votre Parchemin (CV — PDF)
            </h2>
          </div>

          <label className="group relative flex items-center gap-4 p-4 rounded-xl border border-dashed border-[hsl(42,50%,54%,0.2)] bg-[hsl(260,25%,7%,0.5)] hover:border-[hsl(42,50%,54%,0.4)] hover:bg-[hsl(260,25%,7%,0.8)] transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-[hsl(42,50%,54%,0.08)] border border-[hsl(42,50%,54%,0.2)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(42,50%,54%,0.15)] transition-colors">
              <svg className="w-5 h-5 text-[hsl(42,50%,54%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              {cvFile ? (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[hsl(142,60%,45%)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-[hsl(42,30%,82%)] truncate font-medium">{cvFile.name}</span>
                  <span className="text-xs text-[hsl(42,30%,45%)] flex-shrink-0">({Math.round(cvFile.size / 1024)} KB)</span>
                </div>
              ) : (
                <span className="text-sm text-[hsl(42,30%,45%)]">Cliquez pour importer un fichier PDF</span>
              )}
            </div>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>

        {/* Bloc Offre */}
        <div
          className="rounded-2xl p-6 mb-6 border"
          style={{
            background: "hsl(260,20%,10%)",
            borderColor: "hsl(260,15%,18%)",
            boxShadow: "0 0 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.05)",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[hsl(0,60%,30%,0.25)] border border-[hsl(0,60%,30%,0.4)] text-[hsl(42,50%,60%)] text-xs font-bold">
              Ⅱ
            </div>
            <h2 className="font-bold tracking-widest uppercase text-[hsl(42,50%,60%)] text-sm">
              La Missive (Offre d'Emploi)
            </h2>
          </div>

          {/* Sélecteur de mode */}
          <div className="flex gap-2 mb-5 p-1 rounded-xl bg-[hsl(260,25%,7%)] border border-[hsl(260,15%,14%)]">
            <button
              onClick={() => setJobMode("text")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold tracking-wide uppercase transition-all ${
                jobMode === "text"
                  ? "bg-[hsl(0,60%,30%)] text-[hsl(42,50%,70%)] shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-[hsl(0,50%,40%,0.4)]"
                  : "text-[hsl(42,30%,45%)] hover:text-[hsl(42,30%,65%)] hover:bg-[hsl(260,15%,14%)]"
              }`}
            >
              Texte
            </button>
            <button
              onClick={() => setJobMode("pdf")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold tracking-wide uppercase transition-all ${
                jobMode === "pdf"
                  ? "bg-[hsl(0,60%,30%)] text-[hsl(42,50%,70%)] shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-[hsl(0,50%,40%,0.4)]"
                  : "text-[hsl(42,30%,45%)] hover:text-[hsl(42,30%,65%)] hover:bg-[hsl(260,15%,14%)]"
              }`}
            >
              PDF
            </button>
          </div>

          {jobMode === "text" ? (
            <>
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                rows={8}
                placeholder="Collez ici l'offre d'emploi (description, missions, compétences demandées…)"
                className="w-full rounded-xl p-4 text-sm text-[hsl(42,30%,82%)] placeholder-[hsl(260,10%,35%)] focus:outline-none focus:ring-1 focus:ring-[hsl(42,50%,54%,0.3)] resize-none transition-all"
                style={{
                  background: "hsl(260,25%,7%,0.8)",
                  border: "1px solid hsl(260,15%,18%)",
                }}
              />
              <p className="mt-2 text-xs text-[hsl(42,30%,38%)]">
                Astuce : collez au moins 2–3 paragraphes pour de meilleurs résultats.
              </p>
            </>
          ) : (
            <label className="group relative flex items-center gap-4 p-4 rounded-xl border border-dashed border-[hsl(42,50%,54%,0.2)] bg-[hsl(260,25%,7%,0.5)] hover:border-[hsl(42,50%,54%,0.4)] hover:bg-[hsl(260,25%,7%,0.8)] transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-[hsl(42,50%,54%,0.08)] border border-[hsl(42,50%,54%,0.2)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(42,50%,54%,0.15)] transition-colors">
                <svg className="w-5 h-5 text-[hsl(42,50%,54%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                {jobFile ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[hsl(142,60%,45%)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-[hsl(42,30%,82%)] truncate font-medium">{jobFile.name}</span>
                    <span className="text-xs text-[hsl(42,30%,45%)] flex-shrink-0">({Math.round(jobFile.size / 1024)} KB)</span>
                  </div>
                ) : (
                  <span className="text-sm text-[hsl(42,30%,45%)]">Cliquez pour importer un fichier PDF</span>
                )}
              </div>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setJobFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          )}
        </div>

        {/* Erreur */}
        {error && (
          <div
            className="mb-6 p-4 rounded-xl border flex items-start gap-3"
            style={{
              background: "hsl(0,60%,15%,0.3)",
              borderColor: "hsl(0,60%,35%,0.4)",
            }}
          >
            <svg className="w-5 h-5 text-[hsl(0,50%,60%)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-[hsl(0,30%,75%)]">{error}</p>
          </div>
        )}

        {/* Bouton principal */}
        <button
          disabled={!canSubmit || loading}
          onClick={handleGenerate}
          className="w-full py-4 rounded-xl font-bold tracking-widest uppercase text-sm transition-all relative overflow-hidden"
          style={
            !canSubmit || loading
              ? {
                  background: "hsl(260,15%,14%)",
                  color: "hsl(260,10%,35%)",
                  cursor: "not-allowed",
                  border: "1px solid hsl(260,15%,18%)",
                }
              : {
                  background: "linear-gradient(135deg, hsl(0,60%,28%) 0%, hsl(0,55%,32%) 50%, hsl(30,50%,30%) 100%)",
                  color: "hsl(42,50%,75%)",
                  border: "1px solid hsl(0,50%,40%,0.5)",
                  boxShadow: "0 0 25px rgba(139,0,0,0.35), 0 4px 20px rgba(0,0,0,0.4)",
                }
          }
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-[hsl(42,50%,54%,0.3)] border-t-[hsl(42,50%,54%)] rounded-full animate-spin" />
              Invocation en cours…
            </span>
          ) : (
            "Commencer l'Épreuve"
          )}
        </button>

        {/* Décoration de bas de page */}
        <div className="mt-8 flex justify-center items-center gap-4">
          <div className="w-24 h-px bg-gradient-to-r from-transparent to-[hsl(42,50%,54%,0.2)]" />
          <svg className="w-4 h-4 text-[hsl(42,50%,54%,0.3)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <div className="w-24 h-px bg-gradient-to-l from-transparent to-[hsl(42,50%,54%,0.2)]" />
        </div>
      </div>
    </div>
  );
}