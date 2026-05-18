import { describe, expect, it } from "vitest";
import {
  getCourseDescriptionExcerpt,
  getCourseDescriptionHtml,
  getCourseDescriptionPlainText,
} from "./courseDescription";

describe("courseDescription", () => {
  it("creates a plain text excerpt from rich text", () => {
    expect(
      getCourseDescriptionExcerpt(
        "<h2>ETAP 1</h2><p>To jest bardzo dlugi opis kursu z formatowaniem.</p>",
        15,
      ),
    ).toBe("ETAP 1 To jest...");
  });

  it("formats legacy stage labels as headings", () => {
    expect(getCourseDescriptionHtml("Intro ETAP 1: Teoria ETAP 2: Praktyka"))
      .toContain("<h2>ETAP 1</h2><p>Teoria</p><h2>ETAP 2</h2>");
    expect(getCourseDescriptionHtml("Intro ETAP1 Teoria ETAP2 Praktyka"))
      .toContain("<h2>ETAP1</h2><p>Teoria</p><h2>ETAP2</h2>");
  });

  it("removes unsafe rich text tags and attributes", () => {
    const html = getCourseDescriptionHtml(
      '<p onclick="alert(1)">Opis</p><script>alert(1)</script><a href="javascript:alert(1)">link</a>',
    );

    expect(html).toBe("<p>Opis</p><a>link</a>");
    expect(getCourseDescriptionPlainText(html)).toBe("Opis link");
  });
});
