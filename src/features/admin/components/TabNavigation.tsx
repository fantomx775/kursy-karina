type TabNavigationProps = {
  activeTab: "courses" | "students" | "coupons" | "stats";
  onTabChange: (tab: "courses" | "students" | "coupons" | "stats") => void;
};

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { key: "courses", label: "Kursy" },
    { key: "students", label: "Kursanci" },
    { key: "coupons", label: "Kupony" },
    { key: "stats", label: "Statystyki kursów" },
  ] as const;

  return (
    <div className="mb-6 flex gap-3">
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
          {tab.label}
        </button>
      ))}
    </div>
  );
}
