'use client';

import { useState, useEffect, useMemo } from 'react';
import { Mail, Phone, MapPin, Download, FileText, Briefcase, Calendar } from 'lucide-react';

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
  const [isReady, setIsReady] = useState(false);
  
  const theme = themes[selectedTheme];

  // Attendre que le composant soit monté
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Validation des données avec useMemo
  const validatedData = useMemo(() => {
    if (!data || !data.cv || !data.cv.basics) {
      return null;
    }
    return data;
  }, [data]);

  if (!isReady || !validatedData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const downloadPDF = async () => {
    const element = document.getElementById('cv-preview');
    if (!element) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: 0,
        filename: `${view === 'cv' ? 'CV' : 'Lettre_Motivation'}_${validatedData.cv.basics.name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      alert('Erreur lors du téléchargement.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre de contrôle */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Sélection CV/Lettre */}
          <div className="flex gap-2">
            <button
              type="button"
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
              type="button"
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
                type="button"
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
            type="button"
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
              <CVPreview data={validatedData} theme={theme} />
            ) : (
              <LetterPreview data={validatedData} theme={theme} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant CV avec sidebar
function CVPreview({ data, theme }) {
  const basics = data?.cv?.basics || {};
  const skills = Array.isArray(data?.cv?.skills) ? data.cv.skills : [];
  const work = Array.isArray(data?.cv?.work) ? data.cv.work : [];
  const education = Array.isArray(data?.cv?.education) ? data.cv.education : [];
  const projects = Array.isArray(data?.cv?.projects) ? data.cv.projects : [];
  const interests = Array.isArray(data?.cv?.interests) ? data.cv.interests : [];

  return (
    <div className="flex h-full" style={{ minHeight: '297mm' }}>
      {/* Sidebar gauche */}
      <div className={`${theme.sidebar} text-white p-6 w-72 flex-shrink-0`}>
        {/* Photo placeholder */}
        <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl font-bold">
            {basics.name ? basics.name.charAt(0) : 'U'}
          </span>
        </div>

        {/* Nom */}
        <h1 className="text-xl font-bold text-center mb-1">{basics.name || 'Non renseigné'}</h1>
        <p className="text-center text-sm opacity-90 mb-6">Développeur Front-end</p>

        {/* Contact */}
        <div className="mb-6 space-y-3 text-sm">
          <h3 className="font-bold text-base mb-3 border-b border-white/30 pb-2">CONTACT</h3>
          {basics.email && (
            <div className="flex items-start gap-2" key="contact-email">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="break-all">{basics.email}</span>
            </div>
          )}
          {basics.phone && (
            <div className="flex items-start gap-2" key="contact-phone">
              <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{basics.phone}</span>
            </div>
          )}
          {basics.location?.address && (
            <div className="flex items-start gap-2" key="contact-location">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{basics.location.address}</span>
            </div>
          )}
        </div>

        {/* Compétences */}
        {skills.length > 0 && (
          <div className="mb-6" key="skills-section">
            <h3 className="font-bold text-base mb-3 border-b border-white/30 pb-2">COMPÉTENCES</h3>
            {skills.map((skillGroup, idx) => (
              <div key={`skill-group-${idx}`} className="mb-4">
                <h4 className="text-xs font-semibold mb-2 opacity-80">{skillGroup.name || 'Compétences'}</h4>
                <div className="space-y-1">
                  {(Array.isArray(skillGroup.keywords) ? skillGroup.keywords : []).map((skill, i) => (
                    <div key={`skill-${idx}-${i}`} className="text-xs bg-white/10 rounded px-2 py-1">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Centres d'intérêt */}
        {interests.length > 0 && (
          <div key="interests-section">
            <h3 className="font-bold text-base mb-3 border-b border-white/30 pb-2">CENTRES D'INTÉRÊT</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, idx) => (
                <span key={`interest-${idx}`} className="text-xs bg-white/10 rounded px-2 py-1">
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
        {basics.summary && (
          <section className="mb-6" key="profile-section">
            <h2 className={`text-xl font-bold ${theme.text} mb-2 pb-1 border-b-2 ${theme.border}`}>
              PROFIL
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">{basics.summary}</p>
          </section>
        )}

        {/* Expérience */}
        {work.length > 0 && (
          <section className="mb-6" key="work-section">
            <h2 className={`text-xl font-bold ${theme.text} mb-3 pb-1 border-b-2 ${theme.border}`}>
              EXPÉRIENCE PROFESSIONNELLE
            </h2>
            {work.map((job, idx) => (
              <div key={`work-${idx}`} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{job.position || 'Poste'}</h3>
                    <p className="text-sm text-gray-600 font-semibold">{job.name || 'Entreprise'}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {job.startDate || ''} - {job.endDate || ''}
                    </p>
                    {job.location && <p>{job.location}</p>}
                  </div>
                </div>
                {Array.isArray(job.highlights) && job.highlights.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-700 ml-1">
                    {job.highlights.slice(0, 4).map((highlight, i) => (
                      <li key={`highlight-${idx}-${i}`} className="leading-snug">{highlight}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Formation */}
        {education.length > 0 && (
          <section className="mb-6" key="education-section">
            <h2 className={`text-xl font-bold ${theme.text} mb-3 pb-1 border-b-2 ${theme.border}`}>
              FORMATION
            </h2>
            {education.map((edu, idx) => (
              <div key={`edu-${idx}`} className="mb-2 flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{edu.studyType || 'Formation'}</h3>
                  <p className="text-xs text-gray-600">{edu.institution || 'Institution'}</p>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {edu.startDate || ''} - {edu.endDate || ''}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Projets */}
        {projects.length > 0 && (
          <section key="projects-section">
            <h2 className={`text-xl font-bold ${theme.text} mb-3 pb-1 border-b-2 ${theme.border}`}>
              PROJETS
            </h2>
            {projects.map((project, idx) => (
              <div key={`project-${idx}`} className="mb-3">
                <h3 className="text-sm font-bold text-gray-900">{project.name || 'Projet'}</h3>
                {project.description && (
                  <p className="text-xs text-gray-700 mb-1 leading-snug">{project.description}</p>
                )}
                {Array.isArray(project.keywords) && project.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.keywords.map((tech, i) => (
                      <span key={`tech-${idx}-${i}`} className={`${theme.tag} px-2 py-0.5 rounded text-xs font-medium`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
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
  const basics = data?.cv?.basics || {};
  const letter = data?.letter || {};

  return (
    <div className="p-12" style={{ minHeight: '297mm' }}>
      {/* En-tête */}
      <div className="mb-8">
        <div className="text-right mb-8">
          <p className="font-bold text-gray-900">{basics.name || 'Votre nom'}</p>
          <p className="text-sm text-gray-600">{basics.location?.address || ''}</p>
          <p className="text-sm text-gray-600">{basics.email || ''}</p>
          <p className="text-sm text-gray-600">{basics.phone || ''}</p>
        </div>

        <div className="mb-6">
          <p className="font-semibold text-gray-900">{letter.recipient || 'Destinataire'}</p>
          <p className="text-sm text-gray-600">{letter.company || 'Entreprise'}</p>
        </div>

        <p className="text-sm mb-6">
          <span className="font-semibold">Objet :</span> Candidature au poste de {letter.position || 'Poste'}
        </p>
      </div>

      {/* Corps */}
      <div className="text-sm text-gray-700 leading-relaxed space-y-3 whitespace-pre-line">
        {letter.body || 'Contenu de la lettre de motivation...'}
      </div>

      {/* Signature */}
      <div className="mt-8 text-right">
        <p className="font-semibold text-gray-900">{basics.name || 'Votre nom'}</p>
      </div>
    </div>
  );
}