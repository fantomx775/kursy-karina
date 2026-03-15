import { z } from "zod";

export const courseItemInputSchema = z
  .object({
    title: z.string().min(1),
    kind: z.enum(["svg", "youtube"]),
    assetPath: z.string().optional().nullable(),
    youtubeUrl: z.string().url().optional().nullable(),
    position: z.number().int().nonnegative().optional(),
    isPreview: z.boolean().optional(),
  })
  .refine(
    (data) =>
      (data.kind === "svg" && Boolean(data.assetPath) && !data.youtubeUrl) ||
      (data.kind === "youtube" && Boolean(data.youtubeUrl) && !data.assetPath),
    {
      message: "Item must have either SVG asset path or YouTube URL.",
    },
  );

export const courseSectionInputSchema = z.object({
  title: z.string().min(1),
  position: z.number().int().nonnegative().optional(),
  items: z.array(courseItemInputSchema),
});

export const courseInputSchema = z
  .object({
    title: z.string().min(1),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i),
    description: z.string().min(1),
    price: z.number().positive(),
    status: z.enum(["active", "inactive"]),
    mainImageUrl: z
      .string()
      .url()
      .max(2048)
      .optional()
      .nullable(),
    sections: z.array(courseSectionInputSchema),
    promotionDiscountType: z.enum(["percentage", "fixed"]).optional().nullable(),
    promotionDiscountValue: z.number().optional().nullable(),
    promotionStartDate: z.string().optional().nullable(),
    promotionEndDate: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const hasAny =
      data.promotionDiscountType != null ||
      data.promotionDiscountValue != null ||
      data.promotionStartDate != null ||
      (data.promotionEndDate != null && data.promotionEndDate !== "");
    if (!hasAny) return;
    if (
      data.promotionDiscountType == null ||
      data.promotionDiscountValue == null ||
      data.promotionStartDate == null ||
      data.promotionStartDate === ""
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Promocja wymaga: typ zniżki, wartość i data rozpoczęcia.",
        path: ["promotionStartDate"],
      });
      return;
    }
    if (
      data.promotionDiscountType === "percentage" &&
      (data.promotionDiscountValue < 1 || data.promotionDiscountValue > 100)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Zniżka procentowa musi być od 1 do 100.",
        path: ["promotionDiscountValue"],
      });
    }
    if (
      data.promotionDiscountType === "fixed" &&
      data.promotionDiscountValue < 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Zniżka kwotowa nie może być ujemna.",
        path: ["promotionDiscountValue"],
      });
    }
  });
