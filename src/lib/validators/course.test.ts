import { z } from "zod";
import { describe, expect, it } from "vitest";
import { courseInputSchema } from "./course";

function createBaseCoursePayload(): z.input<typeof courseInputSchema> {
  return {
    title: "Kurs z quizem",
    slug: "kurs-z-quizem",
    description: "Opis",
    price: 199,
    status: "active" as const,
    sections: [
      {
        title: "Sekcja 1",
        items: [],
      },
    ],
    mainImageUrl: null,
    promotionDiscountType: null,
    promotionDiscountValue: null,
    promotionStartDate: null,
    promotionEndDate: null,
  };
}

describe("courseInputSchema", () => {
  it("accepts quiz items embedded directly inside lesson items", () => {
    const payload = createBaseCoursePayload();
    payload.sections[0].items.push({
      title: "Quiz podsumowujacy",
      kind: "quiz",
      assetPath: null,
      youtubeUrl: null,
      quizData: {
        questions: [
          {
            text: "Ktory katalog sluzy do routingu?",
            type: "single",
            answers: [
              { text: "app", isCorrect: true },
              { text: "pages", isCorrect: false },
            ],
          },
        ],
      },
    });

    const result = courseInputSchema.safeParse(payload);

    expect(result.success).toBe(true);
  });

  it("rejects single choice questions with more than one correct answer", () => {
    const payload = createBaseCoursePayload();
    payload.sections[0].items.push({
      title: "Quiz",
      kind: "quiz",
      assetPath: null,
      youtubeUrl: null,
      quizData: {
        questions: [
          {
            text: "Wybierz jedna odpowiedz",
            type: "single",
            answers: [
              { text: "A", isCorrect: true },
              { text: "B", isCorrect: true },
            ],
          },
        ],
      },
    });

    const result = courseInputSchema.safeParse(payload);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain(
      "Single choice question can have only one correct answer.",
    );
  });

  it("rejects quiz questions without at least two answers and one correct answer", () => {
    const payload = createBaseCoursePayload();
    payload.sections[0].items.push({
      title: "Quiz",
      kind: "quiz",
      assetPath: null,
      youtubeUrl: null,
      quizData: {
        questions: [
          {
            text: "Za malo odpowiedzi",
            type: "multiple",
            answers: [{ text: "A", isCorrect: false }],
          },
        ],
      },
    });

    const result = courseInputSchema.safeParse(payload);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain(
      "Question must have at least two answers.",
    );
  });
});
