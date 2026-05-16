export const CERTIFICATE_TEMPLATE_KEYS = [
  "certificate-1",
  "certificate-2",
] as const;

export type CertificateTemplateKey = (typeof CERTIFICATE_TEMPLATE_KEYS)[number];

export const DEFAULT_CERTIFICATE_TEMPLATE_KEY: CertificateTemplateKey =
  "certificate-1";

export const CERTIFICATE_TEMPLATE_OPTIONS: Array<{
  key: CertificateTemplateKey;
  label: string;
}> = [
  {
    key: "certificate-1",
    label: "Certyfikat 1 - laminacja brwi",
  },
  {
    key: "certificate-2",
    label: "Certyfikat 2 - koloryzacja brwi",
  },
];

export function isCertificateTemplateKey(
  value: unknown,
): value is CertificateTemplateKey {
  return CERTIFICATE_TEMPLATE_KEYS.includes(value as CertificateTemplateKey);
}

export function normalizeCertificateTemplateKey(
  value: unknown,
): CertificateTemplateKey {
  return isCertificateTemplateKey(value)
    ? value
    : DEFAULT_CERTIFICATE_TEMPLATE_KEY;
}
