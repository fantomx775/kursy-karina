import { describe, expect, it } from "vitest";
import {
  getYouTubeVideoId,
  toYouTubeEmbedUrl,
  toYouTubeThumbnailUrl,
} from "./youtube";

describe("youtube utils", () => {
  it("extracts video id from watch url", () => {
    expect(
      getYouTubeVideoId("https://www.youtube.com/watch?v=dGcsHMXbSOA"),
    ).toBe("dGcsHMXbSOA");
  });

  it("extracts video id from youtu.be url", () => {
    expect(getYouTubeVideoId("https://youtu.be/dGcsHMXbSOA")).toBe(
      "dGcsHMXbSOA",
    );
  });

  it("extracts video id from embed url", () => {
    expect(
      getYouTubeVideoId("https://www.youtube.com/embed/dGcsHMXbSOA"),
    ).toBe("dGcsHMXbSOA");
  });

  it("builds embed and thumbnail urls", () => {
    const url = "https://www.youtube.com/watch?v=dGcsHMXbSOA";
    expect(toYouTubeEmbedUrl(url)).toBe(
      "https://www.youtube.com/embed/dGcsHMXbSOA",
    );
    expect(toYouTubeThumbnailUrl("dGcsHMXbSOA")).toBe(
      "https://img.youtube.com/vi/dGcsHMXbSOA/hqdefault.jpg",
    );
  });
});
