"use client";

import { useState } from "react";
import { useCv } from "../hooks/useCv";
import { useAuth } from "../hooks/useAuth";
import CVViewer from "./cvViewer";

export default function GeneratorPage({user}) {
  const [poste, setPoste] = useState("");
  const [offre, setOffre] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const { generate, loading, result } = useCv(user?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!poste || !offre || !file) {
      
      return;
    }

    await generate({
      poste,
      offre,
      file
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Générateur de CV + Lettre</h1>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white shadow p-5 rounded-lg border"
      >
        <div className="flex flex-col">
          <label className="font-medium">Intitulé du poste</label>
          <input
            type="text"
            className="border rounded px-3 py-2"
            value={poste}
            onChange={(e) => setPoste(e.target.value)}
            placeholder="Ex: Développeur Web"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium">
            Offre (texte ou lien)
          </label>
          <textarea
            className="border rounded px-3 py-2"
            rows={4}
            value={offre}
            onChange={(e) => setOffre(e.target.value)}
            placeholder="Collez ici l'offre ou son lien"
          ></textarea>
        </div>

        <div className="flex flex-col">
          <label className="font-medium">CV actuel (PDF ou image)</label>
          <input
            type="file"
            accept=".pdf,.png,.jpg"
            className="mt-1"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {loading ? "Génération..." : "Générer CV et Lettre"}
        </button>
      </form>

      {/* Résultat */}
      {result && <CVViewer data={result}></CVViewer>
      }
    </div>
  );
}
