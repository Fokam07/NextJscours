"use client";

import { useState } from "react";

function SkullIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 3.07 1.39 5.81 3.57 7.63L7 22h4v-2h2v2h4l1.43-2.37C20.61 17.81 22 15.07 22 12c0-5.52-4.48-10-10-10zm-3 14c-.83 0-1.5-.67-1.5-1.5S8.17 13 9 13s1.5.67 1.5 1.5S9.83 16 9 16zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 13 15 13s1.5.67 1.5 1.5S15.83 16 15 16zm-3-4c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z"/>
    </svg>
  );
}

export default function GeneratorPage({ user }) {
  const [poste, setPoste] = useState("");
  const [offre, setOffre] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!poste || !offre || !file) return;
    setLoading(true);
    // Simulate generation
    setTimeout(() => {
      setResult({
        cv: {
          basics: { name: user?.email?.split('@')[0] || 'Ainz Ooal Gown', email: user?.email || 'ainz@nazarick.com', phone: '+33 6 00 00 00 00', location: { address: 'Grand Tombeau de Nazarick' }, summary: 'Sorcier Supreme et dirigeant absolu de Nazarick.' },
          work: [{ position: poste, name: 'Nazarick Corp', startDate: '2020', endDate: 'Present', location: 'Nazarick', highlights: ['Direction strategique', 'Gestion des Floor Guardians'] }],
          education: [{ studyType: 'Maitrise en Sorcellerie', institution: 'Academie de Nazarick', startDate: '2015', endDate: '2020' }],
          skills: [{ name: 'Competences', keywords: ['Leadership', 'Strategie', 'Magie'] }],
          interests: [{ name: 'Gouvernance' }],
          projects: [],
        },
        letter: { recipient: 'Recruteur', company: 'Enterprise', position: poste, body: `Madame, Monsieur,\n\nJe me permets de vous adresser ma candidature pour le poste de ${poste}.\n\nCordialement.` }
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[hsl(0,60%,35%,0.15)] border border-[hsl(0,60%,35%,0.25)] rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-[hsl(42,50%,54%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[hsl(42,50%,54%)] tracking-wider uppercase">Forge de CV</h1>
          <p className="text-sm text-[hsl(42,30%,45%)]">Forgez votre parchemin de candidature</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 bg-[hsl(260,25%,7%)] p-6 rounded-xl border border-[hsl(260,15%,14%)]">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">Intitule du poste</label>
          <input
            type="text"
            className="bg-[hsl(260,20%,8%)] text-[hsl(42,30%,82%)] border border-[hsl(260,15%,14%)] rounded-lg px-4 py-3 text-sm focus:border-[hsl(42,50%,54%,0.3)] focus:outline-none focus:ring-1 focus:ring-[hsl(42,50%,54%,0.15)] transition-all placeholder:text-[hsl(260,10%,25%)]"
            value={poste}
            onChange={(e) => setPoste(e.target.value)}
            placeholder="Ex: Developpeur Web"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">Offre (texte ou lien)</label>
          <textarea
            className="bg-[hsl(260,20%,8%)] text-[hsl(42,30%,82%)] border border-[hsl(260,15%,14%)] rounded-lg px-4 py-3 text-sm resize-none focus:border-[hsl(42,50%,54%,0.3)] focus:outline-none focus:ring-1 focus:ring-[hsl(42,50%,54%,0.15)] transition-all placeholder:text-[hsl(260,10%,25%)]"
            rows={4}
            value={offre}
            onChange={(e) => setOffre(e.target.value)}
            placeholder="Collez ici l'offre ou son lien"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">CV actuel (PDF ou image)</label>
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.png,.jpg"
              className="w-full bg-[hsl(260,20%,8%)] text-[hsl(42,30%,82%)] border border-[hsl(260,15%,14%)] rounded-lg px-4 py-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border file:border-[hsl(42,50%,54%,0.2)] file:bg-[hsl(42,50%,54%,0.08)] file:text-[hsl(42,50%,54%)] file:text-xs file:font-bold file:uppercase file:tracking-wider file:cursor-pointer"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[hsl(0,60%,30%)] hover:bg-[hsl(0,60%,35%)] text-[hsl(42,50%,70%)] px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all border border-[hsl(0,50%,40%,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-[hsl(42,50%,54%,0.3)] border-t-[hsl(42,50%,54%)] rounded-full animate-spin" />
              <span>Forge en cours...</span>
            </>
          ) : (
            <>
              <SkullIcon className="w-5 h-5" />
              <span>Forger le Parchemin</span>
            </>
          )}
        </button>
      </form>

      {/* Result preview */}
      {result && (
        <div className="bg-[hsl(260,25%,7%)] rounded-xl border border-[hsl(260,15%,14%)] p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-[1px] bg-[hsl(42,50%,54%,0.3)]" />
            <h2 className="text-sm font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">Resultat</h2>
            <div className="flex-1 h-[1px] bg-[hsl(42,50%,54%,0.3)]" />
          </div>
          <div className="bg-[hsl(260,20%,10%)] rounded-lg p-4 border border-[hsl(260,15%,14%)]">
            <h3 className="text-[hsl(42,50%,54%)] font-bold mb-2">{result.cv.basics.name}</h3>
            <p className="text-[hsl(42,30%,65%)] text-sm">{result.cv.basics.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.cv.skills[0]?.keywords.map((skill, i) => (
                <span key={i} className="text-[10px] px-2 py-1 bg-[hsl(0,60%,35%,0.1)] text-[hsl(0,50%,60%)] rounded border border-[hsl(0,60%,35%,0.2)] font-bold uppercase tracking-wider">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-[hsl(42,30%,35%)] text-center">Connectez le backend pour generer un CV complet avec IA</p>
        </div>
      )}
    </div>
  );
}
