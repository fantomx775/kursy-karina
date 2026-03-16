"use client";

import React from 'react';
import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-[var(--coffee-cappuccino)] bg-white">
      <div className="page-width py-6 sm:py-8 text-sm text-[var(--coffee-espresso)] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Kursy Karina Koziara</span>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-[var(--coffee-mocha)] transition-colors py-1 min-h-[44px] sm:min-h-0 flex items-center">
            Polityka prywatności
          </Link>
          <Link href="/terms" className="hover:text-[var(--coffee-mocha)] transition-colors py-1 min-h-[44px] sm:min-h-0 flex items-center">
            Regulamin
          </Link>
        </div>
      </div>
    </footer>
  );
}
