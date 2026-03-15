export const e2ePrefix = "e2e-auto";

export const uniqueSuffix = () => `_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export const makeCourseTestData = (suffix = uniqueSuffix()) => ({
  title: `Kurs e2e ${suffix}`,
  description: "Kurs przygotowany przez testy automatyczne.",
  price: "299",
  sectionTitle: `Sekcja podstawowa ${suffix}`,
  itemTitle: `Lekcja testowa ${suffix}`,
  youtubeUrl: "https://www.youtube.com/watch?v=dGcsHMXbSOA",
});

export const makeCouponTestData = (suffix = uniqueSuffix()) => ({
  name: `Rabat e2e ${suffix}`,
  code: `E2E${suffix.replace(/[^A-Z0-9]/g, "").slice(0, 10)}`,
  discountType: "percentage" as const,
  discountValue: "20",
});
