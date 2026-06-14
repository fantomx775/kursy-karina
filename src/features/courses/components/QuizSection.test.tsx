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
    title: "Quiz podsumowujący",
    kind: "quiz",
    asset_path: null,
    youtube_url: null,
    quiz_data: {
      questions: [
        {
          text: "Który katalog obsługuje routing?",
          type: "single",
          answers: [
            { text: "app", isCorrect: true },
            { text: "pages", isCorrect: false },
          ],
        },
        {
          text: "Które pliki są typowe dla App Router?",
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
    await user.click(screen.getByRole("button", { name: "Sprawdź" }));

    await waitFor(() => {
      expect(onPass).toHaveBeenCalledWith("quiz-item-1");
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Quiz został zaliczony.",
    );
  });

  it("shows per-question feedback and a detailed breakdown after a failed attempt", async () => {
    const user = userEvent.setup();
    const onPass = vi.fn().mockResolvedValue(undefined);

    render(
      <QuizSection item={createQuizItem()} isCompleted={false} onPass={onPass} />,
    );

    await user.click(screen.getByLabelText("app"));
    await user.click(screen.getByRole("button", { name: "Sprawdź" }));

    expect(onPass).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Wynik: 1/2. Spróbuj ponownie.",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 dobrze, 0 źle, 1 nieodpowiedziano",
    );
    expect(screen.getByText("Dobrze!")).toBeInTheDocument();
    expect(screen.getByText("Brak odpowiedzi")).toBeInTheDocument();
  });

  it("hides attempt feedback after changing an answer until Sprawdź is clicked again", async () => {
    const user = userEvent.setup();
    const onPass = vi.fn().mockResolvedValue(undefined);

    render(
      <QuizSection item={createQuizItem()} isCompleted={false} onPass={onPass} />,
    );

    await user.click(screen.getByLabelText("app"));
    await user.click(screen.getByRole("button", { name: "Sprawdź" }));

    expect(screen.getByText("Dobrze!")).toBeInTheDocument();

    await user.click(screen.getByLabelText("layout.tsx"));

    expect(screen.getByText("Dobrze!")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sprawdź" }));

    expect(screen.getByText("Źle")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 dobrze, 1 źle, 0 nieodpowiedziano",
    );
  });

  it("does not restore feedback when reverting to the same selection after a change", async () => {
    const user = userEvent.setup();
    const onPass = vi.fn().mockResolvedValue(undefined);

    render(
      <QuizSection item={createQuizItem()} isCompleted={false} onPass={onPass} />,
    );

    await user.click(screen.getByLabelText("pages"));
    await user.click(screen.getByRole("button", { name: "Sprawdź" }));

    expect(screen.getByText("Źle")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "0 dobrze, 1 źle, 1 nieodpowiedziano",
    );

    await user.click(screen.getByLabelText("app"));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText("Źle")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("pages"));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText("Źle")).not.toBeInTheDocument();
  });

  it("keeps locked correct styling after changing another answer", async () => {
    const user = userEvent.setup();
    const onPass = vi.fn().mockResolvedValue(undefined);

    render(
      <QuizSection item={createQuizItem()} isCompleted={false} onPass={onPass} />,
    );

    await user.click(screen.getByLabelText("app"));
    await user.click(screen.getByRole("button", { name: "Sprawdź" }));

    expect(screen.getByText("Dobrze!")).toBeInTheDocument();

    await user.click(screen.getByLabelText("layout.tsx"));

    expect(screen.getByText("Dobrze!")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText("Źle")).not.toBeInTheDocument();
  });

  it("unlocks correct styling when the locked question answer changes", async () => {
    const user = userEvent.setup();
    const onPass = vi.fn().mockResolvedValue(undefined);

    render(
      <QuizSection item={createQuizItem()} isCompleted={false} onPass={onPass} />,
    );

    await user.click(screen.getByLabelText("app"));
    await user.click(screen.getByRole("button", { name: "Sprawdź" }));

    expect(screen.getByText("Dobrze!")).toBeInTheDocument();

    await user.click(screen.getByLabelText("pages"));

    expect(screen.queryByText("Dobrze!")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
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
    await user.click(screen.getByRole("button", { name: "Sprawdź" }));

    await waitFor(() => {
      expect(onPass).toHaveBeenCalledTimes(1);
    });

    rerender(<QuizSection item={item} isCompleted={true} onPass={onPass} />);

    await user.click(screen.getByLabelText("pages"));
    await user.click(screen.getByLabelText("layout.tsx"));
    await user.click(screen.getByLabelText("page.tsx"));
    await user.click(screen.getByLabelText("getServerSideProps"));
    await user.click(screen.getByRole("button", { name: "Sprawdź" }));

    expect(onPass).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Quiz pozostaje zaliczony.",
    );
  });
});
