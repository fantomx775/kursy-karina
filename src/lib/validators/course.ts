import { z } from "zod";

export const quizAnswerInputSchema = z.object({
  text: z.string().min(1, "Answer text is required."),
  isCorrect: z.boolean(),
});

export const quizQuestionInputSchema = z
  .object({
    text: z.string().min(1, "Question text is required."),
    type: z.enum(["single", "multiple"]),
    answers: z
      .array(quizAnswerInputSchema)
      .min(2, "Question must have at least two answers."),
  })
  .superRefine((question, ctx) => {
    const correctAnswers = question.answers.filter((answer) => answer.isCorrect);

    if (correctAnswers.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Question must have at least one correct answer.",
        path: ["answers"],
      });
    }

    if (question.type === "single" && correctAnswers.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Single choice question can have only one correct answer.",
        path: ["answers"],
      });
    }
  });

export const quizInputSchema = z.object({
  questions: z
    .array(quizQuestionInputSchema)
    .min(1, "Quiz must have at least one question."),
});

export const courseItemInputSchema = z
  .object({
    title: z.string().min(1),
    kind: z.enum(["svg", "youtube", "quiz"]),
    assetPath: z.string().optional().nullable(),
    youtubeUrl: z.string().url().optional().nullable(),
    quizData: quizInputSchema.optional().nullable(),
    position: z.number().int().nonnegative().optional(),
    isPreview: z.boolean().optional(),
  })
  .refine(
    (data) =>
      (data.kind === "svg" &&
        Boolean(data.assetPath) &&
        !data.youtubeUrl &&
        !data.quizData) ||
      (data.kind === "youtube" &&
        Boolean(data.youtubeUrl) &&
        !data.assetPath &&
        !data.quizData) ||
      (data.kind === "quiz" &&
        Boolean(data.quizData) &&
        !data.assetPath &&
        !data.youtubeUrl),
    {
      message: "Item must have data matching its kind.",
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
