export const DEFAULT_COURSE_ACCESS_DURATION_MONTHS = 12;

export function normalizeAccessDurationMonths(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return DEFAULT_COURSE_ACCESS_DURATION_MONTHS;
  }
  return parsed;
}

export function addCalendarMonths(date: Date, months: number): Date {
  const duration = normalizeAccessDurationMonths(months);
  const sourceYear = date.getUTCFullYear();
  const sourceMonth = date.getUTCMonth();
  const targetMonthIndex = sourceMonth + duration;
  const targetYear = sourceYear + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetYear, targetMonth + 1, 0),
  ).getUTCDate();
  const targetDay = Math.min(date.getUTCDate(), lastDayOfTargetMonth);

  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      targetDay,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
}

export function formatAccessDuration(months: number): string {
  const duration = normalizeAccessDurationMonths(months);
  if (duration === 1) {
    return "1 miesiąc";
  }
  return `${duration} miesięcy`;
}
