import { describe, expect, it } from "vitest";
import { buildAuthPath, getSafeRedirectPath } from "./authRedirect";

describe("getSafeRedirectPath", () => {
  it("returns default for missing or empty values", () => {
    expect(getSafeRedirectPath(null)).toBe("/dashboard");
    expect(getSafeRedirectPath(undefined)).toBe("/dashboard");
    expect(getSafeRedirectPath("")).toBe("/dashboard");
    expect(getSafeRedirectPath("   ")).toBe("/dashboard");
  });

  it("accepts safe relative paths", () => {
    expect(getSafeRedirectPath("/cart")).toBe("/cart");
    expect(getSafeRedirectPath("/courses/nodejs")).toBe("/courses/nodejs");
  });

  it("rejects external and protocol-relative URLs", () => {
    expect(getSafeRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(getSafeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(getSafeRedirectPath("/path//evil")).toBe("/path//evil");
  });
});

describe("buildAuthPath", () => {
  it("builds paths without query when options are omitted", () => {
    expect(buildAuthPath("/register")).toBe("/register");
    expect(buildAuthPath("/login")).toBe("/login");
  });

  it("includes next and intent query params", () => {
    expect(
      buildAuthPath("/register", { next: "/cart", intent: "purchase" }),
    ).toBe("/register?next=%2Fcart&intent=purchase");
  });
});
