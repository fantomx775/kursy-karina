import { couponInputSchema } from "@/lib/validators/coupon";
import { authenticateAdmin } from "@/services/auth/server";
import {
  syncCouponCourseRules,
  uniqueCouponCourseIds,
} from "@/services/couponCourseRules";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

type AdminClient = ReturnType<typeof createAdminSupabaseClient>;
type CouponCourseLink = {
  coupon_id: string;
  course_id: string;
};
type CouponCourseSummary = {
  id: string;
  title: string;
};

async function fetchCouponCourseRules(admin: AdminClient, couponIds: string[]) {
  const empty = {
    applicableCourseIdsByCoupon: new Map<string, string[]>(),
    requiredCourseIdsByCoupon: new Map<string, string[]>(),
    applicableCoursesByCoupon: new Map<string, CouponCourseSummary[]>(),
    requiredCoursesByCoupon: new Map<string, CouponCourseSummary[]>(),
  };

  if (couponIds.length === 0) return empty;

  const [{ data: applicableRows }, { data: requiredRows }] = await Promise.all([
    admin
      .from("coupon_applicable_courses")
      .select("coupon_id, course_id")
      .in("coupon_id", couponIds),
    admin
      .from("coupon_required_courses")
      .select("coupon_id, course_id")
      .in("coupon_id", couponIds),
  ]);

  const allLinks = [
    ...((applicableRows as CouponCourseLink[] | null) ?? []),
    ...((requiredRows as CouponCourseLink[] | null) ?? []),
  ];
  const courseIds = uniqueCouponCourseIds(
    allLinks.map((link) => link.course_id),
  );
  const courseTitles = new Map<string, string>();

  if (courseIds.length > 0) {
    const { data: courses } = await admin
      .from("courses")
      .select("id, title")
      .in("id", courseIds);

    courses?.forEach((course) => {
      courseTitles.set(course.id, course.title);
    });
  }

  const buildMaps = (rows: CouponCourseLink[] | null) => {
    const idsByCoupon = new Map<string, string[]>();
    const coursesByCoupon = new Map<string, CouponCourseSummary[]>();

    rows?.forEach((row) => {
      const ids = idsByCoupon.get(row.coupon_id) ?? [];
      ids.push(row.course_id);
      idsByCoupon.set(row.coupon_id, ids);

      const courses = coursesByCoupon.get(row.coupon_id) ?? [];
      courses.push({
        id: row.course_id,
        title: courseTitles.get(row.course_id) ?? "Kurs",
      });
      coursesByCoupon.set(row.coupon_id, courses);
    });

    return { idsByCoupon, coursesByCoupon };
  };

  const applicable = buildMaps(
    (applicableRows as CouponCourseLink[] | null) ?? null,
  );
  const required = buildMaps(
    (requiredRows as CouponCourseLink[] | null) ?? null,
  );

  return {
    applicableCourseIdsByCoupon: applicable.idsByCoupon,
    requiredCourseIdsByCoupon: required.idsByCoupon,
    applicableCoursesByCoupon: applicable.coursesByCoupon,
    requiredCoursesByCoupon: required.coursesByCoupon,
  };
}

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const admin = createAdminSupabaseClient();
  const { data: coupons, error } = await admin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }

  const couponIds = coupons?.map((coupon) => coupon.id) ?? [];
  const usageMap = new Map<string, { count: number; total: number }>();

  if (couponIds.length > 0) {
    const { data: usage } = await admin
      .from("coupon_usage")
      .select("coupon_id, discount_amount")
      .in("coupon_id", couponIds);

    usage?.forEach((entry) => {
      const current = usageMap.get(entry.coupon_id) ?? { count: 0, total: 0 };
      current.count += 1;
      current.total += entry.discount_amount;
      usageMap.set(entry.coupon_id, current);
    });
  }

  const {
    applicableCourseIdsByCoupon,
    requiredCourseIdsByCoupon,
    applicableCoursesByCoupon,
    requiredCoursesByCoupon,
  } = await fetchCouponCourseRules(admin, couponIds);

  const result =
    coupons?.map((coupon) => {
      const usageStats = usageMap.get(coupon.id) ?? { count: 0, total: 0 };
      return {
        id: coupon.id,
        name: coupon.name,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value / 100,
        startDate: coupon.start_date,
        endDate: coupon.end_date,
        usageLimit: coupon.usage_limit,
        usageLimitPerUser: coupon.usage_limit_per_user,
        isActive: coupon.is_active,
        applicableCourseIds: applicableCourseIdsByCoupon.get(coupon.id) ?? [],
        requiredCourseIds: requiredCourseIdsByCoupon.get(coupon.id) ?? [],
        applicableCourses: applicableCoursesByCoupon.get(coupon.id) ?? [],
        requiredCourses: requiredCoursesByCoupon.get(coupon.id) ?? [],
        createdAt: coupon.created_at,
        usageCount: usageStats.count,
        totalDiscountGiven: usageStats.total / 100,
      };
    }) ?? [];

  return Response.json({ coupons: result });
}

export async function POST(request: Request) {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const payload = await request.json();
  const parsed = couponInputSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = createAdminSupabaseClient();
  const {
    name,
    code,
    discountType,
    discountValue,
    startDate,
    endDate,
    usageLimit,
    usageLimitPerUser,
    isActive,
    applicableCourseIds,
    requiredCourseIds,
  } = parsed.data;

  const normalizedCode = code.toUpperCase();

  const { data: existing } = await admin
    .from("coupons")
    .select("id")
    .eq("code", normalizedCode)
    .maybeSingle();

  if (existing) {
    return Response.json(
      { error: "Coupon code already exists" },
      { status: 400 },
    );
  }

  const { data: coupon, error } = await admin
    .from("coupons")
    .insert({
      name,
      code: normalizedCode,
      discount_type: discountType,
      discount_value: Math.round(discountValue * 100),
      start_date: startDate,
      end_date: endDate ?? null,
      usage_limit: usageLimit ?? null,
      usage_limit_per_user: usageLimitPerUser ?? null,
      is_active: isActive ?? true,
    })
    .select()
    .single();

  if (error || !coupon) {
    return Response.json({ error: "Failed to create coupon" }, { status: 500 });
  }

  const rulesError = await syncCouponCourseRules({
    admin,
    couponId: coupon.id,
    applicableCourseIds,
    requiredCourseIds,
  });

  if (rulesError) {
    await admin.from("coupons").delete().eq("id", coupon.id);
    return Response.json(
      { error: "Failed to save coupon course rules" },
      { status: 500 },
    );
  }

  return Response.json({ coupon }, { status: 201 });
}
