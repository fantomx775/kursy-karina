// Performance optimization utilities
import React, { useState, useCallback, useEffect } from 'react';

// Bundle size optimization
export const optimizeImages = (imageUrls: string[]) => {
  return imageUrls.map(url => {
    // Convert to WebP format for better compression
    return url.replace(/\.(jpg|jpeg|png|gif|webp)$/, '.webp');
  });
};

// Memoization utilities
export const useMemo = <T>(factory: () => T, deps: React.DependencyList) => {
  return React.useMemo(factory, deps);
};

export const useCallbackCustom = <T extends (...args: any[]) => any>(
  fn: T,
  deps: React.DependencyList
) => {
  return React.useCallback(fn, deps);
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
) => {
  let lastCallTime = 0;
  
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCallTime >= delay) {
      func(...args);
      lastCallTime = now;
    }
  };
};

// Intersection Observer for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      });
    },
    options
  );

  useEffect(() => {
    const elements = document.querySelectorAll('[data-observe]');
    
    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      elements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [observer]);

  return { isIntersecting, setIsIntersecting };
};

// Virtual scrolling optimization
export const useVirtualScroll = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  overscan?: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount - 1, itemCount - 1);
  
  const visibleItems = endIndex - startIndex + 1;
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    const scrollDiff = newScrollTop - scrollTop;
    
    if (scrollDiff > 0) {
      const newIndex = Math.min(
        startIndex + Math.floor(scrollDiff / itemHeight) + 1,
        itemCount - 1
      );
      
      if (newIndex !== startIndex) {
        setStartIndex(newIndex);
        setScrollTop(newScrollTop);
      }
    }
  }, [scrollTop, itemHeight, containerHeight, startIndex]);
  
  return {
    startIndex,
    visibleItems,
    scrollProps: {
      onScroll: handleScroll,
      style: { height: containerHeight, overflow: 'auto' }
    }
  };
};

// Component lazy loading
export const LazyImage = ({ 
  src, 
  alt, 
  className,
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const { isIntersecting } = useIntersectionObserver({
    threshold: 0.1
  });
  
  useEffect(() => {
    setIsInView(isIntersecting);
  }, [isIntersecting]);
  
  useEffect(() => {
    if (!src || !isInView) return;
    
    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(false);
    };
    
    if (typeof src === 'string') {
      img.src = src;
    }
  }, [src, isInView]);
  
  if (hasError) {
    return React.createElement('div', {
      className: "flex items-center justify-center bg-gray-200 rounded",
      style: { height: props.height || 200 }
    }, React.createElement('span', {
      className: "text-gray-500"
    }, "Failed to load image"));
  }
  
  if (!isInView) {
    return React.createElement('div', {
      className: "relative"
    }, React.createElement('div', {
      className: "animate-pulse bg-gray-200 rounded",
      style: { height: props.height || 200 }
    }));
  }
  
  return React.createElement('div', {
    className: "relative"
  }, 
    !isLoaded && React.createElement('div', {
      className: "animate-pulse bg-gray-200 rounded absolute inset-0",
      style: { height: props.height || 200 }
    }),
    React.createElement('img', {
      ...props,
      src: src,
      alt: alt,
      className: className,
      style: {
        ...props.style,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }
    })
  );
};
