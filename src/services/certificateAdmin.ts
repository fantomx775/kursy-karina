"server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CertificateAdminData,
  CertificateEligibleStudent,
} from "@/types/certificate";
import { getCertificateTemplates } from "@/services/certificateTemplates";

type StudentRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

type OrderRow = {
  id: string;
  user_id: string;
};

type OrderItemRow = {
  order_id: string;
  course_id: string;
  title: string;
};

export async function getCertificateEligibleStudents(
  supabase: SupabaseClient,
): Promise<CertificateEligibleStudent[]> {
  const { data: students } = await supabase
    .from("users")
    .select("id, first_name, last_name, email")
    .eq("role", "student");

  const studentById = new Map(
    ((students ?? []) as StudentRow[]).map((student) => [student.id, student]),
  );
  if (studentById.size === 0) {
    return [];
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, user_id")
    .in("user_id", Array.from(studentById.keys()))
    .eq("status", "paid");

  const orderRows = (orders ?? []) as OrderRow[];
  const orderIds = orderRows.map((order) => order.id);
  const userIdByOrderId = new Map(
    orderRows.map((order) => [order.id, order.user_id]),
  );
  if (orderIds.length === 0) {
    return [];
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("order_id, course_id, title")
    .in("order_id", orderIds);

  const itemRows = (orderItems ?? []) as OrderItemRow[];
  const courseIds = Array.from(
    new Set(itemRows.map((item) => item.course_id).filter(Boolean)),
  );
  if (courseIds.length === 0) {
    return [];
  }

  const { data: sections } = await supabase
    .from("course_sections")
    .select("id, course_id")
    .in("course_id", courseIds);

  const sectionIds = sections?.map((section) => section.id) ?? [];
  const { data: courseItems } =
    sectionIds.length > 0
      ? await supabase
          .from("course_items")
          .select("id, section_id")
          .in("section_id", sectionIds)
      : { data: [] };

  const totalItemsByCourse = new Map<string, number>();
  sections?.forEach((section) => {
    const count =
      courseItems?.filter((item) => item.section_id === section.id).length ?? 0;
    totalItemsByCourse.set(
      section.course_id,
      (totalItemsByCourse.get(section.course_id) ?? 0) + count,
    );
  });

  const studentIds = Array.from(studentById.keys());
  const { data: progress } = await supabase
    .from("course_progress")
    .select("user_id, course_id, item_id")
    .in("user_id", studentIds)
    .in("course_id", courseIds)
    .eq("completed", true);

  const completedByStudentCourse = new Map<string, number>();
  progress?.forEach((entry) => {
    const key = `${entry.user_id}:${entry.course_id}`;
    completedByStudentCourse.set(
      key,
      (completedByStudentCourse.get(key) ?? 0) + 1,
    );
  });

  const { data: grants } = await supabase
    .from("course_certificates")
    .select("user_id, course_id")
    .in("user_id", studentIds)
    .in("course_id", courseIds);

  const grantedPairs = new Set(
    grants?.map((grant) => `${grant.user_id}:${grant.course_id}`) ?? [],
  );

  const seenPairs = new Set<string>();
  const eligible: CertificateEligibleStudent[] = [];
  itemRows.forEach((item) => {
    const userId = userIdByOrderId.get(item.order_id);
    if (!userId) {
      return;
    }

    const pair = `${userId}:${item.course_id}`;
    if (seenPairs.has(pair) || grantedPairs.has(pair)) {
      return;
    }

    const totalItems = totalItemsByCourse.get(item.course_id) ?? 0;
    const completedItems = completedByStudentCourse.get(pair) ?? 0;
    if (totalItems === 0 || completedItems < totalItems) {
      return;
    }

    const student = studentById.get(userId);
    if (!student) {
      return;
    }

    seenPairs.add(pair);
    eligible.push({
      studentId: userId,
      studentName: `${student.first_name} ${student.last_name}`,
      studentEmail: student.email,
      courseId: item.course_id,
      courseTitle: item.title,
      completedItems,
      totalItems,
    });
  });

  return eligible.sort((left, right) =>
    left.studentName.localeCompare(right.studentName, "pl"),
  );
}

export async function getCertificateAdminData(
  supabase: SupabaseClient,
): Promise<CertificateAdminData> {
  const [templates, eligibleStudents] = await Promise.all([
    getCertificateTemplates(supabase),
    getCertificateEligibleStudents(supabase),
  ]);

  return {
    templates,
    eligibleStudents,
    actionRequiredCount: eligibleStudents.length,
  };
}
