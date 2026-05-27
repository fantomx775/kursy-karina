import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CourseItem } from "@/types/course";
import { CourseStepCard } from "./CourseStepCard";

const pdfItem: CourseItem = {
  id: "item-1",
  section_id: "section-1",
  title: "Materiał PDF",
  kind: "svg",
  asset_path: "/lesson.svg",
  youtube_url: null,
  quiz_data: null,
  position: 0,
  is_preview: false,
};

describe("CourseStepCard", () => {
  it("uses PDF copy and green styling for completed PDF lessons", () => {
    const { container } = render(
      <CourseStepCard
        item={pdfItem}
        isCompleted
        onToggleCompleted={vi.fn()}
        onQuizPassed={vi.fn()}
      />,
    );

    expect(screen.getByText("PDF")).toBeVisible();
    expect(screen.queryByText("Tekst")).not.toBeInTheDocument();
    expect(screen.getByText("Ukończone")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Oznacz jako nieukonczone" }),
    ).toHaveClass("border-emerald-300", "text-emerald-800");
    expect(container.querySelector("section")).toHaveClass(
      "border-emerald-200",
      "bg-emerald-50/80",
    );
  });
});
