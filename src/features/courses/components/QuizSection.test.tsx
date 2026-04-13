import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CourseItem } from "@/types/course";
import { QuizSection } from "./QuizSection";

function createQuizItem(): CourseItem {
  return {
    id: "quiz-item-1",
    section_id: "section-1",
    title: "Quiz podsumowujacy",
    kind: "quiz",
    asset_path: null,
    youtube_url: null,
    quiz_data: {
      questions: [
        {
          text: "Ktory katalog obsluguje routing?",
          type: "single",
          answers: [
            { text: "app", isCorrect: true },
            { text: "pages", isCorrect: false },
          ],
        },
        {
          text: "Ktore pliki sa typowe dla App Router?",
          type: "multiple",
          answers: [
            { text: "layout.tsx", isCorrect: true },
            { text: "page.tsx", isCorrect: true },
            { text: "getServerSideProps", isCorrect: false },
          ],
        },
      ],
    },
    position: 0,
    is_preview: false,
  };
}

describe("QuizSection", () => {
  it("marks quiz as passed after a correct attempt", async () => {
    const user = userEvent.setup();
    const onPass = vi.fn().mockResolvedValue(undefined);

    render(
      <QuizSection item={createQuizItem()} isCompleted={false} onPass={onPass} />,
    );

    await user.click(screen.getByLabelText("app"));
    await user.click(screen.getByLabelText("layout.tsx"));
    await user.click(screen.getByLabelText("page.tsx"));
    await user.click(screen.getByRole("button", { name: "Sprawdz" }));

    await waitFor(() => {
      expect(onPass).toHaveBeenCalledWith("quiz-item-1");
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Quiz zostal zaliczony.",
    );
  });

  it("keeps the quiz completed even if a later retry is incorrect", async () => {
    const user = userEvent.setup();
    const onPass = vi.fn().mockResolvedValue(undefined);
    const item = createQuizItem();
    const { rerender } = render(
      <QuizSection item={item} isCompleted={false} onPass={onPass} />,
    );

    await user.click(screen.getByLabelText("app"));
    await user.click(screen.getByLabelText("layout.tsx"));
    await user.click(screen.getByLabelText("page.tsx"));
    await user.click(screen.getByRole("button", { name: "Sprawdz" }));

    await waitFor(() => {
      expect(onPass).toHaveBeenCalledTimes(1);
    });

    rerender(<QuizSection item={item} isCompleted={true} onPass={onPass} />);

    await user.click(screen.getByLabelText("pages"));
    await user.click(screen.getByLabelText("layout.tsx"));
    await user.click(screen.getByLabelText("page.tsx"));
    await user.click(screen.getByLabelText("getServerSideProps"));
    await user.click(screen.getByRole("button", { name: "Sprawdz" }));

    expect(onPass).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Quiz pozostaje zaliczony.",
    );
  });
});
