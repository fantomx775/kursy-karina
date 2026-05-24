export type CourseAccessStatus = "none" | "pending" | "active" | "expired";

export type CourseAccessState = {
  status: CourseAccessStatus;
  hasEverPurchased: boolean;
  hasActiveAccess: boolean;
  hasPendingAccess: boolean;
  activeExpiresAt: string | null;
  lastExpiresAt: string | null;
};

type SupabaseQueryClient = {
  from: (table: string) => any;
};

export type CourseAccessOrderItem = {
  course_id: string;
  access_status?: string | null;
  access_expires_at: string | null;
  access_activated_at?: string | null;
};

const EMPTY_ACCESS: CourseAccessState = {
  status: "none",
  hasEverPurchased: false,
  hasActiveAccess: false,
  hasPendingAccess: false,
  activeExpiresAt: null,
  lastExpiresAt: null,
};

function compareIsoDates(a: string | null, b: string | null): number {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return new Date(a).getTime() - new Date(b).getTime();
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
  const hasPendingAccess = pendingItems.length > 0;

  const lastExpiresAt =
    activatedItems
      .map((item) => item.access_expires_at)
      .sort(compareIsoDates)
      .at(-1) ?? null;

  const activeExpiresAt =
    activatedItems
      .map((item) => item.access_expires_at)
      .filter((expiresAt): expiresAt is string => {
        if (!expiresAt) return false;
        return new Date(expiresAt).getTime() > now.getTime();
      })
      .sort(compareIsoDates)
      .at(-1) ?? null;

  const hasActiveAccess = activeExpiresAt !== null;

  return {
    status: hasActiveAccess
      ? "active"
      : hasPendingAccess
        ? "pending"
        : "expired",
    hasEverPurchased: true,
    hasActiveAccess,
    hasPendingAccess,
    activeExpiresAt,
    lastExpiresAt,
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
    .select("course_id, access_status, access_activated_at, access_expires_at")
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
    .select("course_id, access_status, access_activated_at, access_expires_at")
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
