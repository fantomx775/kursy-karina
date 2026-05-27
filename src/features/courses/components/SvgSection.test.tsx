import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SvgSection } from "./SvgSection";

describe("SvgSection", () => {
  it("renders the PDF preview without wrapping it in a link", () => {
    render(<SvgSection src="/course-assets/lesson.svg" alt="Lekcja PDF" />);

    const image = screen.getByRole("img", { name: "Lekcja PDF" });

    expect(image).toBeVisible();
    expect(image).toHaveAttribute("draggable", "false");
    expect(image.closest("a")).toBeNull();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
