import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { authenticateUser } from "@/services/auth/server";
import { getCoursesCompletion } from "@/services/certificate";
import { DashboardTabs } from "@/features/dashboard/DashboardTabs";
import type { CourseCard } from "@/features/dashboard/DashboardTabs";

/** Always fetch fresh data so purchased courses appear immediately (no stale cache). */
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const auth = await authenticateUser();
  if (!auth.success) {
    redirect("/login");
  }

  const authenticatedUser = auth.user;
  const profile = authenticatedUser.profile;
  const userId = authenticatedUser.id;
  const isAdmin = authenticatedUser.role === "admin";

  const supabase = await createServerSupabaseClient();

  // #region agent log
  fetch("http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ee7115" },
    body: JSON.stringify({
      sessionId: "ee7115",
      hypothesisId: "A",
      location: "dashboard/page.tsx:entry",
      message: "Dashboard load",
      data: { userId, isAdmin },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, created_at")
    .eq("user_id", userId)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  const orderIds = orders?.map((order) => order.id) ?? [];
  let orderItems: { course_id: string; title: string }[] = [];
  let adminCourseIds: string[] = [];
  let courseCards: CourseCard[] = [];

  // #region agent log
  fetch("http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ee7115" },
    body: JSON.stringify({
      sessionId: "ee7115",
      hypothesisId: "B",
      location: "dashboard/page.tsx:after-orders",
      message: "Orders query result",
      data: {
        ordersCount: orders?.length ?? 0,
        orderIdsLength: orderIds.length,
        ordersError: ordersError?.message ?? null,
        ordersCode: ordersError?.code ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (orderIds.length > 0) {
    const { data: purchasedItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("course_id, title")
      .in("order_id", orderIds);

    orderItems = purchasedItems ?? [];

    // #region agent log
    fetch("http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ee7115" },
      body: JSON.stringify({
        sessionId: "ee7115",
        hypothesisId: "C",
        location: "dashboard/page.tsx:after-order-items",
        message: "Order items query result",
        data: {
          orderItemsCount: orderItems.length,
          orderItemsError: orderItemsError?.message ?? null,
          orderItemsCode: orderItemsError?.code ?? null,
        },
      timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }

  if (isAdmin) {
    const { data: createdCourses, error: createdCoursesError } = await supabase
      .from("courses")
      .select("id")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    let fallbackErrorMessage: string | null = null;
    let fallbackErrorCode: string | null = null;
    let fallbackUsed = false;

    if (createdCoursesError) {
      fallbackUsed = true;
      const { data: fallbackCourses, error: fallbackCoursesError } = await supabase
        .from("courses")
        .select("id")
        .order("created_at", { ascending: false });

      adminCourseIds = fallbackCourses?.map((course) => course.id) ?? [];
      fallbackErrorMessage = fallbackCoursesError?.message ?? null;
      fallbackErrorCode = fallbackCoursesError?.code ?? null;
    } else {
      adminCourseIds = createdCourses?.map((course) => course.id) ?? [];
    }

    // #region agent log
    fetch("http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ee7115" },
      body: JSON.stringify({
        sessionId: "ee7115",
        hypothesisId: "C2",
        location: "dashboard/page.tsx:after-admin-courses",
        message: "Admin courses query result",
        data: {
          adminCoursesCount: adminCourseIds.length,
          adminCoursesError: createdCoursesError?.message ?? null,
          adminCoursesCode: createdCoursesError?.code ?? null,
          fallbackUsed,
          fallbackErrorMessage,
          fallbackErrorCode,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }

  const purchasedCourseIds = Array.from(
    new Set(orderItems.map((item) => item.course_id)),
  );
  const courseIds = Array.from(
    new Set([...purchasedCourseIds, ...adminCourseIds]),
  );
  const emptyState = courseIds.length === 0;

  if (courseIds.length > 0) {
    const purchasedTitleByCourseId = new Map(
      orderItems.map((item) => [item.course_id, item.title]),
    );

    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id, slug, title, description, status")
      .in("id", courseIds);

    // #region agent log
    fetch("http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ee7115" },
      body: JSON.stringify({
        sessionId: "ee7115",
        hypothesisId: "D",
        location: "dashboard/page.tsx:after-courses",
        message: "Courses and mapping",
        data: {
          courseIdsLength: courseIds.length,
          coursesCount: courses?.length ?? 0,
          coursesError: coursesError?.message ?? null,
          coursesCode: coursesError?.code ?? null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const completionByCourse = await getCoursesCompletion(
      supabase,
      userId,
      courseIds,
    );

    courseCards = courseIds.map((courseId) => {
      const course = courses?.find((item) => item.id === courseId);
      const courseTitle = purchasedTitleByCourseId.get(courseId) ?? course?.title ?? "Kurs";
      const completion = completionByCourse[courseId] ?? {
        totalItems: 0,
        completedItems: 0,
        percentage: 0,
      };

      return {
        id: courseId,
        title: courseTitle,
        description: course?.description ?? "",
        slug: course?.slug ?? "",
        status: course?.status ?? "inactive",
        adminAccess: isAdmin,
        completionPercentage: completion.percentage,
      };
    });
  }

  // #region agent log
  fetch("http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ee7115" },
    body: JSON.stringify({
      sessionId: "ee7115",
      hypothesisId: "E",
      location: "dashboard/page.tsx:final",
      message: "Final props to UI",
      data: { courseCardsLength: courseCards.length, emptyState },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--coffee-cream)] to-[var(--coffee-latte)]">
      <div className="page-width py-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--coffee-charcoal)]">
              Moje konto
            </h1>
            <p className="text-[var(--coffee-espresso)]">
              Twoje kursy i ustawienia konta.
            </p>
          </div>
        </div>
        <DashboardTabs
          profile={profile}
          courseCards={courseCards}
          isAdmin={isAdmin}
          emptyState={emptyState}
        />
      </div>
    </div>
  );
}
