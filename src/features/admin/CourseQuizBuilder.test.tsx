import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CourseQuizBuilder } from "./CourseQuizBuilder";

describe("CourseQuizBuilder", () => {
  it("isolates radio groups between quiz builder instances", () => {
    render(
      <>
        <CourseQuizBuilder
          sectionIndex={0}
          itemIndex={0}
          value={{
            questions: [
              {
                text: "Question 1",
                type: "single",
                answers: [
                  { text: "Answer 1", isCorrect: true },
                  { text: "Answer 2", isCorrect: false },
                ],
              },
            ],
          }}
          onChange={vi.fn()}
        />
        <CourseQuizBuilder
          sectionIndex={1}
          itemIndex={0}
          value={{
            questions: [
              {
                text: "Question 2",
                type: "single",
                answers: [
                  { text: "Answer 3", isCorrect: false },
                  { text: "Answer 4", isCorrect: true },
                ],
              },
            ],
          }}
          onChange={vi.fn()}
        />
      </>,
    );

    const singleChoiceRadios = screen.getAllByText(/Jednokrotny/).map((label) =>
      label.querySelector("input"),
    );
    expect(singleChoiceRadios).toHaveLength(2);
    expect(singleChoiceRadios[0]).toBeChecked();
    expect(singleChoiceRadios[1]).toBeChecked();

    const correctRadios = screen
      .getAllByText("Poprawna")
      .map((label) => label.querySelector("input"));
    expect(correctRadios).toHaveLength(4);
    expect(correctRadios[0]).toBeChecked();
    expect(correctRadios[1]).not.toBeChecked();
    expect(correctRadios[2]).not.toBeChecked();
    expect(correctRadios[3]).toBeChecked();
  });
});
