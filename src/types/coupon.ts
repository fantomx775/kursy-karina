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
  usageCount?: number;
  totalDiscountGiven?: number;
  createdAt?: string;
};
