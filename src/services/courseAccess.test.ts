import { describe, expect, it } from "vitest";
import { resolveCourseAccessState } from "./courseAccess";

describe("resolveCourseAccessState", () => {
  const now = new Date("2026-05-17T10:00:00.000Z");

  it("returns none when the course was never purchased", () => {
    expect(resolveCourseAccessState([], now)).toMatchObject({
      status: "none",
      hasActiveAccess: false,
      hasPendingAccess: false,
      hasEverPurchased: false,
    });
  });

  it("returns active with the latest active expiry", () => {
    expect(
      resolveCourseAccessState(
        [
          {
            course_id: "course",
            access_status: "active",
            access_expires_at: "2026-06-17T10:00:00.000Z",
            access_duration_months: 6,
          },
          {
            course_id: "course",
            access_status: "active",
            access_expires_at: "2026-07-17T10:00:00.000Z",
            access_duration_months: 12,
          },
        ],
        now,
      ),
    ).toMatchObject({
      status: "active",
      hasActiveAccess: true,
      hasPendingAccess: false,
      activeExpiresAt: "2026-07-17T10:00:00.000Z",
      accessDurationMonths: 12,
    });
  });

  it("returns pending when the course was paid for but not activated", () => {
    expect(
      resolveCourseAccessState(
        [
          {
            course_id: "course",
            access_status: "pending",
            access_expires_at: null,
            access_duration_months: 6,
          },
        ],
        now,
      ),
    ).toMatchObject({
      status: "pending",
      hasActiveAccess: false,
      hasPendingAccess: true,
      hasEverPurchased: true,
      activeExpiresAt: null,
      lastExpiresAt: null,
      accessDurationMonths: 6,
    });
  });

  it("returns expired when only historical access exists", () => {
    expect(
      resolveCourseAccessState(
        [
          {
            course_id: "course",
            access_status: "active",
            access_expires_at: "2026-01-17T10:00:00.000Z",
            access_duration_months: 3,
          },
        ],
        now,
      ),
    ).toMatchObject({
      status: "expired",
      hasActiveAccess: false,
      hasPendingAccess: false,
      hasEverPurchased: true,
      lastExpiresAt: "2026-01-17T10:00:00.000Z",
      accessDurationMonths: 3,
    });
  });

  it("returns revoked when access was manually removed", () => {
    expect(
      resolveCourseAccessState(
        [
          {
            course_id: "course",
            access_status: "revoked",
            access_activated_at: "2026-04-17T10:00:00.000Z",
            access_expires_at: "2026-10-17T10:00:00.000Z",
            access_duration_months: 6,
          },
        ],
        now,
      ),
    ).toMatchObject({
      status: "revoked",
      hasActiveAccess: false,
      hasPendingAccess: false,
      hasEverPurchased: true,
      lastActivatedAt: "2026-04-17T10:00:00.000Z",
      lastExpiresAt: "2026-10-17T10:00:00.000Z",
      accessDurationMonths: 6,
    });
  });

  it("uses the latest historical access state after a revoked access", () => {
    expect(
      resolveCourseAccessState(
        [
          {
            course_id: "course",
            access_status: "revoked",
            access_activated_at: "2026-01-17T10:00:00.000Z",
            access_expires_at: "2026-04-17T10:00:00.000Z",
            access_duration_months: 3,
          },
          {
            course_id: "course",
            access_status: "active",
            access_activated_at: "2026-02-17T10:00:00.000Z",
            access_expires_at: "2026-05-17T10:00:00.000Z",
            access_duration_months: 3,
          },
        ],
        now,
      ),
    ).toMatchObject({
      status: "expired",
      hasActiveAccess: false,
      lastActivatedAt: "2026-02-17T10:00:00.000Z",
      lastExpiresAt: "2026-05-17T10:00:00.000Z",
    });
  });
});
