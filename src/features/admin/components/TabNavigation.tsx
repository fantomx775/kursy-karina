type AdminNavTab =
  | "courses"
  | "students"
  | "access"
  | "certificates"
  | "coupons"
  | "stats";

type TabNavigationProps = {
  activeTab: AdminNavTab;
  onTabChange: (tab: AdminNavTab) => void;
  certificateActionCount?: number | null;
  pendingAccessCount?: number | null;
};

export function TabNavigation({
  activeTab,
  onTabChange,
  certificateActionCount,
  pendingAccessCount,
}: TabNavigationProps) {
  const tabs: Array<{ key: AdminNavTab; label: string }> = [
    { key: "courses", label: "Kursy" },
    { key: "students", label: "Kursanci" },
    { key: "access", label: "Dostępy" },
    { key: "certificates", label: "Certyfikaty" },
    { key: "coupons", label: "Kupony" },
    { key: "stats", label: "Statystyki kursów" },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`px-4 py-2 border border-radius ${
            activeTab === tab.key
              ? "border-[var(--coffee-mocha)] bg-[var(--coffee-cream)] text-[var(--coffee-mocha)]"
              : "border-[var(--coffee-cappuccino)] text-[var(--coffee-espresso)] hover:bg-[var(--coffee-cream)]"
          }`}
          onClick={() => onTabChange(tab.key)}
        >
          <span className="inline-flex items-center gap-2">
            {tab.label}
            {tab.key === "access" &&
            pendingAccessCount != null &&
            pendingAccessCount > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--coffee-mocha)] px-1.5 py-0.5 text-xs font-semibold text-white">
                {pendingAccessCount}
              </span>
            ) : null}
            {tab.key === "certificates" &&
            certificateActionCount != null &&
            certificateActionCount > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--coffee-mocha)] px-1.5 py-0.5 text-xs font-semibold text-white">
                {certificateActionCount}
              </span>
            ) : null}
          </span>
        </button>
      ))}
    </div>
  );
}
