'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Download, FileText, Briefcase, Globe, Calendar } from 'lucide-react';

const themes = {
  modern: {
    primary: 'bg-blue-600',
    primaryGradient: 'from-blue-600 to-blue-700',
    accent: 'bg-blue-50',
    text: 'text-blue-600',
    sidebar: 'bg-gray-800',
    tag: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
  },
  classic: {
    primary: 'bg-gray-800',
    primaryGradient: 'from-gray-800 to-gray-900',
    accent: 'bg-gray-50',
    text: 'text-gray-800',
    sidebar: 'bg-gray-900',
    tag: 'bg-gray-200 text-gray-800',
    border: 'border-gray-300',
  },
  minimal: {
    primary: 'bg-slate-700',
    primaryGradient: 'from-slate-700 to-slate-800',
    accent: 'bg-slate-50',
    text: 'text-slate-700',
    sidebar: 'bg-slate-800',
    tag: 'bg-slate-100 text-slate-700',
    border: 'border-slate-200',
  },
  colorful: {
    primary: 'bg-rose-500',
    primaryGradient: 'from-rose-500 to-orange-500',
    accent: 'bg-orange-50',
    text: 'text-rose-600',
    sidebar: 'bg-gradient-to-b from-rose-600 to-orange-600',
    tag: 'bg-orange-100 text-orange-700',
    border: 'border-orange-200',
  },
  professional: {
    primary: 'bg-emerald-600',
    primaryGradient: 'from-emerald-600 to-teal-600',
    accent: 'bg-emerald-50',
    text: 'text-emerald-600',
    sidebar: 'bg-emerald-800',
    tag: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
  },
};

export default function CVViewer({ data }) {
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [view, setView] = useState('cv');
  const theme = themes[selectedTheme];

  const downloadPDF = async () => {
    const element = document.getElementById('cv-preview');
    if (!element) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: 0,
        filename: `${view === 'cv' ? 'CV' : 'Lettre_Motivation'}_${data.cv.basics.name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      alert('Erreur lors du téléchargement. Assurez-vous que html2pdf.js est installé.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Barre de contrôle */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            {/* Sélection CV/Lettre */}
            <div className="flex gap-2">
              <button
                onClick={() => setView('cv')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm ${
                  view === 'cv'
                    ? `bg-gradient-to-r ${theme.primaryGradient} text-white shadow-md`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                CV
              </button>
              <button
                onClick={() => setView('letter')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm ${
                  view === 'letter'
                    ? `bg-gradient-to-r ${theme.primaryGradient} text-white shadow-md`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Lettre
              </button>
            </div>

            {/* Sélection de thème */}
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Thème:</span>
              {Object.keys(themes).map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => setSelectedTheme(themeName)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                    selectedTheme === themeName
                      ? `bg-gradient-to-r ${themes[themeName].primaryGradient} text-white shadow-md scale-105`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {themeName}
                </button>
              ))}
            </div>

            {/* Bouton de téléchargement */}
            <button
              onClick={downloadPDF}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg text-sm"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
          </div>
        </div>

        {/* Aperçu du document (format A4) */}
        <div className="flex justify-center">
          <div className="bg-white shadow-2xl" style={{ width: '210mm', minHeight: '297mm' }}>
            <div id="cv-preview" className="w-full h-full">
              {view === 'cv' ? (
                <CVPreview data={data} theme={theme} />
              ) : (
                <LetterPreview data={data} theme={theme} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant CV avec sidebar
function CVPreview({ data, theme }) {
  return (
    <div className="flex h-full" style={{ minHeight: '297mm' }}>
      {/* Sidebar gauche */}
      <div className={`${theme.sidebar} text-white p-6 w-72 flex-shrink-0`}>
        {/* Photo placeholder */}
        <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl font-bold">{data.cv.basics.name.charAt(0)}</span>
        </div>

        {/* Nom */}
        <h1 className="text-xl font-bold text-center mb-1">{data.cv.basics.name}</h1>
        <p className="text-center text-sm opacity-90 mb-6">Développeur Front-end</p>

        {/* Contact */}
        <div className="mb-6 space-y-3 text-sm">
          <h3 className="font-bold text-base mb-3 border-b border-white/30 pb-2">CONTACT</h3>
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="break-all">{data.cv.basics.email}</span>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{data.cv.basics.phone}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{data.cv.basics.location.address}</span>
          </div>
        </div>

        {/* Compétences */}
        <div className="mb-6">
          <h3 className="font-bold text-base mb-3 border-b border-white/30 pb-2">COMPÉTENCES</h3>
          {data.cv.skills.map((skillGroup, idx) => (
            <div key={idx} className="mb-4">
              <h4 className="text-xs font-semibold mb-2 opacity-80">{skillGroup.name}</h4>
              <div className="space-y-1">
                {skillGroup.keywords.map((skill, i) => (
                  <div key={i} className="text-xs bg-white/10 rounded px-2 py-1">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Centres d'intérêt */}
        {data.cv.interests && data.cv.interests.length > 0 && (
          <div>
            <h3 className="font-bold text-base mb-3 border-b border-white/30 pb-2">CENTRES D'INTÉRÊT</h3>
            <div className="flex flex-wrap gap-2">
              {data.cv.interests.map((interest, idx) => (
                <span key={idx} className="text-xs bg-white/10 rounded px-2 py-1">
                  {interest.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-8">
        {/* Profil */}
        <section className="mb-6">
          <h2 className={`text-xl font-bold ${theme.text} mb-2 pb-1 border-b-2 ${theme.border}`}>
            PROFIL
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">{data.cv.basics.summary}</p>
        </section>

        {/* Expérience */}
        <section className="mb-6">
          <h2 className={`text-xl font-bold ${theme.text} mb-3 pb-1 border-b-2 ${theme.border}`}>
            EXPÉRIENCE PROFESSIONNELLE
          </h2>
          {data.cv.work.map((job, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{job.position}</h3>
                  <p className="text-sm text-gray-600 font-semibold">{job.name}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {job.startDate} - {job.endDate}
                  </p>
                  <p>{job.location}</p>
                </div>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-700 ml-1">
                {job.highlights.slice(0, 4).map((highlight, i) => (
                  <li key={i} className="leading-snug">{highlight}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Formation */}
        <section className="mb-6">
          <h2 className={`text-xl font-bold ${theme.text} mb-3 pb-1 border-b-2 ${theme.border}`}>
            FORMATION
          </h2>
          {data.cv.education.map((edu, idx) => (
            <div key={idx} className="mb-2 flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{edu.studyType}</h3>
                <p className="text-xs text-gray-600">{edu.institution}</p>
              </div>
              <p className="text-xs text-gray-500 font-medium">{edu.startDate} - {edu.endDate}</p>
            </div>
          ))}
        </section>

        {/* Projets */}
        {data.cv.projects && data.cv.projects.length > 0 && (
          <section>
            <h2 className={`text-xl font-bold ${theme.text} mb-3 pb-1 border-b-2 ${theme.border}`}>
              PROJETS
            </h2>
            {data.cv.projects.map((project, idx) => (
              <div key={idx} className="mb-3">
                <h3 className="text-sm font-bold text-gray-900">{project.name}</h3>
                <p className="text-xs text-gray-700 mb-1 leading-snug">{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {project.keywords.map((tech, i) => (
                    <span key={i} className={`${theme.tag} px-2 py-0.5 rounded text-xs font-medium`}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

// Composant Lettre de motivation
function LetterPreview({ data, theme }) {
  return (
    <div className="p-12" style={{ minHeight: '297mm' }}>
      {/* En-tête */}
      <div className="mb-8">
        <div className="text-right mb-8">
          <p className="font-bold text-gray-900">{data.cv.basics.name}</p>
          <p className="text-sm text-gray-600">{data.cv.basics.location.address}</p>
          <p className="text-sm text-gray-600">{data.cv.basics.email}</p>
          <p className="text-sm text-gray-600">{data.cv.basics.phone}</p>
        </div>

        <div className="mb-6">
          <p className="font-semibold text-gray-900">{data.letter.recipient}</p>
          <p className="text-sm text-gray-600">{data.letter.company}</p>
        </div>

        <p className="text-sm mb-6">
          <span className="font-semibold">Objet :</span> Candidature au poste de {data.letter.position}
        </p>
      </div>

      {/* Corps */}
      <div className="text-sm text-gray-700 leading-relaxed space-y-3 whitespace-pre-line">
        {data.letter.body}
      </div>

      {/* Signature */}
      <div className="mt-8 text-right">
        <p className="font-semibold text-gray-900">{data.cv.basics.name}</p>
      </div>
    </div>
  );
}