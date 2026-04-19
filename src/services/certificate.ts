"server-only";

import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { SupabaseClient } from "@supabase/supabase-js";

// Full TTF fonts (not subset) so all Latin + Latin Extended glyphs map correctly in pdf-lib.
const OPEN_SANS_REGULAR_URL =
  "https://cdn.jsdelivr.net/gh/googlefonts/opensans@main/fonts/ttf/OpenSans-Regular.ttf";
const OPEN_SANS_BOLD_URL =
  "https://cdn.jsdelivr.net/gh/googlefonts/opensans@main/fonts/ttf/OpenSans-Bold.ttf";

const fontCache: { regular: Uint8Array | null; bold: Uint8Array | null } = {
  regular: null,
  bold: null,
};

async function loadFont(
  url: string,
  key: "regular" | "bold",
): Promise<Uint8Array> {
  if (fontCache[key]) return fontCache[key]!;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load font: ${res.status}`);
  const ab = await res.arrayBuffer();
  const bytes = new Uint8Array(ab);
  fontCache[key] = bytes;
  return bytes;
}

export type CourseCompletion = {
  totalItems: number;
  completedItems: number;
  percentage: number;
};

export type CertificateGrant = {
  granted: boolean;
  grantedAt: string | null;
};

/**
 * Computes course completion for a single course.
 * Uses the same logic as dashboard: totalItems = count of course_items (via sections),
 * completedItems = count of course_progress with completed=true.
 */
export async function getCourseCompletion(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<CourseCompletion> {
  const { data: sections } = await supabase
    .from("course_sections")
    .select("id")
    .eq("course_id", courseId);

  const sectionIds = sections?.map((section) => section.id) ?? [];
  if (sectionIds.length === 0) {
    return { totalItems: 0, completedItems: 0, percentage: 0 };
  }

  const { data: items } = await supabase
    .from("course_items")
    .select("id")
    .in("section_id", sectionIds);

  const totalItems = items?.length ?? 0;

  const { data: progress } = await supabase
    .from("course_progress")
    .select("item_id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("completed", true);

  const completedItems = progress?.length ?? 0;
  const percentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return { totalItems, completedItems, percentage };
}

/**
 * Batch version: completion for multiple courses (same query pattern as dashboard).
 */
export async function getCoursesCompletion(
  supabase: SupabaseClient,
  userId: string,
  courseIds: string[],
): Promise<Record<string, CourseCompletion>> {
  if (courseIds.length === 0) return {};

  const { data: sections } = await supabase
    .from("course_sections")
    .select("id, course_id")
    .in("course_id", courseIds);

  const sectionIds = sections?.map((section) => section.id) ?? [];
  const totalItemsByCourse = new Map<string, number>();

  let items: { id: string; section_id: string }[] = [];
  if (sectionIds.length > 0) {
    const { data: itemsData } = await supabase
      .from("course_items")
      .select("id, section_id")
      .in("section_id", sectionIds);
    items = itemsData ?? [];
  }

  sections?.forEach((section) => {
    const count = items.filter((item) => item.section_id === section.id).length;
    totalItemsByCourse.set(
      section.course_id,
      (totalItemsByCourse.get(section.course_id) ?? 0) + count,
    );
  });

  const { data: progress } = await supabase
    .from("course_progress")
    .select("course_id")
    .eq("user_id", userId)
    .eq("completed", true)
    .in("course_id", courseIds);

  const completedByCourse = new Map<string, number>();
  progress?.forEach((entry) => {
    completedByCourse.set(
      entry.course_id,
      (completedByCourse.get(entry.course_id) ?? 0) + 1,
    );
  });

  const result: Record<string, CourseCompletion> = {};
  courseIds.forEach((courseId) => {
    const totalItems = totalItemsByCourse.get(courseId) ?? 0;
    const completedItems = completedByCourse.get(courseId) ?? 0;
    const percentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    result[courseId] = { totalItems, completedItems, percentage };
  });

  return result;
}

export async function getCertificateGrant(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
): Promise<CertificateGrant> {
  const { data } = await supabase
    .from("course_certificates")
    .select("granted_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  return {
    granted: Boolean(data?.granted_at),
    grantedAt: data?.granted_at ?? null,
  };
}

export async function getCertificateGrants(
  supabase: SupabaseClient,
  userId: string,
  courseIds: string[],
): Promise<Record<string, CertificateGrant>> {
  if (courseIds.length === 0) return {};

  const { data } = await supabase
    .from("course_certificates")
    .select("course_id, granted_at")
    .eq("user_id", userId)
    .in("course_id", courseIds);

  const result: Record<string, CertificateGrant> = {};
  courseIds.forEach((courseId) => {
    result[courseId] = {
      granted: false,
      grantedAt: null,
    };
  });

  data?.forEach((entry) => {
    result[entry.course_id] = {
      granted: true,
      grantedAt: entry.granted_at,
    };
  });

  return result;
}

export type CertificateData = {
  firstName: string;
  lastName: string;
  courseTitle: string;
  issuedAt: string;
};

/**
 * Generates a simple certificate PDF. Template can be replaced later.
 * Uses Open Sans (latin-ext) so Polish characters render correctly in pdf-lib.
 */
export async function generateCertificatePdf(
  data: CertificateData,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const [fontBytesRegular, fontBytesBold] = await Promise.all([
    loadFont(OPEN_SANS_REGULAR_URL, "regular"),
    loadFont(OPEN_SANS_BOLD_URL, "bold"),
  ]);

  const font = await doc.embedFont(fontBytesRegular);
  const fontBold = await doc.embedFont(fontBytesBold);

  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const titleSize = 22;
  const bodySize = 14;
  const margin = 50;
  let y = height - margin - 80;

  const title = "Certyfikat kursu";
  const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y,
    font: fontBold,
    size: titleSize,
  });
  y -= 60;

  const line1 = "Niniejszym potwierdza sie, ze";
  const line1Width = font.widthOfTextAtSize(line1, bodySize);
  page.drawText(line1, {
    x: (width - line1Width) / 2,
    y,
    font,
    size: bodySize,
  });
  y -= 28;

  const fullName = `${data.firstName} ${data.lastName}`;
  const nameWidth = fontBold.widthOfTextAtSize(fullName, 18);
  page.drawText(fullName, {
    x: (width - nameWidth) / 2,
    y,
    font: fontBold,
    size: 18,
  });
  y -= 36;

  const line2 = "otrzymuje certyfikat za kurs";
  const line2Width = font.widthOfTextAtSize(line2, bodySize);
  page.drawText(line2, {
    x: (width - line2Width) / 2,
    y,
    font,
    size: bodySize,
  });
  y -= 28;

  const courseWidth = fontBold.widthOfTextAtSize(data.courseTitle, 16);
  page.drawText(data.courseTitle, {
    x: (width - courseWidth) / 2,
    y,
    font: fontBold,
    size: 16,
  });
  y -= 40;

  const dateLabel = `Data wydania: ${data.issuedAt}`;
  const dateWidth = font.widthOfTextAtSize(dateLabel, bodySize);
  page.drawText(dateLabel, {
    x: (width - dateWidth) / 2,
    y,
    font,
    size: bodySize,
  });

  return doc.save();
}
