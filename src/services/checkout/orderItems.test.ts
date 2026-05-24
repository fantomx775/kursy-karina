import { describe, expect, it } from "vitest";
import { buildPendingOrderItems } from "./orderItems";

describe("buildPendingOrderItems", () => {
  it("builds pending order items without activation dates", () => {
    expect(
      buildPendingOrderItems({
        orderId: "order-1",
        courseIds: ["course-1"],
        courses: [
          {
            id: "course-1",
            title: "Kurs Node.js",
            price: 49900,
            access_duration_months: 12,
          },
        ],
      }),
    ).toEqual([
      {
        order_id: "order-1",
        course_id: "course-1",
        title: "Kurs Node.js",
        price: 49900,
        quantity: 1,
        access_duration_months: 12,
        access_status: "pending",
        access_activated_at: null,
        access_expires_at: null,
      },
    ]);
  });

  it("skips already persisted and duplicate courses", () => {
    expect(
      buildPendingOrderItems({
        orderId: "order-1",
        courseIds: ["course-1", "course-2", "course-2"],
        courses: [
          {
            id: "course-1",
            title: "Existing",
            price: 10000,
            access_duration_months: 6,
          },
          {
            id: "course-2",
            title: "Missing",
            price: 20000,
            access_duration_months: 0,
          },
        ],
        existingCourseIds: ["course-1"],
      }),
    ).toEqual([
      {
        order_id: "order-1",
        course_id: "course-2",
        title: "Missing",
        price: 20000,
        quantity: 1,
        access_duration_months: 12,
        access_status: "pending",
        access_activated_at: null,
        access_expires_at: null,
      },
    ]);
  });
});
