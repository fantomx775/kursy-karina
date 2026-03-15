// Responsive Design System Utilities
// Breakpoint definitions matching Tailwind CSS defaults

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Responsive value helpers
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// Media query helpers
export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
} as const;

// Utility functions for responsive design
export const getResponsiveValue = <T>(
  value: ResponsiveValue<T>,
  breakpoint?: Breakpoint
): T => {
  if (typeof value === 'object' && value !== null) {
    const valueObj = value as Partial<Record<Breakpoint, T>>;
    if (breakpoint && breakpoint in valueObj) {
      return valueObj[breakpoint] as T;
    }
    // Return the smallest defined value or first available
    const orderedBreakpoints: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl'];
    for (const bp of orderedBreakpoints) {
      if (bp in valueObj) {
        return valueObj[bp] as T;
      }
    }
    // Fallback to any available value
    return Object.values(valueObj)[0] as T;
  }
  return value;
};

// Container max-width utilities
export const containerMaxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const;

export type ContainerMaxWidth = keyof typeof containerMaxWidths;

// Grid system utilities
export const gridColumns = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
} as const;

export const responsiveGridColumns = {
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    6: 'sm:grid-cols-6',
    12: 'sm:grid-cols-12',
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    6: 'md:grid-cols-6',
    12: 'md:grid-cols-12',
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    6: 'lg:grid-cols-6',
    12: 'lg:grid-cols-12',
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    6: 'xl:grid-cols-6',
    12: 'xl:grid-cols-12',
  },
} as const;

// Spacing utilities
export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const;

export type SpacingValue = keyof typeof spacing;

// Typography scale utilities
export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  '5xl': ['3rem', { lineHeight: '1' }],
  '6xl': ['3.75rem', { lineHeight: '1' }],
  '7xl': ['4.5rem', { lineHeight: '1' }],
  '8xl': ['6rem', { lineHeight: '1' }],
  '9xl': ['8rem', { lineHeight: '1' }],
} as const;

export type FontSize = keyof typeof fontSize;

// Helper function to generate responsive classes
export const responsive = <T extends Record<string, string>>(
  values: ResponsiveValue<T>,
  getClass: (value: T) => string
): string => {
  if (typeof values === 'object' && values !== null) {
    const valueObj = values as Partial<Record<Breakpoint, T>>;
    const classes: string[] = [];
    
    // Base value (mobile-first)
    const baseValue = Object.values(valueObj)[0];
    if (baseValue) {
      classes.push(getClass(baseValue));
    }
    
    // Responsive values
    (Object.keys(valueObj) as Breakpoint[]).forEach((breakpoint) => {
      const value = valueObj[breakpoint];
      if (value && breakpoint !== 'sm') { // sm is base in mobile-first
        classes.push(`${breakpoint}:${getClass(value)}`);
      }
    });
    
    return classes.join(' ');
  }
  
  return getClass(values as T);
};
