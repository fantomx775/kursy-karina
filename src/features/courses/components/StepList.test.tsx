import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CourseSection } from "@/types/course";
import { StepList } from "./StepList";

function createSections(): CourseSection[] {
  return [
    {
      id: "section-1",
      course_id: "course-1",
      title: "Wprowadzenie",
      position: 0,
      items: [
        {
          id: "item-1",
          section_id: "section-1",
          title: "Lekcja PDF",
          kind: "svg",
          asset_path: "/lesson.svg",
          youtube_url: null,
          quiz_data: null,
          position: 0,
          is_preview: false,
        },
        {
          id: "item-2",
          section_id: "section-1",
          title: "Lekcja video",
          kind: "youtube",
          asset_path: null,
          youtube_url: "https://youtube.com/watch?v=test",
          quiz_data: null,
          position: 1,
          is_preview: false,
        },
      ],
    },
    {
      id: "section-2",
      course_id: "course-1",
      title: "Zaawansowane",
      position: 1,
      items: [
        {
          id: "item-3",
          section_id: "section-2",
          title: "Quiz kontrolny",
          kind: "quiz",
          asset_path: null,
          youtube_url: null,
          quiz_data: { questions: [] },
          position: 0,
          is_preview: false,
        },
      ],
    },
  ];
}

describe("StepList", () => {
  it("groups lessons by section and labels svg lessons as PDF", async () => {
    const user = userEvent.setup();
    const onSelectItem = vi.fn();

    render(
      <StepList
        sections={createSections()}
        activeItemId="item-1"
        completedIds={{ "item-1": true }}
        onSelectItem={onSelectItem}
      />,
    );

    expect(screen.getByRole("heading", { name: "Wprowadzenie" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Zaawansowane" })).toBeVisible();
    expect(screen.getByText("1/2")).toBeVisible();
    expect(screen.getByText("0/1")).toBeVisible();
    expect(screen.getAllByText("PDF")).not.toHaveLength(0);
    expect(screen.queryByText("Tekst")).not.toBeInTheDocument();
    expect(screen.queryByText("OK")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Lekcja PDF/ }));

    expect(onSelectItem).toHaveBeenCalledWith("item-1");
  });
});
