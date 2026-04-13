import { describe, expect, it } from "vitest";
import { evaluateQuizAttempt } from "./courseQuiz";

const quiz = {
  questions: [
    {
      text: "Jedna odpowiedz",
      type: "single" as const,
      answers: [
        { text: "A", isCorrect: true },
        { text: "B", isCorrect: false },
      ],
    },
    {
      text: "Wiele odpowiedzi",
      type: "multiple" as const,
      answers: [
        { text: "A", isCorrect: true },
        { text: "B", isCorrect: true },
        { text: "C", isCorrect: false },
      ],
    },
  ],
};

describe("evaluateQuizAttempt", () => {
  it("passes only when every question is answered with an exact match", () => {
    const result = evaluateQuizAttempt(quiz, {
      0: [0],
      1: [0, 1],
    });

    expect(result).toEqual({
      totalQuestions: 2,
      correctQuestions: 2,
      unansweredQuestions: 0,
      isPassed: true,
    });
  });

  it("fails when user selects only part of the correct multiple choice set", () => {
    const result = evaluateQuizAttempt(quiz, {
      0: [0],
      1: [0],
    });

    expect(result).toEqual({
      totalQuestions: 2,
      correctQuestions: 1,
      unansweredQuestions: 0,
      isPassed: false,
    });
  });
});
