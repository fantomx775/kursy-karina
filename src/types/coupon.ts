export type Coupon = {
  id: string;
  name: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  isActive: boolean;
  applicableCourseIds: string[];
  requiredCourseIds: string[];
  applicableCourses?: CouponCourseSummary[];
  requiredCourses?: CouponCourseSummary[];
  usageCount?: number;
  totalDiscountGiven?: number;
  createdAt?: string;
};

export type CouponCourseSummary = {
  id: string;
  title: string;
};
