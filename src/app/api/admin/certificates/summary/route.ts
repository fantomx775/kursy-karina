import { authenticateAdmin } from "@/services/auth/server";
import { getCertificateEligibleStudents } from "@/services/certificateAdmin";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode });
  }

  const admin = createAdminSupabaseClient();
  const eligibleStudents = await getCertificateEligibleStudents(admin);
  return Response.json({ actionRequiredCount: eligibleStudents.length });
}
