export async function generateQuiz({ cvFile, jobMode, jobText, jobFile }) {
  const formData = new FormData();
  formData.append("cv", cvFile);

  formData.append("jobMode", jobMode); // "text" | "pdf"
  if (jobMode === "text") formData.append("jobText", jobText || "");
  if (jobMode === "pdf" && jobFile) formData.append("jobPdf", jobFile);

  const res = await fetch("/api/quiz/generate", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Erreur inconnue");
    throw new Error(errText || "Erreur serveur");
  }

  return res.json();
}
