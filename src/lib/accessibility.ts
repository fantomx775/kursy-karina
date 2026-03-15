// Accessibility utilities and constants

export const ARIA_ROLES = {
  button: 'button',
  link: 'link',
  navigation: 'navigation',
  main: 'main',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  search: 'search',
  form: 'form',
  dialog: 'dialog',
  alert: 'alert',
  status: 'status',
  timer: 'timer',
  scrollbar: 'scrollbar',
  switch: 'switch',
  checkbox: 'checkbox',
  radio: 'radio',
  radiogroup: 'radiogroup',
  textbox: 'textbox',
  listbox: 'listbox',
  option: 'option',
  combobox: 'combobox',
  menu: 'menu',
  menubar: 'menubar',
  menuitem: 'menuitem',
  tooltip: 'tooltip',
  tab: 'tab',
  tablist: 'tablist',
  tabpanel: 'tabpanel',
} as const;

export const ARIA_PROPERTIES = {
  label: 'aria-label',
  labelledby: 'aria-labelledby',
  describedby: 'aria-describedby',
  expanded: 'aria-expanded',
  selected: 'aria-selected',
  checked: 'aria-checked',
  disabled: 'aria-disabled',
  required: 'aria-required',
  invalid: 'aria-invalid',
  hidden: 'aria-hidden',
  live: 'aria-live',
  atomic: 'aria-atomic',
  relevant: 'aria-relevant',
  busy: 'aria-busy',
} as const;

export const ARIA_STATES = {
  pressed: 'aria-pressed',
  grabbed: 'aria-grabbed',
  dropeffect: 'aria-dropeffect',
  dragenter: 'aria-dragenter',
  dragleave: 'aria-dragleave',
  flowto: 'aria-flowto',
  haspopup: 'aria-haspopup',
  activedescendant: 'aria-activedescendant',
  level: 'aria-level',
  posinset: 'aria-posinset',
  setsize: 'aria-setsize',
} as const;

// Keyboard navigation utilities
export const KEY_CODES = {
  TAB: 9,
  ENTER: 13,
  SPACE: 32,
  ESCAPE: 27,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  HOME: 36,
  END: 35,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
} as const;

export const KEY_NAMES = {
  [KEY_CODES.TAB]: 'Tab',
  [KEY_CODES.ENTER]: 'Enter',
  [KEY_CODES.SPACE]: 'Space',
  [KEY_CODES.ESCAPE]: 'Escape',
  [KEY_CODES.ARROW_UP]: 'ArrowUp',
  [KEY_CODES.ARROW_DOWN]: 'ArrowDown',
  [KEY_CODES.ARROW_LEFT]: 'ArrowLeft',
  [KEY_CODES.ARROW_RIGHT]: 'ArrowRight',
  [KEY_CODES.HOME]: 'Home',
  [KEY_CODES.END]: 'End',
  [KEY_CODES.PAGE_UP]: 'PageUp',
  [KEY_CODES.PAGE_DOWN]: 'PageDown',
} as const;

// Focus management utilities
export const focusableElementsSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

export const getFocusableElements = (container: Element) => {
  return container.querySelectorAll(focusableElementsSelector);
};

export const trapFocus = (container: HTMLElement) => {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement is made
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

export const getWCAGContrastLevel = (contrastRatio: number): 'AAA' | 'AA' | 'fail' => {
  if (contrastRatio >= 7) return 'AAA';
  if (contrastRatio >= 4.5) return 'AA';
  return 'fail';
};

// Helper functions
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};

const getRelativeLuminance = (rgb: { r: number; g: number; b: number }): number => {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Skip links utility
export const addSkipLinks = () => {
  const skipLinks = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#search', text: 'Skip to search' },
  ];

  const existingSkipLinks = document.querySelector('.skip-links');
  if (existingSkipLinks) return;

  const skipLinksContainer = document.createElement('div');
  skipLinksContainer.className = 'skip-links';
  skipLinksContainer.setAttribute('role', 'navigation');
  skipLinksContainer.setAttribute('aria-label', 'Skip links');

  skipLinks.forEach(link => {
    const skipLink = document.createElement('a');
    skipLink.href = link.href;
    skipLink.textContent = link.text;
    skipLink.className = 'skip-link';
    skipLink.setAttribute('role', 'menuitem');
    
    skipLinksContainer.appendChild(skipLink);
  });

  document.body.insertBefore(skipLinksContainer, document.body.firstChild);
};

// Reduced motion utilities
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const addReducedMotionStyles = () => {
  if (prefersReducedMotion()) {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }
};

// Focus visible utility
export const addFocusVisibleStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .focus-visible {
      outline: 2px solid var(--coffee-mocha);
      outline-offset: 2px;
    }
    
    .js-focus-visible :focus {
      outline: 2px solid var(--coffee-mocha);
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
};

// Keyboard navigation patterns
export const createKeyboardNavigation = (
  items: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical';
    loop?: boolean;
  } = {}
) => {
  const { orientation = 'vertical', loop = true } = options;
  let currentIndex = 0;

  const handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    
    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        if (orientation === 'vertical' || key === 'ArrowRight') {
          event.preventDefault();
          currentIndex = (currentIndex + 1) % items.length;
          items[currentIndex]?.focus();
        }
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        if (orientation === 'vertical' || key === 'ArrowLeft') {
          event.preventDefault();
          currentIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          items[currentIndex]?.focus();
        }
        break;
        
      case 'Home':
        event.preventDefault();
        currentIndex = 0;
        items[currentIndex]?.focus();
        break;
        
      case 'End':
        event.preventDefault();
        currentIndex = items.length - 1;
        items[currentIndex]?.focus();
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        items[currentIndex]?.click();
        break;
    }
  };

  return handleKeyDown;
};

// Accessibility testing utilities
export const runAccessibilityAudit = (container: Element) => {
  const issues: string[] = [];
  
  // Check for missing alt text
  const images = container.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.alt) {
      issues.push(`Image ${index + 1}: Missing alt text`);
    }
  });
  
  // Check for missing labels
  const inputs = container.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const hasLabel = input.id && document.querySelector(`label[for="${input.id}"]`);
    const hasAriaLabel = input.getAttribute('aria-label');
    const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push(`Input ${index + 1}: Missing label or aria-label`);
    }
  });
  
  // Check for proper heading structure
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const previousLevels: number[] = [];
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    
    if (index > 0 && level > previousLevels[previousLevels.length - 1] + 1) {
      issues.push(`Heading ${index + 1}: Skipped heading level (h${level} after h${previousLevels[previousLevels.length - 1]})`);
    }
    
    previousLevels.push(level);
  });
  
  return issues;
};
