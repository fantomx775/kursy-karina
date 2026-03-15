"use client";

import { usePathname } from "next/navigation";

const LEARN_PATH_PREFIX = "/learn/";

export function MainTopSpacer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLearnPage = pathname?.startsWith(LEARN_PATH_PREFIX) ?? false;

  if (isLearnPage) {
    return <>{children}</>;
  }

  return <div className="main-top-spacer">{children}</div>;
}
