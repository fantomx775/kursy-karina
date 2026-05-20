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
          },
          {
            course_id: "course",
            access_status: "active",
            access_expires_at: "2026-07-17T10:00:00.000Z",
          },
        ],
        now,
      ),
    ).toMatchObject({
      status: "active",
      hasActiveAccess: true,
      hasPendingAccess: false,
      activeExpiresAt: "2026-07-17T10:00:00.000Z",
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
    });
  });
});
