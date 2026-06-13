"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  rootMargin?: string;
  placeholder?: ReactNode;
};

const defaultPlaceholder = (
  <div
    className="min-h-[120px] border-radius border border-[var(--coffee-cappuccino)] bg-[var(--coffee-cream)]"
    aria-hidden
  />
);

export function LazyWhenVisible({
  children,
  rootMargin = "300px 0px",
  placeholder = defaultPlaceholder,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return <div ref={ref}>{visible ? children : placeholder}</div>;
}
