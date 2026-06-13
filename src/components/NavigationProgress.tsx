"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

function isInternalNavigation(href: string, pathname: string): boolean {
  if (!href || href.startsWith("#")) return false;
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return false;
  }

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return false;
    return url.pathname + url.search + url.hash !== pathname;
  } catch {
    return false;
  }
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      const current = pathnameRef.current ?? "";
      if (!href || !isInternalNavigation(href, current)) return;

      setPending(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!pending) return null;

  return (
    <>
      <div
        className="fixed inset-x-0 top-[var(--header-height)] z-50 h-0.5 overflow-hidden bg-[var(--coffee-cappuccino)]"
        aria-hidden
      >
        <div className="h-full w-1/3 bg-[var(--coffee-mocha)] navigation-progress-bar" />
      </div>
      <div
        className="fixed inset-x-0 bottom-0 top-[var(--header-height)] z-30 flex items-center justify-center bg-[var(--coffee-cream)]/75 backdrop-blur-[2px]"
        role="status"
        aria-label="Ładowanie"
        aria-live="polite"
      >
        <Spinner size="lg" />
      </div>
    </>
  );
}
