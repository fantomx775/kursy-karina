import { describe, expect, it } from "vitest";
import {
  formatCouponValidityPeriod,
  getCouponDisplayStatus,
} from "./couponStatus";

const now = new Date("2026-06-13T12:00:00.000Z");

describe("getCouponDisplayStatus", () => {
  it("returns inactive when isActive is false", () => {
    expect(
      getCouponDisplayStatus(
        {
          isActive: false,
          startDate: "2026-01-01",
          endDate: "2026-12-31",
        },
        now,
      ),
    ).toBe("inactive");
  });

  it("returns expired when end date is in the past", () => {
    expect(
      getCouponDisplayStatus(
        {
          isActive: true,
          startDate: "2026-01-01",
          endDate: "2026-06-01",
        },
        now,
      ),
    ).toBe("expired");
  });

  it("returns scheduled when start date is in the future", () => {
    expect(
      getCouponDisplayStatus(
        {
          isActive: true,
          startDate: "2026-07-01",
          endDate: null,
        },
        now,
      ),
    ).toBe("scheduled");
  });

  it("returns active when within the validity window", () => {
    expect(
      getCouponDisplayStatus(
        {
          isActive: true,
          startDate: "2026-01-01",
          endDate: "2026-12-31",
        },
        now,
      ),
    ).toBe("active");
  });

  it("returns exhausted when global usage limit is reached", () => {
    expect(
      getCouponDisplayStatus(
        {
          isActive: true,
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          usageLimit: 10,
          usageCount: 10,
        },
        now,
      ),
    ).toBe("exhausted");
  });

  it("prefers expired over exhausted when both apply", () => {
    expect(
      getCouponDisplayStatus(
        {
          isActive: true,
          startDate: "2026-01-01",
          endDate: "2026-06-01",
          usageLimit: 5,
          usageCount: 5,
        },
        now,
      ),
    ).toBe("expired");
  });
});

describe("formatCouponValidityPeriod", () => {
  it("formats start and end dates", () => {
    expect(
      formatCouponValidityPeriod("2026-01-15", "2026-06-30"),
    ).toMatch(/15\.01\.2026.*30\.06\.2026/);
  });

  it("formats open-ended validity from start date", () => {
    expect(formatCouponValidityPeriod("2026-01-15", null)).toBe(
      "od 15.01.2026",
    );
  });
});
