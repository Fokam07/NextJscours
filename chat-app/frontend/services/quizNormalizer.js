export function normalizeBackendQuiz(payload) {
  const root = payload?.data ?? payload; // au cas où
  const quiz = root?.quiz ?? [];

  const normalizedQuestions = quiz.map((q) => {
    // MCQ: options = ["A - ...", "B - ..."]
    if (q.type === "mcq") {
      const choices = Array.isArray(q.options) ? q.options : [];
      const correctLetter = q.correct_answer; // "A" | "B" ...
      const answerIndex =
        typeof correctLetter === "string"
          ? Math.max(0, correctLetter.toUpperCase().charCodeAt(0) - 65)
          : null;

      return {
        id: q.id,
        type: "mcq",
        question: q.question,
        choices,
        answerIndex,
        correctBool: null,
        why: q.why ?? null,
        relatedSkill: q.related_skill ?? null,
      };
    }

    // TRUE/FALSE
    if (q.type === "true_false") {
      return {
        id: q.id,
        type: "true_false",
        question: q.question,
        choices: ["Vrai", "Faux"],
        answerIndex: null,
        correctBool: Boolean(q.correct_answer),
        why: q.why ?? null,
        relatedSkill: q.related_skill ?? null,
      };
    }

    // OPEN / SCENARIO (pas de correction auto)
    return {
      id: q.id,
      type: q.type || "open",
      question: q.question,
      choices: null,
      answerIndex: null,
      correctBool: null,
      why: q.why ?? null,
      relatedSkill: q.related_skill ?? null,
    };
  });

  return {
    quizId: root?.job_title ? `quiz_${Date.now()}` : `quiz_${Date.now()}`,
    jobTitle: root?.job_title ?? null,
    scoreMatch: root?.matching_score_estimation ?? null,
    questions: normalizedQuestions,
  };
}
export function normalizeBackendQuiz(payload) {
  const root = payload?.data ?? payload; // au cas où
  const quiz = root?.quiz ?? [];

  const normalizedQuestions = quiz.map((q) => {
    // MCQ: options = ["A - ...", "B - ..."]
    if (q.type === "mcq") {
      const choices = Array.isArray(q.options) ? q.options : [];
      const correctLetter = q.correct_answer; // "A" | "B" ...
      const answerIndex =
        typeof correctLetter === "string"
          ? Math.max(0, correctLetter.toUpperCase().charCodeAt(0) - 65)
          : null;

      return {
        id: q.id,
        type: "mcq",
        question: q.question,
        choices,
        answerIndex,
        correctBool: null,
        why: q.why ?? null,
        relatedSkill: q.related_skill ?? null,
      };
    }

    // TRUE/FALSE
    if (q.type === "true_false") {
      return {
        id: q.id,
        type: "true_false",
        question: q.question,
        choices: ["Vrai", "Faux"],
        answerIndex: null,
        correctBool: Boolean(q.correct_answer),
        why: q.why ?? null,
        relatedSkill: q.related_skill ?? null,
      };
    }

    // OPEN / SCENARIO (pas de correction auto)
    return {
      id: q.id,
      type: q.type || "open",
      question: q.question,
      choices: null,
      answerIndex: null,
      correctBool: null,
      why: q.why ?? null,
      relatedSkill: q.related_skill ?? null,
    };
  });

  return {
    quizId: root?.job_title ? `quiz_${Date.now()}` : `quiz_${Date.now()}`,
    jobTitle: root?.job_title ?? null,
    scoreMatch: root?.matching_score_estimation ?? null,
    questions: normalizedQuestions,
  };
}
