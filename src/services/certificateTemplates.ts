"server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CERTIFICATE_STORAGE_BUCKET,
  DEFAULT_CERTIFICATE_TEMPLATE_ID,
  type CertificateTemplate,
  type CertificateTemplateId,
} from "@/lib/certificateTemplates";

type CertificateTemplateRow = {
  id: string;
  name: string;
  storage_bucket: string;
  storage_path: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type CertificateTemplateInput = {
  id: CertificateTemplateId;
  name: string;
  storagePath: string;
};

export function mapCertificateTemplateRow(
  row: CertificateTemplateRow,
): CertificateTemplate {
  return {
    id: row.id,
    name: row.name,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCertificateTemplates(
  supabase: SupabaseClient,
): Promise<CertificateTemplate[]> {
  const { data, error } = await supabase
    .from("certificate_templates")
    .select(
      "id, name, storage_bucket, storage_path, is_active, created_at, updated_at",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    mapCertificateTemplateRow(row as CertificateTemplateRow),
  );
}

export async function getCertificateTemplateById(
  supabase: SupabaseClient,
  templateId: CertificateTemplateId | null | undefined,
): Promise<CertificateTemplate | null> {
  const id = templateId?.trim() || DEFAULT_CERTIFICATE_TEMPLATE_ID;
  const { data, error } = await supabase
    .from("certificate_templates")
    .select(
      "id, name, storage_bucket, storage_path, is_active, created_at, updated_at",
    )
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data && id !== DEFAULT_CERTIFICATE_TEMPLATE_ID) {
    return getCertificateTemplateById(
      supabase,
      DEFAULT_CERTIFICATE_TEMPLATE_ID,
    );
  }

  return data
    ? mapCertificateTemplateRow(data as CertificateTemplateRow)
    : null;
}

export async function downloadCertificateTemplateBytes(
  supabase: SupabaseClient,
  template: CertificateTemplate,
): Promise<Uint8Array> {
  const { data, error } = await supabase.storage
    .from(template.storageBucket)
    .download(template.storagePath);

  if (error || !data) {
    throw new Error(error?.message ?? "Certificate template file not found.");
  }

  return new Uint8Array(await data.arrayBuffer());
}

export async function upsertCertificateTemplate(
  supabase: SupabaseClient,
  input: CertificateTemplateInput,
): Promise<CertificateTemplate> {
  const { data, error } = await supabase
    .from("certificate_templates")
    .upsert(
      {
        id: input.id,
        name: input.name,
        storage_bucket: CERTIFICATE_STORAGE_BUCKET,
        storage_path: input.storagePath,
        is_active: true,
      },
      { onConflict: "id" },
    )
    .select(
      "id, name, storage_bucket, storage_path, is_active, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save certificate template.");
  }

  return mapCertificateTemplateRow(data as CertificateTemplateRow);
}
