import { useState } from "react";
import { useCv } from "../hooks/useCv";


export default function GeneratorPage({ user }) {
  const [poste, setPoste] = useState("");
  const [offre, setOffre] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const { generate, loading, result, error: apiError } = useCv(user?.id); // ✅ Récupérer apiError

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
      {/* ... votre code ... */}
      
      {/* Message d'erreur */}
      {displayError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {displayError}
        </div>
      )}
      
      {/* ... reste du code ... */}
      
      {/* COLONNE DROITE */}
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
  );
}