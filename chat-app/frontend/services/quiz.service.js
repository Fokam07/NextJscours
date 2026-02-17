export async function generateQuiz({ cvFile, jobMode, jobText, jobFile }) {
  if (!cvFile) throw new Error("CV manquant.");

  const formData = new FormData();
  formData.append("cv", cvFile);

  formData.append("jobMode", jobMode); // "text" | "pdf"
  if (jobMode === "text") formData.append("jobText", (jobText || "").trim());
  if (jobMode === "pdf") {
    if (!jobFile) throw new Error("PDF de l'offre manquant.");
    formData.append("jobPdf", jobFile);
  }

  const res = await fetch("/api/quiz/generate", {
    method: "POST",
    body: formData,
    // utile si ton API dépend des cookies/session (Supabase SSR, etc.)
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  // ✅ Gestion d'erreur propre (JSON ou texte)
  if (!res.ok) {
    if (isJson) {
      const err = await res.json().catch(() => null);
      const msg =
        err?.message ||
        err?.error ||
        err?.detail ||
        err?.data?.message ||
        "Erreur serveur";
      throw new Error(msg);
    } else {
      const errText = await res.text().catch(() => "Erreur serveur");
      throw new Error(errText || "Erreur serveur");
    }
  }

  const payload = isJson ? await res.json() : null;

  // ✅ Vérifie que le backend respecte bien la forme attendue
  // attend: { data: { job_title, matching_score_estimation, quiz: [...] } }
  if (!payload || typeof payload !== "object") {
    throw new Error("Réponse serveur invalide (JSON attendu).");
  }
  if (!payload.data || !Array.isArray(payload.data.quiz)) {
    throw new Error("Réponse serveur invalide: champ data.quiz manquant.");
  }

  return payload;
}
