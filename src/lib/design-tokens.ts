/**
 * Design Tokens for Kursy App
 * Centralized design system values
 */

export const designTokens = {
  // Colors
  colors: {
    // Primary coffee palette
    coffeeCream: 'var(--coffee-cream)',
    coffeeLatte: 'var(--coffee-latte)',
    coffeeCappuccino: 'var(--coffee-cappuccino)',
    coffeeMacchiato: 'var(--coffee-macchiato)',
    coffeeMocha: 'var(--coffee-mocha)',
    coffeeEspresso: 'var(--coffee-espresso)',
    coffeeDark: 'var(--coffee-dark)',
    coffeeCharcoal: 'var(--coffee-charcoal)',
    
    // Neutral grays
    neutralLight: 'var(--neutral-light)',
    neutralMedium: 'var(--neutral-medium)',
    neutralDark: 'var(--neutral-dark)',
    
    // System colors
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    
    // Semantic colors (to be defined)
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
    info: 'var(--info)',
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
    fontSize: {
      xs: 'var(--text-xs)',
      sm: 'var(--text-sm)',
      base: 'var(--text-base)',
      lg: 'var(--text-lg)',
      xl: 'var(--text-xl)',
      '2xl': 'var(--text-2xl)',
      '3xl': 'var(--text-3xl)',
      '4xl': 'var(--text-4xl)',
    },
    fontWeight: {
      light: 'var(--font-weight-light)',
      normal: 'var(--font-weight-normal)',
      medium: 'var(--font-weight-medium)',
      semibold: 'var(--font-weight-semibold)',
      bold: 'var(--font-weight-bold)',
    },
    lineHeight: {
      tight: 'var(--leading-tight)',
      normal: 'var(--leading-normal)',
      relaxed: 'var(--leading-relaxed)',
    },
  },
  
  // Spacing
  spacing: {
    0: 'var(--space-0)',
    1: 'var(--space-1)', // 4px
    2: 'var(--space-2)', // 8px
    3: 'var(--space-3)', // 12px
    4: 'var(--space-4)', // 16px
    5: 'var(--space-5)', // 20px
    6: 'var(--space-6)', // 24px
    8: 'var(--space-8)', // 32px
    10: 'var(--space-10)', // 40px
    12: 'var(--space-12)', // 48px
    16: 'var(--space-16)', // 64px
    20: 'var(--space-20)', // 80px
  },
  
  // Border radius
  borderRadius: {
    none: 'var(--border-radius)',
    sm: 'var(--border-radius-sm)',
    md: 'var(--border-radius-md)',
    lg: 'var(--border-radius-lg)',
    full: 'var(--border-radius-full)',
  },
  
  // Transitions
  transitions: {
    duration: {
      fast: 'var(--transition-fast)',
      normal: 'var(--transition-normal)',
      slow: 'var(--transition-slow)',
    },
    easing: {
      linear: 'var(--ease-linear)',
      easeIn: 'var(--ease-in)',
      easeOut: 'var(--ease-out)',
      easeInOut: 'var(--ease-in-out)',
    },
  },
  
  // Shadows
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  },
  
  // Z-index
  zIndex: {
    base: 'var(--z-base)',
    dropdown: 'var(--z-dropdown)',
    sticky: 'var(--z-sticky)',
    fixed: 'var(--z-fixed)',
    modal: 'var(--z-modal)',
    popover: 'var(--z-popover)',
    tooltip: 'var(--z-tooltip)',
  },
} as const;

// Type definitions
export type DesignToken = typeof designTokens;
export type ColorToken = DesignToken['colors'];
export type SpacingToken = DesignToken['spacing'];
export type BorderRadiusToken = DesignToken['borderRadius'];
