// useCv.js
import { useState } from "react";

export function useCv(userId) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null); // ✅ Ajouter état erreur

  const generate = async ({ poste, offre, file }) => {
    if(!userId) return;
    
    try {
      setLoading(true);
      setError(null); // ✅ Reset erreur
      setResult(null); // ✅ Reset résultat

      const form = new FormData();
      form.append("poste", poste);
      form.append("offre", offre);
      form.append("cv", file);

      const res = await fetch("/api/cv", {
        method: "POST",
        headers: {
          'x-user-id': userId
        },
        body: form
      });

      const data = await res.json();
      
      if(!res.ok) {
        throw new Error(data.error || "Erreur serveur");
      }
      
      // ✅ Validation des données
      if(data?.cv && data?.letter) {
        setResult(data);
      } else {
        throw new Error("Données incomplètes reçues du serveur");
      }
      
    } catch (error) {
      console.error("Erreur useCv:", error);
      setError(error.message); // ✅ Mettre à jour l'état erreur
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, result, error }; // ✅ Retourner error
}