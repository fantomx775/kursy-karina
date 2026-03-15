// Component variants system for dynamic theming

export interface ComponentVariant {
  name: string;
  styles: Record<string, string>;
  props?: Record<string, any>;
}

export interface VariantSystem {
  [componentName: string]: {
    [variantName: string]: ComponentVariant;
  };
}

export interface ThemeVariants {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    neutral: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  typography: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Default theme variants
export const defaultTheme: ThemeVariants = {
  colors: {
    primary: 'var(--coffee-mocha)',
    secondary: 'var(--coffee-macchiato)',
    accent: 'var(--coffee-cinnamon)',
    success: 'var(--success-green, #10b981)',
    warning: 'var(--warning-yellow, #f59e0b)',
    error: 'var(--error-red, #ef4444)',
    info: 'var(--info-blue, #3b82f6)',
    neutral: 'var(--coffee-cappuccino)',
  },
  spacing: {
    xs: 'var(--spacing-xs, 0.25rem)',
    sm: 'var(--spacing-sm, 0.5rem)',
    md: 'var(--spacing-md, 1rem)',
    lg: 'var(--spacing-lg, 1.5rem)',
    xl: 'var(--spacing-xl, 2rem)',
    '2xl': 'var(--spacing-2xl, 3rem)',
  },
  typography: {
    xs: 'var(--text-xs, 0.75rem)',
    sm: 'var(--text-sm, 0.875rem)',
    md: 'var(--text-md, 1rem)',
    lg: 'var(--text-lg, 1.125rem)',
    xl: 'var(--text-xl, 1.25rem)',
    '2xl': 'var(--text-2xl, 1.5rem)',
    '3xl': 'var(--text-3xl, 1.875rem)',
    '4xl': 'var(--text-4xl, 2.25rem)',
  },
  borderRadius: {
    none: 'var(--radius-none, 0)',
    sm: 'var(--radius-sm, 0.125rem)',
    md: 'var(--radius-md, 0.25rem)',
    lg: 'var(--radius-lg, 0.5rem)',
    xl: 'var(--radius-xl, 1rem)',
    full: 'var(--radius-full, 9999px)',
  },
  shadows: {
    sm: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
    md: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.07))',
    lg: 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))',
    xl: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.15))',
  },
};

// Dark theme variants
export const darkTheme: ThemeVariants = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: 'var(--coffee-cream)',
    secondary: 'var(--coffee-latte)',
    accent: 'var(--coffee-cinnamon)',
    success: 'var(--success-green, #34d399)',
    warning: 'var(--warning-yellow, #fbbf24)',
    error: 'var(--error-red, #f87171)',
    info: 'var(--info-blue, #60a5fa)',
    neutral: 'var(--coffee-mocha)',
  },
  shadows: {
    sm: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.25))',
    md: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.3))',
    lg: 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.4))',
    xl: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.5))',
  },
};

// Variant utility functions
export const createVariant = (
  base: string,
  variants: Record<string, string>,
  defaultVariant: string = 'default'
) => {
  return (variant: string = defaultVariant, props: Record<string, any> = {}) => {
    const variantStyles = variants[variant] || variants[defaultVariant];
    const classes: string[] = [base];
    
    // Add variant-specific classes
    if (variantStyles) {
      classes.push(variantStyles);
    }
    
    // Add conditional classes based on props
    Object.entries(props).forEach(([key, value]) => {
      if (value === true) {
        classes.push(key);
      } else if (typeof value === 'string' && value) {
        classes.push(`${key}-${value}`);
      }
    });
    
    return classes.join(' ');
  };
};

export const createCompoundVariant = (
  variants: {
    size?: Record<string, string>;
    color?: Record<string, string>;
    variant?: Record<string, string>;
  },
  defaults: {
    size?: string;
    color?: string;
    variant?: string;
  } = {}
) => {
  return (props: Record<string, any>) => {
    const classes = [];
    
    // Size variants
    if (variants.size) {
      const sizeVariant = variants.size[props.size || defaults.size || 'md'];
      if (sizeVariant) classes.push(sizeVariant);
    }
    
    // Color variants
    if (variants.color) {
      const colorVariant = variants.color[props.color || defaults.color || 'primary'];
      if (colorVariant) classes.push(colorVariant);
    }
    
    // Style variants
    if (variants.variant) {
      const styleVariant = variants.variant[props.variant || defaults.variant || 'default'];
      if (styleVariant) classes.push(styleVariant);
    }
    
    return classes.join(' ');
  };
};

// Responsive variant utilities
export const createResponsiveVariant = (
  base: string,
  variants: Record<string, Record<string, string>>,
  breakpoints: string[] = ['sm', 'md', 'lg', 'xl']
) => {
  return (props: Record<string, any>) => {
    const classes = [base];
    
    breakpoints.forEach((breakpoint) => {
      const breakpointVariants = variants[breakpoint];
      if (breakpointVariants) {
        const variant = breakpointVariants[props[breakpoint]];
        if (variant) {
          classes.push(`${breakpoint}:${variant}`);
        }
      }
    });
    
    return classes.join(' ');
  };
};

// Component-specific variant definitions
export const buttonVariants = {
  size: {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  },
  variant: {
    primary: 'bg-[var(--coffee-mocha)] text-white hover:bg-[var(--coffee-charcoal)]',
    secondary: 'bg-[var(--coffee-cream)] text-[var(--coffee-mocha)] hover:bg-[var(--coffee-cappuccino)]',
    outline: 'border-2 border-[var(--coffee-mocha)] text-[var(--coffee-mocha)] hover:bg-[var(--coffee-cream)]',
    ghost: 'text-[var(--coffee-mocha)] hover:bg-[var(--coffee-cream)]',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  },
  fullWidth: {
    true: 'w-full',
    false: 'w-auto',
  },
};

export const inputVariants = {
  size: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  },
  state: {
    default: 'border-[var(--coffee-cappuccino)] focus:border-[var(--coffee-mocha)]',
    error: 'border-red-500 focus:border-red-500',
    success: 'border-green-500 focus:border-green-500',
  },
  disabled: {
    true: 'opacity-50 cursor-not-allowed',
    false: 'opacity-100 cursor-auto',
  },
};

export const cardVariants = {
  variant: {
    default: 'bg-white border-[var(--coffee-cappuccino)] shadow-md',
    elevated: 'bg-white border-[var(--coffee-cappuccino)] shadow-lg',
    outlined: 'bg-white border-2 border-[var(--coffee-mocha)]',
    filled: 'bg-[var(--coffee-cream)] border-[var(--coffee-cappuccino)]',
  },
  size: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  },
  interactive: {
    true: 'hover:shadow-lg transition-shadow duration-200 cursor-pointer',
    false: '',
  },
};

// Theme context utilities
export const getThemeValue = (path: string, theme: ThemeVariants = defaultTheme): string => {
  const keys = path.split('.');
  let value: any = theme;
  
  for (const key of keys) {
    value = value[key];
  }
  
  return value || '';
};

export const applyTheme = (theme: ThemeVariants) => {
  const root = document.documentElement;
  
  // Apply CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });
  
  Object.entries(theme.typography).forEach(([key, value]) => {
    root.style.setProperty(`--text-${key}`, value);
  });
  
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });
  
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });
  
  // Update theme class
  root.classList.remove('light', 'dark');
  root.classList.add(theme === darkTheme ? 'dark' : 'light');
};

// Variant generator for dynamic component styling
export const generateComponentClasses = (
  component: string,
  props: Record<string, any>,
  theme: ThemeVariants = defaultTheme
) => {
  const variantMap: VariantSystem = {
    button: {
      primary: {
        name: 'primary',
        styles: {
          backgroundColor: theme.colors.primary,
          color: 'white',
          borderColor: theme.colors.primary,
        },
        props: { hover: true, focus: true },
      },
      secondary: {
        name: 'secondary',
        styles: {
          backgroundColor: theme.colors.secondary,
          color: theme.colors.primary,
          borderColor: theme.colors.secondary,
        },
        props: { hover: true, focus: true },
      },
    },
    input: {
      default: {
        name: 'default',
        styles: {
          borderColor: theme.colors.neutral,
          backgroundColor: 'white',
          color: theme.colors.primary,
        },
        props: { focus: true },
      },
      error: {
        name: 'error',
        styles: {
          borderColor: theme.colors.error,
          backgroundColor: 'white',
          color: theme.colors.error,
        },
        props: { focus: true },
      },
    },
  };
  
  const componentVariants = variantMap[component];
  if (!componentVariants) return '';
  
  const variant = props.variant || 'default';
  const variantConfig = componentVariants[variant];
  
  if (!variantConfig) return '';
  
  let classes: string[] = [];
  
  // Apply base styles
  Object.entries(variantConfig.styles).forEach(([property, value]) => {
    const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
    classes.push(`${cssProperty}: ${value}`);
  });
  
  // Apply conditional props
  Object.entries(variantConfig.props || {}).forEach(([prop, enabled]) => {
    if (enabled && props[prop]) {
      classes.push(`${prop}-${props[prop]}`);
    }
  });
  
  return classes.join('; ');
};
