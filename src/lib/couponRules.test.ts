import { describe, expect, it } from "vitest";
import { evaluateCouponCourseRules } from "./couponRules";

const courseA = "00000000-0000-4000-8000-000000000001";
const courseB = "00000000-0000-4000-8000-000000000002";
const courseC = "00000000-0000-4000-8000-000000000003";

describe("evaluateCouponCourseRules", () => {
  it("requires all configured courses to be present in the cart", () => {
    const result = evaluateCouponCourseRules({
      discountType: "percentage",
      discountValue: 1000,
      cartItems: [{ courseId: courseA, amount: 10000 }],
      requiredCourseIds: [courseA, courseB],
    });

    expect(result).toEqual({
      valid: false,
      reason: "missing-required-courses",
      missingCourseIds: [courseB],
    });
  });

  it("calculates the discount only from applicable courses", () => {
    const result = evaluateCouponCourseRules({
      discountType: "percentage",
      discountValue: 1000,
      cartItems: [
        { courseId: courseA, amount: 10000 },
        { courseId: courseB, amount: 20000 },
      ],
      applicableCourseIds: [courseB],
    });

    expect(result).toMatchObject({
      valid: true,
      discountBaseAmount: 20000,
      discountAmount: 2000,
    });
  });

  it("allows bundle coupons that require two courses together", () => {
    const result = evaluateCouponCourseRules({
      discountType: "fixed",
      discountValue: 5000,
      cartItems: [
        { courseId: courseA, amount: 10000 },
        { courseId: courseB, amount: 20000 },
        { courseId: courseC, amount: 30000 },
      ],
      applicableCourseIds: [courseA, courseB],
      requiredCourseIds: [courseA, courseB],
    });

    expect(result).toMatchObject({
      valid: true,
      discountBaseAmount: 30000,
      discountAmount: 5000,
    });
  });

  it("does not apply a fixed discount above the applicable total", () => {
    const result = evaluateCouponCourseRules({
      discountType: "fixed",
      discountValue: 15000,
      cartItems: [
        { courseId: courseA, amount: 10000 },
        { courseId: courseB, amount: 20000 },
      ],
      applicableCourseIds: [courseA],
    });

    expect(result).toMatchObject({
      valid: true,
      discountBaseAmount: 10000,
      discountAmount: 10000,
    });
  });
});
