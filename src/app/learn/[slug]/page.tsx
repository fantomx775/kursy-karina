import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { authenticateUser } from "@/services/auth/server";
import { getCourseWithContentBySlug } from "@/services/courses";
import { CourseViewer } from "@/features/courses/CourseViewer";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const auth = await authenticateUser();
  if (!auth.success) {
    redirect("/login");
  }

  const authenticatedUser = auth.user;
  const userId = authenticatedUser.id;
  const isAdmin = authenticatedUser.role === "admin";
  const supabase = await createServerSupabaseClient();

  const course = await getCourseWithContentBySlug(slug);
  if (!course) {
    notFound();
  }

  let ownsCourse = isAdmin;

  if (!ownsCourse) {
    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "paid");

    const orderIds = orders?.map((order) => order.id) ?? [];
    if (orderIds.length > 0) {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("course_id")
        .in("order_id", orderIds);

      ownsCourse = Boolean(
        orderItems?.some((item) => item.course_id === course.id),
      );
    }
  }

  if (!ownsCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--coffee-cream)] to-[var(--coffee-latte)] flex items-center justify-center page-width">
        <div className="max-w-md w-full bg-white border border-[var(--coffee-cappuccino)] border-radius shadow-md p-6 sm:p-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--coffee-charcoal)] mb-2">
            Brak dostępu
          </h1>
          <p className="text-[var(--coffee-espresso)] mb-6">
            Ten kurs nie został jeszcze zakupiony. Wróć do szczegółów kursu, aby
            sfinalizować zakup.
          </p>
          <div className="space-y-3">
            <Link
              href={`/courses/${slug}`}
              className="block border-radius bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white px-4 py-2.5 text-sm transition-colors min-h-[44px] flex items-center justify-center"
            >
              Przejdź do kursu
            </Link>
            <Link
              href="/courses"
              className="block border-radius border border-[var(--coffee-mocha)] text-[var(--coffee-mocha)] hover:bg-[var(--coffee-cream)] px-4 py-2.5 text-sm transition-colors min-h-[44px] flex items-center justify-center"
            >
              Zobacz inne kursy
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: progress } = await supabase
    .from("course_progress")
    .select("item_id, completed")
    .eq("user_id", userId)
    .eq("course_id", course.id)
    .eq("completed", true);

  const completedItemIds = progress?.map((item) => item.item_id) ?? [];

  return <CourseViewer course={course} completedItemIds={completedItemIds} />;
}
