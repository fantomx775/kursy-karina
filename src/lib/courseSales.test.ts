import { describe, expect, it } from "vitest";
import { resolveCourseSaleState } from "./courseSales";

describe("resolveCourseSaleState", () => {
  const now = new Date("2026-06-10T10:00:00.000Z");

  it("keeps active always-open courses purchasable", () => {
    expect(
      resolveCourseSaleState(
        {
          status: "active",
          sale_mode: "always_open",
          sale_windows: [],
        },
        now,
      ),
    ).toMatchObject({
      status: "open",
      isOpen: true,
    });
  });

  it("opens scheduled sales only inside an active window", () => {
    expect(
      resolveCourseSaleState(
        {
          status: "active",
          sale_mode: "scheduled",
          sale_windows: [
            {
              starts_at: "2026-06-01T00:00:00.000Z",
              ends_at: "2026-06-14T23:59:59.999Z",
            },
          ],
        },
        now,
      ),
    ).toMatchObject({
      status: "open",
      isOpen: true,
    });
  });

  it("returns coming soon outside scheduled sale windows", () => {
    const state = resolveCourseSaleState(
      {
        status: "active",
        sale_mode: "scheduled",
        sale_windows: [
          {
            starts_at: "2026-07-01T00:00:00.000Z",
            ends_at: "2026-07-14T23:59:59.999Z",
          },
        ],
      },
      now,
    );

    expect(state).toMatchObject({
      status: "coming_soon",
      isOpen: false,
    });
    expect(state.nextWindow?.starts_at).toBe("2026-07-01T00:00:00.000Z");
  });
});
