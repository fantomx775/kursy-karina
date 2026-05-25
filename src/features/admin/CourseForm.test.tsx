import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CourseForm } from "./CourseForm";
import type { Course } from "@/types/course";
import type { CourseFormSection } from "./course-form-types";

const baseCourse: Course = {
  id: "course-1",
  title: "Kurs testowy",
  slug: "kurs-testowy",
  description: "Opis kursu",
  price: 14900,
  status: "inactive",
  sale_mode: "always_open",
};

const youtubeItem = (title: string) => ({
  title,
  kind: "youtube" as const,
  assetPath: "",
  youtubeUrl: "https://www.youtube.com/watch?v=dGcsHMXbSOA",
  quiz: null,
});

function renderCourseFormWithSections(sections: CourseFormSection[]) {
  const onSave = vi.fn();
  const onChange = vi.fn();

  render(
    <CourseForm
      initial={baseCourse}
      initialSections={sections}
      onCancel={vi.fn()}
      onSave={onSave}
      onChange={onChange}
    />,
  );

  return { onSave, onChange };
}

describe("CourseForm", () => {
  it("submits quiz data in the same section payload as other lesson items", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<CourseForm onCancel={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText("Tytuł"), "Quizowy kurs");
    await user.type(screen.getByLabelText("Opis"), "Opis kursu");
    await user.type(screen.getByLabelText("Cena (PLN)"), "149");
    await user.type(screen.getByPlaceholderText("Tytuł sekcji"), "Sekcja 1");

    await user.click(screen.getByRole("button", { name: "Quiz" }));
    await user.type(
      screen.getByPlaceholderText("Tytuł elementu"),
      "Quiz koncowy",
    );
    await user.type(
      screen.getByPlaceholderText("Tresc pytania"),
      "Jak działa App Router?",
    );
    await user.type(
      screen.getByPlaceholderText("Odpowiedz 1"),
      "W katalogu app",
    );
    await user.type(
      screen.getByPlaceholderText("Odpowiedz 2"),
      "W katalogu pages",
    );
    await user.click(screen.getAllByLabelText("Poprawna")[0]);

    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Quizowy kurs",
        description: "Opis kursu",
        price: 149,
        saleMode: "always_open",
        saleWindows: [],
        accessDurationMonths: 12,
        sections: [
          {
            title: "Sekcja 1",
            items: [
              {
                title: "Quiz koncowy",
                kind: "quiz",
                assetPath: "",
                youtubeUrl: "",
                quiz: {
                  questions: [
                    {
                      text: "Jak działa App Router?",
                      type: "single",
                      answers: [
                        { text: "W katalogu app", isCorrect: true },
                        { text: "W katalogu pages", isCorrect: false },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        ],
      }),
    );
  });

  it("allows admins to set a custom access duration", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<CourseForm onCancel={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText("Tytuł"), "Kurs z dostępem");
    await user.type(screen.getByLabelText("Opis"), "Opis kursu");
    await user.type(screen.getByLabelText("Cena (PLN)"), "199");
    await user.type(screen.getByPlaceholderText("Tytuł sekcji"), "Sekcja 1");
    await user.clear(
      screen.getByLabelText("Czas dostępu po aktywacji (miesiące)"),
    );
    await user.type(
      screen.getByLabelText("Czas dostępu po aktywacji (miesiące)"),
      "18",
    );

    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        accessDurationMonths: 18,
      }),
    );
  });

  it("shows a validation error when quiz question has no correct answer", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<CourseForm onCancel={vi.fn()} onSave={onSave} />);

    await user.type(
      screen.getByLabelText("Tytuł"),
      "Quiz bez poprawnej odpowiedzi",
    );
    await user.type(screen.getByLabelText("Opis"), "Opis kursu");
    await user.type(screen.getByLabelText("Cena (PLN)"), "99");
    await user.type(screen.getByPlaceholderText("Tytuł sekcji"), "Sekcja 1");

    await user.click(screen.getByRole("button", { name: "Quiz" }));
    await user.type(screen.getByPlaceholderText("Tytuł elementu"), "Quiz");
    await user.type(
      screen.getByPlaceholderText("Tresc pytania"),
      "Która odpowiedź jest poprawna?",
    );
    await user.type(screen.getByPlaceholderText("Odpowiedz 1"), "Opcja A");
    await user.type(screen.getByPlaceholderText("Odpowiedz 2"), "Opcja B");

    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Każde pytanie quizu musi mieć przynajmniej jedną poprawną odpowiedź.",
    );
  });

  it("highlights the invalid price input with a field-level message", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<CourseForm onCancel={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText("Tytuł"), "Kurs bez ceny");
    await user.type(screen.getByLabelText("Opis"), "Opis kursu");

    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    const priceInput = screen.getByLabelText("Cena (PLN)");
    expect(onSave).not.toHaveBeenCalled();
    expect(priceInput).toHaveAttribute("aria-invalid", "true");
    expect(priceInput).toHaveAccessibleDescription("Podaj cenę większą niż 0.");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Podaj cenę większą niż 0.",
    );
  });

  it("highlights the empty section title when course content is missing", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<CourseForm onCancel={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByLabelText("Tytuł"), "Kurs bez sekcji");
    await user.type(screen.getByLabelText("Opis"), "Opis kursu");
    await user.type(screen.getByLabelText("Cena (PLN)"), "99");

    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    const sectionTitle = screen.getByPlaceholderText("Tytuł sekcji");
    expect(onSave).not.toHaveBeenCalled();
    expect(sectionTitle).toHaveAttribute("aria-invalid", "true");
    expect(sectionTitle).toHaveAccessibleDescription(
      "Dodaj co najmniej jedną sekcję i podaj jej tytuł.",
    );
  });

  it("submits lesson items in the order selected with move buttons", async () => {
    const user = userEvent.setup();
    const { onSave, onChange } = renderCourseFormWithSections([
      {
        title: "Sekcja 1",
        items: [youtubeItem("Pierwsza lekcja"), youtubeItem("Druga lekcja")],
      },
    ]);

    await user.click(
      screen.getAllByRole("button", { name: "Przesuń lekcję w górę" })[1],
    );
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    expect(onChange).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: [
          {
            title: "Sekcja 1",
            items: [
              expect.objectContaining({ title: "Druga lekcja" }),
              expect.objectContaining({ title: "Pierwsza lekcja" }),
            ],
          },
        ],
      }),
    );
  });

  it("submits sections in the order selected with move buttons", async () => {
    const user = userEvent.setup();
    const { onSave, onChange } = renderCourseFormWithSections([
      {
        title: "Sekcja 1",
        items: [youtubeItem("Lekcja 1")],
      },
      {
        title: "Sekcja 2",
        items: [youtubeItem("Lekcja 2")],
      },
    ]);

    await user.click(
      screen.getAllByRole("button", { name: "Przesuń sekcję w górę" })[1],
    );
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    expect(onChange).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: [
          expect.objectContaining({ title: "Sekcja 2" }),
          expect.objectContaining({ title: "Sekcja 1" }),
        ],
      }),
    );
  });

  it("disables move buttons at the start and end of section and lesson lists", () => {
    renderCourseFormWithSections([
      {
        title: "Sekcja 1",
        items: [youtubeItem("Pierwsza lekcja"), youtubeItem("Druga lekcja")],
      },
      {
        title: "Sekcja 2",
        items: [youtubeItem("Trzecia lekcja")],
      },
    ]);

    expect(
      screen.getAllByRole("button", { name: "Przesuń sekcję w górę" })[0],
    ).toBeDisabled();
    expect(
      screen.getAllByRole("button", { name: "Przesuń sekcję w dół" })[1],
    ).toBeDisabled();
    expect(
      screen.getAllByRole("button", { name: "Przesuń lekcję w górę" })[0],
    ).toBeDisabled();
    expect(
      screen.getAllByRole("button", { name: "Przesuń lekcję w dół" })[1],
    ).toBeDisabled();
  });
});
