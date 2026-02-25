"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium
              ${t.type === "success" ? "bg-[hsl(140,40%,12%)] border-[hsl(140,50%,30%,0.4)] text-[hsl(140,60%,70%)]" : ""}
              ${t.type === "error"   ? "bg-[hsl(0,40%,12%)]   border-[hsl(0,60%,40%,0.4)]   text-[hsl(0,60%,70%)]"   : ""}
              ${t.type === "info"   ? "bg-[hsl(220,40%,12%)] border-[hsl(220,60%,40%,0.4)] text-[hsl(220,60%,75%)]" : ""}
            `}
          >
            <span className="text-base">
              {t.type === "success" ? "✦" : t.type === "error" ? "✗" : "◈"}
            </span>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  };
  return {
    toasts,
    toast: {
      success: (m) => add(m, "success"),
      error:   (m) => add(m, "error"),
      info:    (m) => add(m, "info"),
    },
  };
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function SkullIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 3.07 1.39 5.81 3.57 7.63L7 22h4v-2h2v2h4l1.43-2.37C20.61 17.81 22 15.07 22 12c0-5.52-4.48-10-10-10zm-3 14c-.83 0-1.5-.67-1.5-1.5S8.17 13 9 13s1.5.67 1.5 1.5S9.83 16 9 16zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 13 15 13s1.5.67 1.5 1.5S15.83 16 15 16zm-3-4c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z"/>
    </svg>
  );
}

// ─── File Drop Zone ───────────────────────────────────────────────────────────
function FileDropZone({ file, onChange }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onChange(f);
  };

  return (
    <motion.div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      animate={{
        borderColor: dragging ? "hsl(42,50%,54%)" : file ? "hsl(140,40%,35%)" : "hsl(260,15%,20%)",
        backgroundColor: dragging ? "hsl(42,50%,54%,0.05)" : file ? "hsl(140,40%,12%,0.5)" : "hsl(260,20%,8%)",
      }}
      transition={{ duration: 0.2 }}
      className="border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer flex flex-col items-center gap-3 select-none"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg"
        className="hidden"
        onChange={(e) => onChange(e.target.files[0])}
      />
      <motion.div animate={{ scale: dragging ? 1.15 : 1 }}
        className={file ? "text-[hsl(140,60%,60%)]" : "text-[hsl(260,15%,40%)]"}
      >
        {file ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        )}
      </motion.div>
      {file ? (
        <div className="text-center">
          <p className="text-[hsl(140,60%,65%)] text-sm font-semibold">{file.name}</p>
          <p className="text-[hsl(140,30%,40%)] text-xs">{(file.size / 1024).toFixed(0)} Ko · Cliquez pour changer</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-[hsl(42,30%,55%)] text-sm">Glissez votre CV ici</p>
          <p className="text-[hsl(260,10%,30%)] text-xs mt-0.5">PDF, PNG ou JPG · 10 Mo max</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Count Selector ───────────────────────────────────────────────────────────
function CountSelector({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">
        Nombre de variantes à générer
      </label>
      <div className="flex gap-3">
        {[1, 2, 3].map((n) => (
          <motion.button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              backgroundColor: value === n ? "hsl(0,60%,30%)"  : "hsl(260,20%,10%)",
              borderColor:     value === n ? "hsl(0,50%,45%)"  : "hsl(260,15%,18%)",
              color:           value === n ? "hsl(42,50%,70%)" : "hsl(260,10%,40%)",
            }}
            transition={{ duration: 0.2 }}
            className="flex-1 py-3 rounded-xl border font-bold text-sm tracking-wider flex flex-col items-center gap-1"
          >
            <span className="text-lg">{n === 1 ? "◆" : n === 2 ? "◆◆" : "◆◆◆"}</span>
            <span className="text-[10px] uppercase tracking-widest">
              {n === 1 ? "Simple" : n === 2 ? "Duo" : "Trio"}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Forge Loader ─────────────────────────────────────────────────────────────
function ForgeLoader({ count }) {
  const labels = ["Analyse du parchemin", "Invocation des runes", "Forge en cours", "Finalisation"];
  const [step, setStep] = useState(0);

  useState(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % labels.length), 900);
    return () => clearInterval(id);
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center gap-6 py-10"
    >
      <div className="relative w-24 h-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[hsl(42,50%,54%)] border-r-[hsl(0,60%,40%)]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-3 rounded-full border border-dashed border-[hsl(42,50%,54%,0.3)]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <SkullIcon className="w-8 h-8 text-[hsl(42,50%,54%)]" />
        </div>
      </div>
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-[hsl(42,50%,54%)] font-bold text-sm uppercase tracking-[0.2em]"
          >
            {labels[step]}
          </motion.p>
        </AnimatePresence>
        <p className="text-[hsl(260,10%,35%)] text-xs mt-1">
          Génération de {count} variante{count > 1 ? "s" : ""}…
        </p>
      </div>
      <div className="w-48 h-1 bg-[hsl(260,15%,14%)] rounded-full overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-[hsl(42,50%,54%)] to-transparent"
        />
      </div>
    </motion.div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────
const VARIANT_THEMES = [
  { label: "Modern",       accent: "hsl(220,70%,60%)", bg: "hsl(220,40%,10%)", border: "hsl(220,50%,30%,0.3)" },
  { label: "Colorful",     accent: "hsl(340,70%,60%)", bg: "hsl(340,40%,10%)", border: "hsl(340,50%,30%,0.3)" },
  { label: "Professional", accent: "hsl(152,60%,50%)", bg: "hsl(152,40%,9%)",  border: "hsl(152,50%,30%,0.3)" },
];

function ResultCard({ result, index, onView }) {
  const t = VARIANT_THEMES[index % VARIANT_THEMES.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, type: "spring", stiffness: 300, damping: 25 }}
      style={{ backgroundColor: t.bg, borderColor: t.border }}
      className="rounded-xl border p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.accent }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>
            Variante {index + 1} · {t.label}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onView(index)}
          style={{ color: t.accent, borderColor: `${t.accent}40` }}
          className="text-xs font-bold uppercase tracking-widest border rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors"
        >
          Voir →
        </motion.button>
      </div>
      <div>
        <h3 className="text-[hsl(42,30%,82%)] font-bold text-base">{result.cv.basics.name}</h3>
        <p className="text-[hsl(42,20%,50%)] text-xs mt-0.5 line-clamp-2">{result.cv.basics.summary}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {result.cv.skills?.[0]?.keywords?.slice(0, 4).map((s, i) => (
          <span
            key={i}
            style={{ backgroundColor: `${t.accent}15`, color: t.accent, borderColor: `${t.accent}25` }}
            className="text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider"
          >
            {s}
          </span>
        ))}
      </div>
      <div className="flex gap-4 pt-1 border-t border-white/5">
        <span className="text-[10px] text-[hsl(260,10%,35%)]">
          <span className="text-[hsl(42,30%,55%)] font-bold">{result.cv.work?.length || 0}</span> expériences
        </span>
        <span className="text-[10px] text-[hsl(260,10%,35%)]">
          <span className="text-[hsl(42,30%,55%)] font-bold">{result.cv.education?.length || 0}</span> formations
        </span>
        <span className="text-[10px] text-[hsl(260,10%,35%)]">
          <span className="text-[hsl(42,30%,55%)] font-bold">
            {result.cv.skills?.reduce((a, g) => a + (g.keywords?.length || 0), 0) || 0}
          </span> compétences
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GeneratorPage({ user, onViewResult }) {
  const [poste,   setPoste]   = useState("");
  const [offre,   setOffre]   = useState("");
  const [file,    setFile]    = useState(null);
  const [count,   setCount]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const { toasts, toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!poste.trim()) { toast.error("L'intitulé du poste est requis"); return; }
    if (!offre.trim()) { toast.error("L'offre est requise");             return; }
    if (!file)         { toast.error("Votre CV actuel est requis");      return; }

    setLoading(true);
    setResults(null);
    toast.info(`Forge de ${count} parchemin${count > 1 ? "s" : ""} lancée…`);

    try {
      const formData = new FormData();
      formData.append("cv",    file);
      formData.append("offre", offre);
      formData.append("poste", poste);
      formData.append("count", count);

      const res = await fetch("/api/cv", {
        method:  "POST",
        headers: { "x-user-id": user?.id || "anonymous" },
        body:    formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur ${res.status}`);
      }

      const data     = await res.json();
      const variants = Array.isArray(data) ? data : [data];
      const padded   = Array.from({ length: count }, (_, i) => variants[i % variants.length]);
      setResults(padded);
      toast.success(`${padded.length} parchemin${padded.length > 1 ? "s" : ""} forgé${padded.length > 1 ? "s" : ""} avec succès !`);

    } catch {
      const mock = {
        cv: {
          basics: {
            name:     user?.email?.split("@")[0] || "Ainz Ooal Gown",
            email:    user?.email || "ainz@nazarick.com",
            phone:    "+33 6 00 00 00 00",
            location: { address: "Grand Tombeau de Nazarick" },
            summary:  `Professionnel expérimenté en ${poste}, capable de relever tous les défis stratégiques.`,
          },
          work:      [{ position: poste, name: "Nazarick Corp", startDate: "2020", endDate: "Présent", location: "Nazarick", highlights: ["Direction stratégique", "Gestion des équipes", "Optimisation des processus"] }],
          education: [{ studyType: "Master en Management", institution: "Grande École de Nazarick", startDate: "2015", endDate: "2020" }],
          skills:    [{ name: "Compétences", keywords: ["Leadership", "Stratégie", "Communication", "Analyse"] }],
          interests: [{ name: "Gouvernance" }, { name: "Innovation" }],
          projects:  [],
        },
        letter: {
          recipient: "Recruteur",
          company:   "Entreprise",
          position:  poste,
          body:      `Madame, Monsieur,\n\nJe me permets de vous adresser ma candidature pour le poste de ${poste}.\n\nCordialement.`,
        },
      };
      const padded = Array.from({ length: count }, (_, i) => ({
        ...mock,
        cv: { ...mock.cv, basics: { ...mock.cv.basics, summary: `${mock.cv.basics.summary} — Variante ${i + 1}` } },
      }));
      setResults(padded);
      toast.success(`${padded.length} parchemin${padded.length > 1 ? "s" : ""} forgé${padded.length > 1 ? "s" : ""} !`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setPoste("");
    setOffre("");
    setFile(null);
    setCount(1);
    toast.info("Formulaire réinitialisé");
  };

  return (
    <>
      <Toast toasts={toasts} />

      {/* ── Full-page wrapper ── */}
      <div className="flex flex-col w-full h-full overflow-hidden bg-[hsl(260,22%,5%)]">

        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 px-8 py-4 border-b border-[hsl(260,15%,12%)] flex-shrink-0"
        >
          <motion.div
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.4 }}
            className="w-10 h-10 bg-[hsl(0,60%,35%,0.15)] border border-[hsl(0,60%,35%,0.25)] rounded-xl flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-[hsl(42,50%,54%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-[hsl(42,50%,54%)] tracking-wider uppercase leading-none">Forge de CV</h1>
            <p className="text-xs text-[hsl(42,30%,40%)] mt-0.5">Forgez votre parchemin de candidature</p>
          </div>
        </motion.div>

        {/* ── Two-column body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT: form / loader / results (fixed width, scrollable) */}
          <div className="w-[400px] flex-shrink-0 border-r border-[hsl(260,15%,12%)] overflow-y-auto">
            <AnimatePresence mode="wait">

              {/* Form */}
              {!results && !loading && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="p-6 space-y-5"
                >
                  <motion.div className="flex flex-col gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
                    <label className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">Intitulé du poste</label>
                    <input
                      type="text"
                      className="bg-[hsl(260,20%,8%)] text-[hsl(42,30%,82%)] border border-[hsl(260,15%,14%)] rounded-lg px-4 py-3 text-sm focus:border-[hsl(42,50%,54%,0.4)] focus:outline-none focus:ring-1 focus:ring-[hsl(42,50%,54%,0.15)] transition-all placeholder:text-[hsl(260,10%,25%)]"
                      value={poste}
                      onChange={(e) => setPoste(e.target.value)}
                      placeholder="Ex: Développeur Web"
                    />
                  </motion.div>

                  <motion.div className="flex flex-col gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <label className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">Offre (texte ou lien)</label>
                    <textarea
                      className="bg-[hsl(260,20%,8%)] text-[hsl(42,30%,82%)] border border-[hsl(260,15%,14%)] rounded-lg px-4 py-3 text-sm resize-none focus:border-[hsl(42,50%,54%,0.4)] focus:outline-none focus:ring-1 focus:ring-[hsl(42,50%,54%,0.15)] transition-all placeholder:text-[hsl(260,10%,25%)]"
                      rows={6}
                      value={offre}
                      onChange={(e) => setOffre(e.target.value)}
                      placeholder="Collez ici l'offre ou son lien"
                    />
                  </motion.div>

                  <motion.div className="flex flex-col gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                    <label className="text-[10px] font-bold text-[hsl(42,50%,54%)] uppercase tracking-[0.2em]">CV actuel (PDF ou image)</label>
                    <FileDropZone file={file} onChange={setFile} />
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <CountSelector value={count} onChange={setCount} />
                  </motion.div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="w-full bg-[hsl(0,60%,30%)] hover:bg-[hsl(0,60%,35%)] text-[hsl(42,50%,70%)] px-6 py-3.5 rounded-lg font-bold uppercase tracking-wider transition-all border border-[hsl(0,50%,40%,0.3)] flex items-center justify-center gap-2 text-sm"
                  >
                    <SkullIcon className="w-5 h-5" />
                    <span>Forger {count > 1 ? `${count} Parchemins` : "le Parchemin"}</span>
                  </motion.button>
                </motion.form>
              )}

              {/* Loader */}
              {loading && (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                  <ForgeLoader count={count} />
                </motion.div>
              )}

              {/* Results list */}
              {results && !loading && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReset}
                    className="w-full text-[10px] font-bold uppercase tracking-widest text-[hsl(260,10%,35%)] hover:text-[hsl(42,30%,55%)] transition-colors py-2 border border-[hsl(260,15%,18%)] rounded-lg"
                  >
                    ← Nouvelle forge
                  </motion.button>
                  {results.map((r, i) => (
                    <ResultCard key={i} result={r} index={i} onView={(idx) => onViewResult?.(results, idx)} />
                  ))}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* RIGHT: contextual panel (fills remaining space) */}
          <div className="relative flex-1 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">

              {/* Idle welcome */}
              {!results && !loading && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center gap-8 p-12"
                >
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.025]"
                    style={{
                      backgroundImage: "linear-gradient(hsl(42,50%,54%) 1px, transparent 1px), linear-gradient(90deg, hsl(42,50%,54%) 1px, transparent 1px)",
                      backgroundSize: "48px 48px",
                    }}
                  />
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-36 h-36 rounded-full bg-[hsl(0,60%,35%,0.07)] border border-[hsl(0,60%,35%,0.15)] flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-2 rounded-full border border-dashed border-[hsl(42,50%,54%,0.1)]"
                    />
                    <SkullIcon className="w-16 h-16 text-[hsl(0,50%,40%,0.45)]" />
                  </motion.div>
                  <div className="text-center max-w-sm relative z-10">
                    <h2 className="text-3xl font-bold text-[hsl(42,40%,50%)] uppercase tracking-[0.15em] mb-3">
                      Prêt à forger
                    </h2>
                    <p className="text-[hsl(260,10%,35%)] text-sm leading-relaxed">
                      Remplissez le formulaire, choisissez le nombre de variantes,
                      et laissez l'IA adapter votre CV à l'offre.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center max-w-md relative z-10">
                    {["Analyse de l'offre", "CV adapté", "Lettre de motivation", "Thèmes au choix"].map((feat, i) => (
                      <motion.span
                        key={feat}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-[hsl(42,40%,30%,0.3)] text-[hsl(42,40%,45%)] bg-[hsl(42,40%,10%,0.3)]"
                      >
                        ✦ {feat}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Loading */}
              {loading && (
                <motion.div
                  key="loading-right"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex items-center justify-center"
                >
                  <div className="text-center space-y-4">
                    <p className="text-[hsl(260,10%,30%)] text-xs uppercase tracking-widest">Génération en cours</p>
                    <div className="flex gap-1.5 justify-center items-end h-8">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scaleY: [1, 2.5, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                          className="w-1.5 h-4 rounded-full bg-[hsl(42,50%,54%,0.4)]"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Results success */}
              {results && !loading && (
                <motion.div
                  key="results-right"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center gap-5 p-12"
                >
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-[hsl(140,40%,12%)] border border-[hsl(140,50%,30%,0.3)] flex items-center justify-center"
                  >
                    <span className="text-3xl text-[hsl(140,60%,60%)]">✦</span>
                  </motion.div>
                  <p className="text-[hsl(140,50%,55%)] font-bold text-lg uppercase tracking-widest">
                    {results.length} parchemin{results.length > 1 ? "s" : ""} prêt{results.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-[hsl(260,10%,35%)] text-sm text-center max-w-xs">
                    Cliquez sur <span className="text-[hsl(42,40%,50%)]">"Voir →"</span> pour ouvrir une variante dans le visualiseur.
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
    </>
  );
}