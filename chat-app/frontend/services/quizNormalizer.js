// ✅ CHANGEMENT: garde UNE SEULE version de la fonction (tu l'avais doublée)
export function normalizeBackendQuiz(payload) {
  const root = payload?.data ?? payload ?? {}; // ✅ CHANGEMENT: sécurise payload null/undefined
  const quiz = Array.isArray(root?.quiz) ? root.quiz : []; // ✅ CHANGEMENT: force array

  const normalizedQuestions = quiz.map((q, idx) => {
    const type = q?.type ?? "open"; // ✅ CHANGEMENT: type safe
    const id = q?.id ?? `q_${idx + 1}`; // ✅ CHANGEMENT: fallback id

    // Champs communs (alignés avec tes pages)
    const base = {
      id,
      type,
      question: q?.question ?? "",
     
      choices: [],
      
      answerIndex: null,
      
      correctBool: null,

      explanation: q?.why ?? null,
      topic: q?.related_skill ?? null,

     
      
      gradable: false,
    };

    // ─────────────────────────────
    // MCQ
    // ─────────────────────────────
    if (type === "mcq") {
      const choices = Array.isArray(q?.options) ? q.options : [];

      // ✅ CHANGEMENT: calc answerIndex seulement si letter valide A-Z
      const letter = typeof q?.correct_answer === "string" ? q.correct_answer.trim().toUpperCase() : "";
      const code = letter ? letter.charCodeAt(0) : NaN;
      const answerIndex = code >= 65 && code <= 90 ? code - 65 : null;

      return {
        ...base,
        gradable: typeof answerIndex === "number", // ✅ CHANGEMENT: gradable si on peut corriger
        choices,
        answerIndex,
      };
    }

    // ─────────────────────────────
    // TRUE / FALSE
    // ─────────────────────────────
    if (type === "true_false") {
      const correctBool = typeof q?.correct_answer === "boolean" ? q.correct_answer : null;

      // ✅ CHANGEMENT IMPORTANT: on met aussi answerIndex (0=Vrai, 1=Faux)
      const answerIndex = correctBool === null ? null : (correctBool ? 0 : 1);

      return {
        ...base,
        gradable: typeof answerIndex === "number", // ✅ CHANGEMENT
        choices: ["Vrai", "Faux"],
        correctBool, // optionnel
        answerIndex, // ✅ CHANGEMENT
      };
    }

    return {
      ...base,
      gradable: false,
      
    };
  });

  return {
    
    quizId: `quiz_${Date.now()}`,
    jobTitle: root?.job_title ?? null,
    scoreMatch: typeof root?.matching_score_estimation === "number" ? root.matching_score_estimation : null, // ✅ CHANGEMENT: check number
    questions: normalizedQuestions,
  };
}

