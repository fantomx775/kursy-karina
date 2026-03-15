// Animation utilities and constants

import React, { useState, useEffect } from 'react';

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
} as const;

export const ANIMATION_EASING = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const TRANSITION_TYPES = {
  fade: 'opacity',
  slide: 'transform',
  scale: 'transform',
  all: 'all',
} as const;

// Animation classes generator
export const getTransitionClasses = (
  type: keyof typeof TRANSITION_TYPES = 'all',
  duration: keyof typeof ANIMATION_DURATION = 'normal',
  easing: keyof typeof ANIMATION_EASING = 'easeInOut'
) => {
  return `transition-${TRANSITION_TYPES[type]} duration-${ANIMATION_DURATION[duration]} ${ANIMATION_EASING[easing]}`;
};

// Fade animations
export const fadeClasses = {
  in: 'opacity-100',
  out: 'opacity-0',
  entering: 'opacity-0',
  entered: 'opacity-100',
  exiting: 'opacity-0',
};

// Slide animations
export const slideClasses = {
  in: 'translate-x-0',
  out: 'translate-x-full',
  entering: 'translate-x-full',
  entered: 'translate-x-0',
  exiting: 'translate-x-full',
  up: {
    in: 'translate-y-0',
    out: '-translate-y-full',
    entering: '-translate-y-full',
    entered: 'translate-y-0',
    exiting: '-translate-y-full',
  },
  down: {
    in: 'translate-y-0',
    out: 'translate-y-full',
    entering: 'translate-y-full',
    entered: 'translate-y-0',
    exiting: 'translate-y-full',
  },
  left: {
    in: 'translate-x-0',
    out: '-translate-x-full',
    entering: '-translate-x-full',
    entered: 'translate-x-0',
    exiting: '-translate-x-full',
  },
  right: {
    in: 'translate-x-0',
    out: 'translate-x-full',
    entering: 'translate-x-full',
    entered: 'translate-x-0',
    exiting: 'translate-x-full',
  },
};

// Scale animations
export const scaleClasses = {
  in: 'scale-100',
  out: 'scale-95',
  entering: 'scale-95',
  entered: 'scale-100',
  exiting: 'scale-95',
};

// Keyframe animations
export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideInRight: {
    from: { transform: 'translateX(100%)' },
    to: { transform: 'translateX(0)' },
  },
  slideInLeft: {
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(0)' },
  },
  slideInUp: {
    from: { transform: 'translateY(100%)' },
    to: { transform: 'translateY(0)' },
  },
  slideInDown: {
    from: { transform: 'translateY(-100%)' },
    to: { transform: 'translateY(0)' },
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  bounce: {
    '0%, 20%, 53%, 80%, 100%': {
      transform: 'translate3d(0, 0, 0)',
    },
    '40%, 43%': {
      transform: 'translate3d(0, -30px, 0)',
    },
    '70%': {
      transform: 'translate3d(0, -15px, 0)',
    },
    '90%': {
      transform: 'translate3d(0, -4px, 0)',
    },
  },
  pulse: {
    '0%': {
      transform: 'scale3d(1, 1, 1)',
    },
    '50%': {
      transform: 'scale3d(1.05, 1.05, 1)',
    },
    '100%': {
      transform: 'scale3d(1, 1, 1)',
    },
  },
  spin: {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
} as const;

// Animation utility functions
export const createAnimation = (
  keyframes: Record<string, React.CSSProperties>,
  options: {
    duration?: number;
    easing?: string;
    fill?: 'forwards' | 'backwards' | 'both' | 'none';
    iteration?: number | 'infinite';
  } = {}
) => {
  const {
    duration = ANIMATION_DURATION.normal,
    easing = ANIMATION_EASING.easeInOut,
    fill = 'both',
    iteration = 1,
  } = options;

  return {
    animation: `${Object.keys(keyframes).map(key => {
      const props = keyframes[key];
      return `${key} ${Object.entries(props).map(([prop, value]) => `${prop}: ${value}`).join('; ')}`;
    }).join(', ')} ${duration}ms ${easing} ${iteration} ${fill}`,
  };
};

// Spring animation
export const springAnimation = (
  to: React.CSSProperties,
  from?: React.CSSProperties,
  config: {
    tension?: number;
    friction?: number;
    mass?: number;
  } = {}
) => {
  const { tension = 170, friction = 26, mass = 1 } = config;
  
  return {
    transition: `all ${ANIMATION_DURATION.normal}ms cubic-bezier(${0.25}, ${0.46}, ${0.45}, ${0.94})`,
    ...to,
  };
};

// Stagger animation for lists
export const staggerAnimation = (
  index: number,
  baseDelay: number = 50
) => ({
  animationDelay: `${index * baseDelay}ms`,
});

// Intersection Observer for scroll animations
export const useScrollAnimation = (
  threshold: number = 0.1,
  rootMargin: string = '0px',
  animationClass: string = 'animate-fade-in'
) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            ref.classList.add(animationClass);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold, rootMargin, animationClass]);

  return { ref: setRef, isVisible };
};

// Reduced motion preferences
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    setPrefersReducedMotion(mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};

// Animation variants
export const animationVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: ANIMATION_DURATION.fast },
  },
  slide: {
    initial: { x: 100 },
    animate: { x: 0 },
    exit: { x: -100 },
    transition: { duration: ANIMATION_DURATION.normal },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: ANIMATION_DURATION.normal },
  },
  bounce: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { 
      duration: ANIMATION_DURATION.slow,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },
} as const;
