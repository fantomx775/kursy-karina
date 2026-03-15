import { z } from "zod";

export const couponInputSchema = z
  .object({
    name: z.string().min(1),
    code: z.string().min(1),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number().positive(),
    startDate: z.string().min(1),
    endDate: z.string().optional().nullable(),
    usageLimit: z.number().int().positive().optional().nullable(),
    usageLimitPerUser: z.number().int().positive().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.discountType === "percentage" && value.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Percentage discount cannot exceed 100.",
        path: ["discountValue"],
      });
    }
  });
