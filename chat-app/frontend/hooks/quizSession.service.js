const STORAGE_KEY = "quiz_session";

export const saveQuizSession = (session) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
};

export const getQuizSession = () => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const clearQuizSession = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
};
