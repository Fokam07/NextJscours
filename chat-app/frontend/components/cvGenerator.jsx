"use client";

import { useState } from "react";
import { useCv } from "../hooks/useCv";
import { useAuth } from "../hooks/useAuth";
import CVViewer from "./cvViewer";
import { Upload, FileText, Briefcase, Sparkles } from "lucide-react";

export default function GeneratorPage({ user }) {
  const [poste, setPoste] = useState("");
  const [offre, setOffre] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
   const { generate, loading, result, error: apiError } = useCv(user?.id); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!poste || !offre || !file) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setError(null);
    await generate({ poste, offre, file });
  };

  // ✅ Afficher l'erreur API si elle existe
  const displayError = error || apiError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            Générateur de CV et Lettre de motivation
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Créez un CV et une lettre de motivation personnalisés en quelques clics
          </p>
        </div>
      </div>

      {/* Layout 2 colonnes */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* COLONNE GAUCHE - Formulaire */}
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Informations requises</h2>
                  <p className="text-xs text-gray-500">Remplissez le formulaire ci-dessous</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Intitulé du poste */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-semibold text-sm text-gray-700">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    Intitulé du poste
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={poste}
                    onChange={(e) => setPoste(e.target.value)}
                    placeholder="Ex: Développeur Front-end React"
                  />
                </div>

                {/* Offre */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-semibold text-sm text-gray-700">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Description de l'offre
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    rows={6}
                    value={offre}
                    onChange={(e) => setOffre(e.target.value)}
                    placeholder="Collez ici la description de l'offre d'emploi ou le lien vers l'annonce..."
                  ></textarea>
                </div>

                {/* Upload CV */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-semibold text-sm text-gray-700">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    Votre CV actuel
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      id="file-upload"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">
                          {file ? file.name : "Cliquez pour uploader"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, PNG ou JPG (max. 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Message d'erreur */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Générer CV et Lettre
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Info card */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100">
              <h3 className="font-bold text-sm text-indigo-900 mb-2">💡 Astuce</h3>
              <p className="text-xs text-indigo-700 leading-relaxed">
                Plus votre description de l'offre est détaillée, plus le CV généré sera
                adapté et pertinent pour le poste visé.
              </p>
            </div>
          </div>

          {displayError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {displayError}
        </div>
      )}

          {/* COLONNE DROITE - Aperçu (EN DEHORS DU FORMULAIRE) */}
          <div className="space-y-4">
        {loading ? (
          // ✅ Afficher un loader pendant le chargement
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" /* ... */></svg>
              <p className="text-gray-600">Génération en cours...</p>
            </div>
          </div>
        ) : result ? (
          <CVViewer data={result} key={JSON.stringify(result)} /> // ✅ Ajouter key pour forcer re-render
        ) : (
          <div className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 p-12">
            {/* ... placeholder ... */}
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}