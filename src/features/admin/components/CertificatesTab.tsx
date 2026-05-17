"use client";

import { useEffect, useMemo, useState } from "react";
import { FiAward, FiEdit2, FiFileText, FiUpload } from "react-icons/fi";
import { Button, Input, Table } from "@/components/ui";
import type { Column } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import type {
  CertificateAdminData,
  CertificateEligibleStudent,
} from "@/types/certificate";
import type { CertificateTemplate } from "@/lib/certificateTemplates";

type CertificatesTabProps = {
  data: CertificateAdminData | null;
  loading: boolean;
  onRefresh: () => Promise<void>;
  onGrantCertificate: (studentId: string, courseId: string) => Promise<void>;
  grantingKey: string | null;
};

function formatStoragePath(path: string): string {
  return path.replace(/^templates\//, "");
}

export function CertificatesTab({
  data,
  loading,
  onRefresh,
  onGrantCertificate,
  grantingKey,
}: CertificatesTabProps) {
  const templates = useMemo(() => data?.templates ?? [], [data?.templates]);
  const eligibleStudents = useMemo(
    () => data?.eligibleStudents ?? [],
    [data?.eligibleStudents],
  );
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [templateNames, setTemplateNames] = useState<Record<string, string>>(
    {},
  );
  const [manualTemplateId, setManualTemplateId] = useState("");
  const [manualFirstName, setManualFirstName] = useState("Magdalena");
  const [manualLastName, setManualLastName] = useState("Malecka");
  const [manualDate, setManualDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const { addToast } = useToast();

  useEffect(() => {
    setTemplateNames(
      Object.fromEntries(
        templates.map((template) => [template.id, template.name]),
      ),
    );
    if (!manualTemplateId && templates[0]) {
      setManualTemplateId(templates[0].id);
    }
  }, [manualTemplateId, templates]);

  const handleUpload = async () => {
    if (!uploadFile) {
      addToast({
        type: "error",
        title: "Brak pliku",
        message: "Wybierz plik PDF certyfikatu.",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("name", uploadName.trim() || uploadFile.name);
      const response = await fetch("/api/admin/certificate-templates", {
        method: "POST",
        body: formData,
      });
      const responseData = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(responseData?.error ?? "Nie udało się wgrać szablonu.");
      }

      setUploadFile(null);
      setUploadName("");
      addToast({
        type: "success",
        title: "Szablon dodany",
        message: "Nowy PDF certyfikatu jest dostępny w kreatorze kursu.",
      });
      await onRefresh();
    } catch (error) {
      addToast({
        type: "error",
        title: "Błąd wgrywania",
        message:
          error instanceof Error ? error.message : "Nie udało się wgrać PDF.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRename = async (template: CertificateTemplate) => {
    const nextName = templateNames[template.id]?.trim();
    if (!nextName || nextName === template.name) {
      return;
    }

    setRenamingId(template.id);
    try {
      const response = await fetch(
        `/api/admin/certificate-templates/${encodeURIComponent(template.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: nextName }),
        },
      );
      const responseData = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          responseData?.error ?? "Nie udało się zmienić nazwy szablonu.",
        );
      }

      addToast({
        type: "success",
        title: "Nazwa zmieniona",
        message: "Kursy nadal wskazuja ten sam szablon po stabilnym ID.",
      });
      await onRefresh();
    } catch (error) {
      addToast({
        type: "error",
        title: "Błąd zmiany nazwy",
        message:
          error instanceof Error
            ? error.message
            : "Nie udało się zmienić nazwy.",
      });
    } finally {
      setRenamingId(null);
    }
  };

  const previewUrl = useMemo(() => {
    const params = new URLSearchParams({
      templateId: manualTemplateId,
      firstName: manualFirstName,
      lastName: manualLastName,
      issuedAt: manualDate,
    });
    return `/api/admin/certificates/preview?${params.toString()}`;
  }, [manualDate, manualFirstName, manualLastName, manualTemplateId]);

  const templateColumns: Column<CertificateTemplate>[] = [
    {
      key: "name",
      title: "Nazwa",
      dataIndex: "name",
      render: (_, template) => (
        <div className="flex min-w-[260px] items-center gap-2">
          <Input
            value={templateNames[template.id] ?? template.name}
            onChange={(event) =>
              setTemplateNames((previous) => ({
                ...previous,
                [template.id]: event.target.value,
              }))
            }
            aria-label={`Nazwa szablonu ${template.name}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            title="Zapisz nazwe"
            aria-label="Zapisz nazwe"
            loading={renamingId === template.id}
            onClick={() => handleRename(template)}
          >
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ),
    },
    {
      key: "storagePath",
      title: "Plik PDF",
      dataIndex: "storagePath",
      render: (_, template) => (
        <span className="font-mono text-xs">
          {formatStoragePath(template.storagePath)}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Test",
      dataIndex: "id",
      render: (_, template) => (
        <a
          href={`/api/admin/certificates/preview?templateId=${encodeURIComponent(
            template.id,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button type="button" variant="secondary" size="sm">
            Test PDF
          </Button>
        </a>
      ),
    },
  ];

  const eligibleColumns: Column<CertificateEligibleStudent>[] = [
    { key: "studentName", title: "Kursant", dataIndex: "studentName" },
    { key: "studentEmail", title: "Email", dataIndex: "studentEmail" },
    { key: "courseTitle", title: "Kurs", dataIndex: "courseTitle" },
    {
      key: "progress",
      title: "Postęp",
      dataIndex: "completedItems",
      render: (_, record) => `${record.completedItems}/${record.totalItems}`,
    },
    {
      key: "action",
      title: "Akcja",
      dataIndex: "studentId",
      render: (_, record) => {
        const key = `${record.studentId}:${record.courseId}`;
        return (
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={grantingKey === key}
            onClick={() =>
              onGrantCertificate(record.studentId, record.courseId)
            }
          >
            Przyznaj
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <section className="border border-[var(--coffee-cappuccino)] bg-white p-5 border-radius">
        <div className="mb-4 flex items-center gap-2">
          <FiUpload
            className="h-5 w-5 text-[var(--coffee-mocha)]"
            aria-hidden
          />
          <h3 className="text-base font-semibold text-[var(--coffee-charcoal)]">
            Szablony PDF
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <Input
            label="Nazwa"
            value={uploadName}
            onChange={(event) => setUploadName(event.target.value)}
            placeholder="Nazwa szablonu"
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--coffee-charcoal)]">
              Plik PDF
            </label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) =>
                setUploadFile(event.target.files?.[0] ?? null)
              }
              className="w-full border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 border-radius"
            />
          </div>
          <Button type="button" loading={uploading} onClick={handleUpload}>
            Wgraj PDF
          </Button>
        </div>
        <div className="mt-5">
          <Table<CertificateTemplate>
            data={templates}
            columns={templateColumns}
            loading={loading}
            empty={
              <div className="p-6 text-center text-sm text-[var(--coffee-espresso)]">
                Brak szablonow PDF.
              </div>
            }
          />
        </div>
      </section>

      <section className="border border-[var(--coffee-cappuccino)] bg-white p-5 border-radius">
        <div className="mb-4 flex items-center gap-2">
          <FiFileText
            className="h-5 w-5 text-[var(--coffee-mocha)]"
            aria-hidden
          />
          <h3 className="text-base font-semibold text-[var(--coffee-charcoal)]">
            Generator testowy
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-5 md:items-end">
          <Input
            label="Imię"
            value={manualFirstName}
            onChange={(event) => setManualFirstName(event.target.value)}
          />
          <Input
            label="Nazwisko"
            value={manualLastName}
            onChange={(event) => setManualLastName(event.target.value)}
          />
          <Input
            label="Data"
            type="date"
            value={manualDate}
            onChange={(event) => setManualDate(event.target.value)}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--coffee-charcoal)]">
              Szablon
            </label>
            <select
              value={manualTemplateId}
              onChange={(event) => setManualTemplateId(event.target.value)}
              className="h-10 w-full border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 border-radius"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            <Button type="button" fullWidth disabled={!manualTemplateId}>
              Generuj
            </Button>
          </a>
        </div>
      </section>

      <section className="border border-[var(--coffee-cappuccino)] bg-white p-5 border-radius">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FiAward
              className="h-5 w-5 text-[var(--coffee-mocha)]"
              aria-hidden
            />
            <h3 className="text-base font-semibold text-[var(--coffee-charcoal)]">
              Do przyznania
            </h3>
          </div>
          <span className="rounded-full bg-[var(--coffee-cream)] px-3 py-1 text-sm font-semibold text-[var(--coffee-mocha)]">
            {eligibleStudents.length}
          </span>
        </div>
        <Table<CertificateEligibleStudent>
          data={eligibleStudents}
          columns={eligibleColumns}
          loading={loading}
          empty={
            <div className="p-6 text-center text-sm text-[var(--coffee-espresso)]">
              Brak kursantow wymagajacych przyznania certyfikatu.
            </div>
          }
        />
      </section>
    </div>
  );
}
