import type { Course, CourseSaleWindow } from "@/types/course";

export type CourseSaleStatus = "open" | "coming_soon" | "inactive";

export type CourseSaleState = {
  status: CourseSaleStatus;
  isOpen: boolean;
  activeWindow: CourseSaleWindow | null;
  nextWindow: CourseSaleWindow | null;
};

function getTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

export function getSortedSaleWindows(
  windows: CourseSaleWindow[] | undefined,
): CourseSaleWindow[] {
  return [...(windows ?? [])]
    .filter((window) => {
      const startsAt = getTime(window.starts_at);
      const endsAt = getTime(window.ends_at);
      return startsAt !== null && endsAt !== null && endsAt > startsAt;
    })
    .sort(
      (a, b) =>
        (getTime(a.starts_at) ?? Number.MAX_SAFE_INTEGER) -
        (getTime(b.starts_at) ?? Number.MAX_SAFE_INTEGER),
    );
}

export function resolveCourseSaleState(
  course: Pick<Course, "status" | "sale_mode" | "sale_windows">,
  now = new Date(),
): CourseSaleState {
  if (course.status !== "active") {
    return {
      status: "inactive",
      isOpen: false,
      activeWindow: null,
      nextWindow: null,
    };
  }

  if ((course.sale_mode ?? "always_open") === "always_open") {
    return {
      status: "open",
      isOpen: true,
      activeWindow: null,
      nextWindow: null,
    };
  }

  const nowTime = now.getTime();
  const windows = getSortedSaleWindows(course.sale_windows);
  const activeWindow =
    windows.find((window) => {
      const startsAt = getTime(window.starts_at);
      const endsAt = getTime(window.ends_at);
      return (
        startsAt !== null &&
        endsAt !== null &&
        startsAt <= nowTime &&
        nowTime <= endsAt
      );
    }) ?? null;

  if (activeWindow) {
    return {
      status: "open",
      isOpen: true,
      activeWindow,
      nextWindow: null,
    };
  }

  return {
    status: "coming_soon",
    isOpen: false,
    activeWindow: null,
    nextWindow:
      windows.find((window) => {
        const startsAt = getTime(window.starts_at);
        return startsAt !== null && startsAt > nowTime;
      }) ?? null,
  };
}

export function formatSaleWindowDate(iso: string | null | undefined): string {
  const time = getTime(iso);
  if (time === null) return "";

  return new Date(time).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatSaleWindowRange(
  window: CourseSaleWindow | null | undefined,
): string {
  if (!window) return "";

  const startsAt = formatSaleWindowDate(window.starts_at);
  const endsAt = formatSaleWindowDate(window.ends_at);
  if (!startsAt || !endsAt) return "";

  return startsAt === endsAt ? startsAt : `${startsAt} - ${endsAt}`;
}
