import type { ReactNode } from "react";

type Props = {
  title: string;
  lead?: string;
  children: ReactNode;
};

export function LegalPageShell({ title, lead, children }: Props) {
  return (
    <div className="min-h-screen bg-[var(--coffee-cream)] py-12 sm:py-16">
      <div className="page-width">
        <article className="max-w-3xl mx-auto bg-white border border-[var(--coffee-cappuccino)] border-radius p-6 sm:p-8 md:p-10 shadow-[var(--shadow-sm)]">
          <header className="mb-8 pb-6 border-b border-[var(--coffee-cappuccino)]">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--coffee-charcoal)] leading-tight tracking-tight">
              {title}
            </h1>
            {lead ? (
              <p className="mt-4 text-sm sm:text-[15px] text-[var(--coffee-espresso)] leading-relaxed">
                {lead}
              </p>
            ) : null}
          </header>
          <div
            className={[
              "space-y-5 text-sm sm:text-[15px] text-[var(--coffee-espresso)] leading-relaxed",
              "[&_h2]:text-base [&_h2]:sm:text-lg [&_h2]:font-semibold [&_h2]:text-[var(--coffee-charcoal)]",
              "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:first:mt-0",
              "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2",
              "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2",
              "[&_strong]:font-semibold [&_strong]:text-[var(--coffee-charcoal)]",
              "[&_a]:text-[var(--coffee-mocha)] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[var(--coffee-dark)]",
            ].join(" ")}
          >
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}
