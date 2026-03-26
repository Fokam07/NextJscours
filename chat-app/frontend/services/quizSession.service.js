const STORAGE_KEY = "quiz_session_v1";

export const saveQuizSession = (session) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const getQuizSession = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearQuizSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

export const resetQuizProgress = () => {
  const s = getQuizSession();
  if (!s) return null;
  const reset = {
    ...s,
    currentIndex: 0,
    answers: [],
    score: 0,
    startedAt: new Date().toISOString(),
    finishedAt: null,
  };
  saveQuizSession(reset);
  return reset;
};
