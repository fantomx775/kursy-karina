import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/services/auth/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAdmin();
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.statusCode });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nie znaleziono pliku" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      // #region agent log
      fetch('http://127.0.0.1:7463/ingest/76655e3e-8895-4035-ade6-e75a3869f7a8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'99f69b'},body:JSON.stringify({sessionId:'99f69b',location:'api/upload/route.ts:POST',message:'File type rejected',data:{fileType:file.type,fileName:file.name},timestamp:Date.now(),hypothesisId:'svg-reject'})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { error: "Nieprawidłowy format pliku. Dozwolone są: JPG, PNG, GIF, WebP, SVG" },
        { status: 400 },
      );
    }

    const admin = createAdminSupabaseClient();

    // Sanitize original name (basename only, safe chars) + short suffix for uniqueness
    const rawName = file.name.replace(/^.*[/\\]/, ""); // basename
    const ext = rawName.includes(".") ? rawName.split(".").pop() ?? "bin" : "bin";
    const baseWithoutExt = rawName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF\-_\s]/g, "").replace(/[\s\-_]+/g, "-").replace(/^-|-$/g, "") || "file";
    const safeBase = baseWithoutExt.slice(0, 60);
    const shortId = Math.random().toString(36).substring(2, 8);
    const fileName = `course-assets/${safeBase}-${shortId}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await admin.storage
      .from("course-assets")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json(
        { error: "Wystąpił błąd podczas przesyłania pliku" },
        { status: 500 },
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = admin.storage
      .from("course-assets")
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrl,
      fileName: data.path,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Wystąpił wewnętrzny błąd serwera" },
      { status: 500 },
    );
  }
}
