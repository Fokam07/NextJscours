'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Download, FileText, Briefcase, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Toast System ─────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold backdrop-blur
              ${t.type === 'success' ? 'bg-emerald-950/90 border border-emerald-700/40 text-emerald-400' : ''}
              ${t.type === 'error' ? 'bg-rose-950/90 border border-rose-700/40 text-rose-400' : ''}
              ${t.type === 'info' ? 'bg-slate-900/90 border border-slate-700/40 text-slate-300' : ''}
            `}
          >
            <span>{t.type === 'success' ? '✦' : t.type === 'error' ? '✗' : '◈'}</span>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = 'info', duration = 3200) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), duration);
  };
  return { toasts, toast: { success: (m) => add(m, 'success'), error: (m) => add(m, 'error'), info: (m) => add(m, 'info') } };
}

// ─── Theme Definitions ────────────────────────────────────────────────────────
const themes = {
  modern: {
    label: 'Modern',
    dot: '#3b82f6',
    primary: 'bg-blue-600',
    primaryGradient: 'from-blue-600 to-blue-700',
    accent: 'bg-blue-50',
    text: 'text-blue-600',
    sidebar: 'bg-gray-800',
    tag: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
  },
  classic: {
    label: 'Classic',
    dot: '#374151',
    primary: 'bg-gray-800',
    primaryGradient: 'from-gray-800 to-gray-900',
    accent: 'bg-gray-50',
    text: 'text-gray-800',
    sidebar: 'bg-gray-900',
    tag: 'bg-gray-200 text-gray-800',
    border: 'border-gray-300',
  },
  minimal: {
    label: 'Minimal',
    dot: '#64748b',
    primary: 'bg-slate-700',
    primaryGradient: 'from-slate-700 to-slate-800',
    accent: 'bg-slate-50',
    text: 'text-slate-700',
    sidebar: 'bg-slate-800',
    tag: 'bg-slate-100 text-slate-700',
    border: 'border-slate-200',
  },
  colorful: {
    label: 'Colorful',
    dot: '#f43f5e',
    primary: 'bg-rose-500',
    primaryGradient: 'from-rose-500 to-orange-500',
    accent: 'bg-orange-50',
    text: 'text-rose-600',
    sidebar: 'bg-gradient-to-b from-rose-600 to-orange-600',
    tag: 'bg-orange-100 text-orange-700',
    border: 'border-orange-200',
  },
  professional: {
    label: 'Pro',
    dot: '#059669',
    primary: 'bg-emerald-600',
    primaryGradient: 'from-emerald-600 to-teal-600',
    accent: 'bg-emerald-50',
    text: 'text-emerald-600',
    sidebar: 'bg-emerald-800',
    tag: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
  },
};

// One default theme per variant index
const variantDefaultThemes = ['modern', 'colorful', 'professional'];

// ─── Theme Dot Button ──────────────────────────────────────────────────────────
function ThemeDot({ name, t, active, onClick }) {
  return (
    <motion.button
      onClick={() => onClick(name)}
      title={t.label}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      className="relative flex flex-col items-center gap-1 group"
    >
      <motion.div
        animate={{ scale: active ? 1.15 : 1, boxShadow: active ? `0 0 0 2px white, 0 0 0 4px ${t.dot}` : 'none' }}
        transition={{ duration: 0.2 }}
        style={{ backgroundColor: t.dot }}
        className="w-5 h-5 rounded-full"
      />
      <span className={`text-[9px] font-bold uppercase tracking-wider transition-opacity ${active ? 'opacity-100 text-white' : 'opacity-40 text-gray-400'}`}>
        {t.label}
      </span>
    </motion.button>
  );
}

// ─── CV Preview ───────────────────────────────────────────────────────────────
function CVPreview({ data, theme }) {
  return (
    <div className="flex h-full" style={{ minHeight: '297mm' }}>
      <div className={`${theme.sidebar} text-white p-6 w-72 flex-shrink-0`}>
        <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl font-bold">{data.cv.basics.name.charAt(0)}</span>
        </div>
        <h1 className="text-xl font-bold text-center mb-1">{data.cv.basics.name}</h1>
        <p className="text-center text-sm opacity-80 mb-6">{data.cv.work?.[0]?.position || 'Candidat'}</p>

        <div className="mb-6 space-y-2.5 text-sm">
          <h3 className="font-bold text-sm mb-2 border-b border-white/30 pb-1.5 uppercase tracking-wider">Contact</h3>
          <div className="flex items-start gap-2 text-xs">
            <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-70" />
            <span className="break-all">{data.cv.basics.email}</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-70" />
            <span>{data.cv.basics.phone}</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-70" />
            <span>{data.cv.basics.location?.address}</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2 border-b border-white/30 pb-1.5 uppercase tracking-wider">Compétences</h3>
          {data.cv.skills?.map((group, idx) => (
            <div key={idx} className="mb-3">
              <h4 className="text-[10px] font-semibold mb-1.5 opacity-60 uppercase tracking-wider">{group.name}</h4>
              <div className="flex flex-wrap gap-1">
                {group.keywords?.map((skill, i) => (
                  <span key={i} className="text-[10px] bg-white/10 rounded px-2 py-0.5">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {data.cv.interests?.length > 0 && (
          <div>
            <h3 className="font-bold text-sm mb-2 border-b border-white/30 pb-1.5 uppercase tracking-wider">Intérêts</h3>
            <div className="flex flex-wrap gap-1">
              {data.cv.interests.map((i, idx) => (
                <span key={idx} className="text-[10px] bg-white/10 rounded px-2 py-0.5">{i.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 p-8">
        <section className="mb-6">
          <h2 className={`text-lg font-bold ${theme.text} mb-2 pb-1 border-b-2 ${theme.border} uppercase tracking-wider`}>Profil</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{data.cv.basics.summary}</p>
        </section>

        <section className="mb-6">
          <h2 className={`text-lg font-bold ${theme.text} mb-3 pb-1 border-b-2 ${theme.border} uppercase tracking-wider`}>Expérience</h2>
          {data.cv.work?.map((job, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{job.position}</h3>
                  <p className="text-xs text-gray-600 font-semibold">{job.name}</p>
                </div>
                <div className="text-right text-xs text-gray-500 flex flex-col items-end gap-0.5">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{job.startDate} – {job.endDate}</span>
                  <span>{job.location}</span>
                </div>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-700 ml-1">
                {job.highlights?.slice(0, 4).map((h, i) => <li key={i} className="leading-snug">{h}</li>)}
              </ul>
            </div>
          ))}
        </section>

        <section className="mb-6">
          <h2 className={`text-lg font-bold ${theme.text} mb-3 pb-1 border-b-2 ${theme.border} uppercase tracking-wider`}>Formation</h2>
          {data.cv.education?.map((edu, idx) => (
            <div key={idx} className="mb-2 flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{edu.studyType}</h3>
                <p className="text-xs text-gray-600">{edu.institution}</p>
              </div>
              <p className="text-xs text-gray-500 font-medium">{edu.startDate} – {edu.endDate}</p>
            </div>
          ))}
        </section>

        {data.cv.projects?.length > 0 && (
          <section>
            <h2 className={`text-lg font-bold ${theme.text} mb-3 pb-1 border-b-2 ${theme.border} uppercase tracking-wider`}>Projets</h2>
            {data.cv.projects.map((p, idx) => (
              <div key={idx} className="mb-3">
                <h3 className="text-sm font-bold text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-700 mb-1 leading-snug">{p.description}</p>
                <div className="flex flex-wrap gap-1">
                  {p.keywords?.map((tech, i) => (
                    <span key={i} className={`${theme.tag} px-2 py-0.5 rounded text-xs font-medium`}>{tech}</span>
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

// ─── Letter Preview ───────────────────────────────────────────────────────────
function LetterPreview({ data }) {
  return (
    <div className="p-12" style={{ minHeight: '297mm' }}>
      <div className="mb-8">
        <div className="text-right mb-8">
          <p className="font-bold text-gray-900">{data.cv.basics.name}</p>
          <p className="text-sm text-gray-600">{data.cv.basics.location?.address}</p>
          <p className="text-sm text-gray-600">{data.cv.basics.email}</p>
          <p className="text-sm text-gray-600">{data.cv.basics.phone}</p>
        </div>
        <div className="mb-6">
          <p className="font-semibold text-gray-900">{data.letter?.recipient}</p>
          <p className="text-sm text-gray-600">{data.letter?.company}</p>
        </div>
        <p className="text-sm mb-6">
          <span className="font-semibold">Objet :</span> Candidature au poste de {data.letter?.position}
        </p>
      </div>
      <div className="text-sm text-gray-700 leading-relaxed space-y-3 whitespace-pre-line">
        {data.letter?.body}
      </div>
      <div className="mt-8 text-right">
        <p className="font-semibold text-gray-900">{data.cv.basics.name}</p>
      </div>
    </div>
  );
}

// ─── Variant Tab Bar ──────────────────────────────────────────────────────────
const VARIANT_ACCENTS = ['#3b82f6', '#f43f5e', '#059669'];

function VariantTabs({ variants, activeIdx, onChange }) {
  if (variants.length <= 1) return null;
  return (
    <div className="flex gap-2">
      {variants.map((_, i) => (
        <motion.button
          key={i}
          onClick={() => onChange(i)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{
            backgroundColor: activeIdx === i ? `${VARIANT_ACCENTS[i % 3]}22` : 'transparent',
            color: activeIdx === i ? VARIANT_ACCENTS[i % 3] : '#9ca3af',
            border: `1px solid ${activeIdx === i ? `${VARIANT_ACCENTS[i % 3]}44` : '#374151'}`,
          }}
        >
          {activeIdx === i && (
            <motion.div
              layoutId="variant-pill"
              className="absolute inset-0 rounded-lg"
              style={{ backgroundColor: `${VARIANT_ACCENTS[i % 3]}15` }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative">Variante {i + 1}</span>
        </motion.button>
      ))}
    </div>
  );
}

// ─── Main CVViewer ────────────────────────────────────────────────────────────
export default function CVViewer({ data, initialVariantIdx = 0, onBack }) {
  // Support single object or array of variants
  const variants = Array.isArray(data) ? data : [data];

  const [variantIdx, setVariantIdx] = useState(Math.min(initialVariantIdx, variants.length - 1));
  const [selectedTheme, setSelectedTheme] = useState(variantDefaultThemes[variantIdx] || 'modern');
  const [view, setView] = useState('cv');
  const [downloading, setDownloading] = useState(false);
  const { toasts, toast } = useToast();

  const theme = themes[selectedTheme];
  const currentData = variants[variantIdx];

  const handleThemeChange = (name) => {
    setSelectedTheme(name);
    toast.info(`Thème "${themes[name].label}" appliqué`);
  };

  const handleVariantChange = (idx) => {
    setVariantIdx(idx);
    setSelectedTheme(variantDefaultThemes[idx] || 'modern');
    toast.info(`Variante ${idx + 1} sélectionnée`);
  };

  const downloadPDF = async () => {
    const element = document.getElementById('cv-preview');
    if (!element) return;
    setDownloading(true);
    toast.info('Préparation du téléchargement…');
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const name = currentData.cv.basics.name.replace(/\s+/g, '_');
      const opt = {
        margin: 0,
        filename: `${view === 'cv' ? 'CV' : 'Lettre'}_${name}_V${variantIdx + 1}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      await html2pdf().set(opt).from(element).save();
      toast.success('Téléchargement réussi !');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Toast toasts={toasts} />

      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-6 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Control Bar */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100"
          >
            <div className="flex flex-wrap gap-3 items-center justify-between">

              {/* Left: back + variant tabs + cv/letter tabs */}
              <div className="flex items-center gap-3 flex-wrap">
                {onBack && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Retour
                  </motion.button>
                )}

                <VariantTabs variants={variants} activeIdx={variantIdx} onChange={handleVariantChange} />

                {/* CV / Lettre toggle */}
                <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                  {[{ key: 'cv', label: 'CV', Icon: FileText }, { key: 'letter', label: 'Lettre', Icon: Briefcase }].map(({ key, label, Icon }) => (
                    <motion.button
                      key={key}
                      onClick={() => setView(key)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
                      style={{ color: view === key ? 'white' : '#6b7280' }}
                    >
                      {view === key && (
                        <motion.div
                          layoutId="view-tab-bg"
                          className={`absolute inset-0 bg-gradient-to-r ${theme.primaryGradient} rounded-lg shadow-md`}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon className="w-3.5 h-3.5 relative" />
                      <span className="relative">{label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Center: Theme picker */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thème</span>
                <div className="flex gap-3">
                  {Object.entries(themes).map(([name, t]) => (
                    <ThemeDot key={name} name={name} t={t} active={selectedTheme === name} onClick={handleThemeChange} />
                  ))}
                </div>
              </div>

              {/* Right: Download */}
              <motion.button
                onClick={downloadPDF}
                disabled={downloading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-60 transition-all"
              >
                {downloading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : <Download className="w-4 h-4" />}
                Télécharger
              </motion.button>
            </div>
          </motion.div>

          {/* Document preview */}
          <div className="flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${variantIdx}-${selectedTheme}-${view}`}
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.99 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="bg-white shadow-2xl"
                style={{ width: '210mm', minHeight: '297mm' }}
              >
                <div id="cv-preview" className="w-full h-full">
                  {view === 'cv' ? (
                    <CVPreview data={currentData} theme={theme} />
                  ) : (
                    <LetterPreview data={currentData} />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Variant navigation arrows (mobile helper) */}
          {variants.length > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <motion.button
                onClick={() => handleVariantChange(Math.max(0, variantIdx - 1))}
                disabled={variantIdx === 0}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-500 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <span className="flex items-center text-sm text-gray-500 font-medium">
                {variantIdx + 1} / {variants.length}
              </span>
              <motion.button
                onClick={() => handleVariantChange(Math.min(variants.length - 1, variantIdx + 1))}
                disabled={variantIdx === variants.length - 1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-500 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}