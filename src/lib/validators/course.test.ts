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
    saleMode: "always_open" as const,
    saleWindows: [],
    accessDurationMonths: 12,
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
            text: "Który katalog służy do routingu?",
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

  it("defaults the access duration to twelve months", () => {
    const payload = createBaseCoursePayload();
    delete payload.accessDurationMonths;

    const result = courseInputSchema.safeParse(payload);

    expect(result.success).toBe(true);
    expect(result.data?.accessDurationMonths).toBe(12);
  });

  it("rejects scheduled sales without a sale window", () => {
    const payload = createBaseCoursePayload();
    payload.saleMode = "scheduled";
    payload.saleWindows = [];

    const result = courseInputSchema.safeParse(payload);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain(
      "Dodaj co najmniej jedno okno sprzedaży.",
    );
  });

  it("rejects sale windows that end before they start", () => {
    const payload = createBaseCoursePayload();
    payload.saleMode = "scheduled";
    payload.saleWindows = [
      {
        startsAt: "2026-06-14T00:00:00.000Z",
        endsAt: "2026-06-01T00:00:00.000Z",
      },
    ];

    const result = courseInputSchema.safeParse(payload);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain(
      "Okno sprzedaży musi mieć datę zakończenia po dacie startu.",
    );
  });

  it("rejects non-positive access durations", () => {
    const payload = createBaseCoursePayload();
    payload.accessDurationMonths = 0;

    const result = courseInputSchema.safeParse(payload);

    expect(result.success).toBe(false);
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
            text: "Wybierz jedną odpowiedź",
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
            text: "Za mało odpowiedzi",
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
