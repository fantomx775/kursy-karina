export type CourseAccessStatus =
  | "none"
  | "pending"
  | "active"
  | "expired"
  | "revoked";

export type CourseAccessState = {
  status: CourseAccessStatus;
  hasEverPurchased: boolean;
  hasActiveAccess: boolean;
  hasPendingAccess: boolean;
  activeActivatedAt: string | null;
  activeExpiresAt: string | null;
  lastActivatedAt: string | null;
  lastExpiresAt: string | null;
  accessDurationMonths: number | null;
};

type SupabaseQueryClient = {
  from: (table: string) => any;
};

export type CourseAccessOrderItem = {
  course_id: string;
  access_status?: string | null;
  access_expires_at: string | null;
  access_activated_at?: string | null;
  access_duration_months?: number | null;
  created_at?: string | null;
};

const EMPTY_ACCESS: CourseAccessState = {
  status: "none",
  hasEverPurchased: false,
  hasActiveAccess: false,
  hasPendingAccess: false,
  activeActivatedAt: null,
  activeExpiresAt: null,
  lastActivatedAt: null,
  lastExpiresAt: null,
  accessDurationMonths: null,
};

function compareIsoDates(a: string | null, b: string | null): number {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return new Date(a).getTime() - new Date(b).getTime();
}

function compareAccessItemsByDate(
  a: CourseAccessOrderItem,
  b: CourseAccessOrderItem,
): number {
  const aDate =
    a.access_expires_at ?? a.access_activated_at ?? a.created_at ?? null;
  const bDate =
    b.access_expires_at ?? b.access_activated_at ?? b.created_at ?? null;
  return compareIsoDates(aDate, bDate);
}

export function resolveCourseAccessState(
  items: CourseAccessOrderItem[],
  now = new Date(),
): CourseAccessState {
  if (items.length === 0) {
    return EMPTY_ACCESS;
  }

  const activatedItems = items.filter(
    (item) => (item.access_status ?? "active") === "active",
  );
  const pendingItems = items.filter((item) => item.access_status === "pending");
  const revokedItems = items.filter((item) => item.access_status === "revoked");
  const hasPendingAccess = pendingItems.length > 0;
  const sortedActivatedItems = [...activatedItems].sort(
    compareAccessItemsByDate,
  );
  const sortedPendingItems = [...pendingItems].sort(compareAccessItemsByDate);
  const sortedHistoricalAccessItems = [
    ...activatedItems,
    ...revokedItems,
  ].sort(compareAccessItemsByDate);

  const lastAccessItem = sortedHistoricalAccessItems.at(-1) ?? null;
  const lastExpiresAt = lastAccessItem?.access_expires_at ?? null;
  const lastActivatedAt = lastAccessItem?.access_activated_at ?? null;

  const activeItem =
    sortedActivatedItems
      .filter((item) => {
        if (!item.access_expires_at) return false;
        return new Date(item.access_expires_at).getTime() > now.getTime();
      })
      .at(-1) ?? null;
  const pendingItem = sortedPendingItems.at(-1) ?? null;
  const lastActivatedItem = sortedActivatedItems.at(-1) ?? null;
  const activeExpiresAt = activeItem?.access_expires_at ?? null;
  const activeActivatedAt = activeItem?.access_activated_at ?? null;

  const hasActiveAccess = activeExpiresAt !== null;

  return {
    status: hasActiveAccess
      ? "active"
      : hasPendingAccess
        ? "pending"
        : lastAccessItem?.access_status === "revoked"
          ? "revoked"
          : "expired",
    hasEverPurchased: true,
    hasActiveAccess,
    hasPendingAccess,
    activeActivatedAt,
    activeExpiresAt,
    lastActivatedAt,
    lastExpiresAt,
    accessDurationMonths:
      activeItem?.access_duration_months ??
      pendingItem?.access_duration_months ??
      lastAccessItem?.access_duration_months ??
      lastActivatedItem?.access_duration_months ??
      null,
  };
}

export async function getPaidOrderIds(
  supabase: SupabaseQueryClient,
  userId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "paid");

  return data?.map((order: { id: string }) => order.id) ?? [];
}

export async function getUserCourseAccess(
  supabase: SupabaseQueryClient,
  userId: string,
  courseId: string,
): Promise<CourseAccessState> {
  const orderIds = await getPaidOrderIds(supabase, userId);
  if (orderIds.length === 0) {
    return EMPTY_ACCESS;
  }

  const { data } = await supabase
    .from("order_items")
    .select(
      "course_id, access_status, access_activated_at, access_expires_at, access_duration_months, created_at",
    )
    .eq("course_id", courseId)
    .in("order_id", orderIds);

  return resolveCourseAccessState((data ?? []) as CourseAccessOrderItem[]);
}

export async function getUserCourseAccessMap(
  supabase: SupabaseQueryClient,
  userId: string,
  courseIds: string[],
): Promise<Record<string, CourseAccessState>> {
  const uniqueCourseIds = Array.from(new Set(courseIds));
  const accessByCourseId = Object.fromEntries(
    uniqueCourseIds.map((courseId) => [courseId, EMPTY_ACCESS]),
  ) as Record<string, CourseAccessState>;

  if (uniqueCourseIds.length === 0) {
    return accessByCourseId;
  }

  const orderIds = await getPaidOrderIds(supabase, userId);
  if (orderIds.length === 0) {
    return accessByCourseId;
  }

  const { data } = await supabase
    .from("order_items")
    .select(
      "course_id, access_status, access_activated_at, access_expires_at, access_duration_months, created_at",
    )
    .in("course_id", uniqueCourseIds)
    .in("order_id", orderIds);

  const itemsByCourseId = new Map<string, CourseAccessOrderItem[]>();
  ((data ?? []) as CourseAccessOrderItem[]).forEach((item) => {
    const items = itemsByCourseId.get(item.course_id) ?? [];
    items.push(item);
    itemsByCourseId.set(item.course_id, items);
  });

  uniqueCourseIds.forEach((courseId) => {
    accessByCourseId[courseId] = resolveCourseAccessState(
      itemsByCourseId.get(courseId) ?? [],
    );
  });

  return accessByCourseId;
}
