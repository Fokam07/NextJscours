// Thème Overlord inspiré d'Ainz Ooal Gown et du Grand Tombeau de Nazarick
// Palette professionnelle avec des touches de mystère et de puissance

export const overlordTheme = {
  // Couleurs principales
  colors: {
    // Noir profond de Nazarick
    nazarick: {
      900: 'hsl(260, 25%, 7%)',   // Noir le plus profond
      800: 'hsl(260, 20%, 10%)',  // Noir moyen
      700: 'hsl(260, 15%, 14%)',  // Noir clair
      600: 'hsl(260, 10%, 18%)',  // Gris très foncé
    },
    
    // Or d'Ainz Ooal Gown
    gold: {
      500: 'hsl(42, 50%, 54%)',   // Or principal
      400: 'hsl(42, 45%, 60%)',   // Or clair
      300: 'hsl(42, 40%, 70%)',   // Or très clair
      200: 'hsl(42, 35%, 82%)',   // Or pastel
      100: 'hsl(42, 30%, 90%)',   // Or très pâle
    },
    
    // Rouge sang/puissance
    blood: {
      600: 'hsl(0, 60%, 35%)',    // Rouge sang principal
      500: 'hsl(0, 60%, 40%)',    // Rouge moyen
      400: 'hsl(0, 55%, 50%)',    // Rouge vif
      300: 'hsl(0, 50%, 60%)',    // Rouge clair
    },
    
    // Vert émeraude (yeux d'Ainz)
    emerald: {
      500: 'hsl(142, 76%, 36%)',  // Vert principal
      400: 'hsl(142, 70%, 45%)',  // Vert clair
      300: 'hsl(142, 65%, 55%)',  // Vert très clair
    },
    
    // Violet mystique
    mystic: {
      600: 'hsl(270, 50%, 40%)',  // Violet foncé
      500: 'hsl(270, 50%, 50%)',  // Violet moyen
      400: 'hsl(270, 45%, 60%)',  // Violet clair
    },
  },
  
  // Gradients
  gradients: {
    primary: 'from-[hsl(260,25%,7%)] to-[hsl(260,20%,10%)]',
    gold: 'from-[hsl(42,50%,54%)] to-[hsl(42,45%,60%)]',
    blood: 'from-[hsl(0,60%,35%)] to-[hsl(0,60%,40%)]',
    mystic: 'from-[hsl(270,50%,40%)] to-[hsl(270,50%,50%)]',
    nazarick: 'from-[hsl(260,25%,7%)] via-[hsl(260,20%,10%)] to-[hsl(0,60%,35%,0.1)]',
  },
  
  // Borders
  borders: {
    subtle: 'border-[hsl(260,15%,14%)]',
    gold: 'border-[hsl(42,50%,54%,0.25)]',
    blood: 'border-[hsl(0,60%,35%,0.3)]',
    glow: 'border-[hsl(42,50%,54%,0.3)]',
  },
  
  // Backgrounds
  backgrounds: {
    primary: 'bg-[hsl(260,25%,7%)]',
    secondary: 'bg-[hsl(260,20%,8%)]',
    card: 'bg-[hsl(260,20%,10%)]',
    hover: 'hover:bg-[hsl(260,15%,14%)]',
    gold: 'bg-[hsl(42,50%,54%,0.08)]',
    blood: 'bg-[hsl(0,60%,35%,0.1)]',
  },
  
  // Text colors
  text: {
    primary: 'text-[hsl(42,30%,82%)]',     // Texte principal or pâle
    secondary: 'text-[hsl(42,30%,65%)]',   // Texte secondaire
    muted: 'text-[hsl(260,10%,35%)]',      // Texte atténué
    gold: 'text-[hsl(42,50%,54%)]',        // Texte or
    blood: 'text-[hsl(0,50%,60%)]',        // Texte rouge
    emerald: 'text-[hsl(142,70%,45%)]',    // Texte vert
  },
  
  // Shadows
  shadows: {
    gold: 'shadow-[0_0_20px_rgba(212,175,55,0.15)]',
    blood: 'shadow-[0_0_15px_rgba(139,0,0,0.2)]',
    card: 'shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
  },
  
  // Effects
  effects: {
    glowGold: 'drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]',
    glowBlood: 'drop-shadow-[0_0_8px_rgba(139,0,0,0.4)]',
    glowEmerald: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]',
  },
};

// Classes utilitaires pour les composants
export const overlordClasses = {
  // Boutons
  button: {
    primary: `
      bg-gradient-to-r from-[hsl(0,60%,30%)] to-[hsl(0,60%,35%)]
      hover:from-[hsl(0,60%,35%)] hover:to-[hsl(0,60%,40%)]
      text-[hsl(42,50%,70%)] font-bold uppercase tracking-wider
      border border-[hsl(0,50%,40%,0.3)]
      transition-all active:scale-[0.98]
      shadow-[0_0_15px_rgba(139,0,0,0.2)]
    `,
    secondary: `
      bg-[hsl(260,20%,8%)] hover:bg-[hsl(260,15%,14%)]
      text-[hsl(42,30%,82%)] font-semibold
      border border-[hsl(260,15%,14%)]
      transition-all
    `,
    gold: `
      bg-[hsl(42,50%,54%,0.08)] hover:bg-[hsl(42,50%,54%,0.15)]
      text-[hsl(42,50%,54%)] font-bold uppercase tracking-wider
      border border-[hsl(42,50%,54%,0.2)]
      transition-all
    `,
  },
  
  // Cards
  card: {
    default: `
      bg-[hsl(260,25%,7%)] rounded-xl
      border border-[hsl(260,15%,14%)]
      shadow-[0_4px_20px_rgba(0,0,0,0.4)]
    `,
    hover: `
      bg-[hsl(260,25%,7%)] rounded-xl
      border border-[hsl(260,15%,14%)]
      hover:border-[hsl(42,50%,54%,0.3)]
      transition-all
      shadow-[0_4px_20px_rgba(0,0,0,0.4)]
      hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]
    `,
  },
  
  // Inputs
  input: {
    default: `
      bg-[hsl(260,20%,8%)] text-[hsl(42,30%,82%)]
      border border-[hsl(260,15%,14%)]
      rounded-lg px-4 py-3
      focus:border-[hsl(42,50%,54%,0.3)]
      focus:outline-none focus:ring-1 focus:ring-[hsl(42,50%,54%,0.15)]
      transition-all
      placeholder:text-[hsl(260,10%,25%)]
    `,
  },
  
  // Labels
  label: {
    default: `
      text-[10px] font-bold text-[hsl(42,50%,54%)]
      uppercase tracking-[0.2em]
    `,
  },
  
  // Tags
  tag: {
    gold: `
      px-2 py-1 bg-[hsl(42,50%,54%,0.1)]
      text-[hsl(42,50%,54%)]
      border border-[hsl(42,50%,54%,0.2)]
      rounded font-bold uppercase tracking-wider
      text-[10px]
    `,
    blood: `
      px-2 py-1 bg-[hsl(0,60%,35%,0.1)]
      text-[hsl(0,50%,60%)]
      border border-[hsl(0,60%,35%,0.2)]
      rounded font-bold uppercase tracking-wider
      text-[10px]
    `,
  },
  
  // Dividers
  divider: {
    gold: 'h-[1px] bg-[hsl(42,50%,54%,0.3)]',
    subtle: 'h-[1px] bg-[hsl(260,15%,14%)]',
  },
};

// Animations personnalisées
export const overlordAnimations = {
  fadeIn: {
    keyframes: `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
    class: 'animate-fadeIn',
  },
  
  glowPulse: {
    keyframes: `
      @keyframes glowPulse {
        0%, 100% { box-shadow: 0 0 20px rgba(212,175,55,0.2); }
        50% { box-shadow: 0 0 30px rgba(212,175,55,0.4); }
      }
    `,
    class: 'animate-glowPulse',
  },
  
  bloodPulse: {
    keyframes: `
      @keyframes bloodPulse {
        0%, 100% { box-shadow: 0 0 15px rgba(139,0,0,0.2); }
        50% { box-shadow: 0 0 25px rgba(139,0,0,0.4); }
      }
    `,
    class: 'animate-bloodPulse',
  },
};

export default overlordTheme;