import { describe, expect, it } from "vitest";
import {
  DEFAULT_COURSE_ACCESS_DURATION_MONTHS,
  addCalendarMonths,
  formatAccessDuration,
  normalizeAccessDurationMonths,
} from "./accessDuration";

describe("accessDuration", () => {
  it("normalizes invalid durations to the product default", () => {
    expect(normalizeAccessDurationMonths(0)).toBe(
      DEFAULT_COURSE_ACCESS_DURATION_MONTHS,
    );
    expect(normalizeAccessDurationMonths("abc")).toBe(
      DEFAULT_COURSE_ACCESS_DURATION_MONTHS,
    );
  });

  it("adds calendar months without rolling past the target month", () => {
    const result = addCalendarMonths(
      new Date("2026-01-31T10:15:00.000Z"),
      1,
    );

    expect(result.toISOString()).toBe("2026-02-28T10:15:00.000Z");
  });

  it("formats durations for UI copy", () => {
    expect(formatAccessDuration(1)).toBe("1 miesiąc");
    expect(formatAccessDuration(6)).toBe("6 miesięcy");
  });
});
