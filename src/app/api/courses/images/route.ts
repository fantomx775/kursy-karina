import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/courses/images?ids=id1,id2
 * Returns { [courseId]: main_image_url } for cart hydration when items lack imageUrl.
 */
export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids");
  if (!idsParam) {
    return Response.json({}, { status: 200 });
  }
  const ids = idsParam.split(",").filter(Boolean).slice(0, 20);
  if (ids.length === 0) {
    return Response.json({}, { status: 200 });
  }

  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("courses")
    .select("id, main_image_url")
    .in("id", ids);

  const map: Record<string, string | null> = {};
  data?.forEach((row) => {
    map[row.id] = row.main_image_url ?? null;
  });
  return Response.json(map);
}
