"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

type CertificateActionsProps = {
  slug: string;
  firstName: string;
  lastName: string;
  generated: boolean;
  regenerationAllowed: boolean;
  onGenerated?: (generatedAt: string | null, issuedAt: string | null) => void;
};

function getTodayLabel(): string {
  return new Date().toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Warsaw",
  });
}

export function CertificateActions({
  slug,
  firstName,
  lastName,
  generated,
  regenerationAllowed,
  onGenerated,
}: CertificateActionsProps) {
  const [isGenerated, setIsGenerated] = useState(generated);
  const [canRegenerate, setCanRegenerate] = useState(regenerationAllowed);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    setIsGenerated(generated);
    setCanRegenerate(regenerationAllowed);
  }, [generated, regenerationAllowed]);

  const certificateUrl = `/api/courses/${slug}/certificate`;
  const fullName = `${firstName} ${lastName}`.trim();
  const actionLabel = isGenerated ? "Wygeneruj ponownie" : "Odbierz certyfikat";
  const confirmMessage = `Certyfikat zostanie wygenerowany z danymi: ${fullName}, z dzisiejsza data: ${getTodayLabel()}. Po wygenerowaniu tych danych nie bedzie mozna zmienic bez zgody administratora. Upewnij sie, ze imie i nazwisko sa poprawne.`;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch(certificateUrl, { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          data?.error ?? "Nie udalo sie wygenerowac certyfikatu.",
        );
      }

      setIsGenerated(true);
      setCanRegenerate(false);
      setConfirmOpen(false);
      onGenerated?.(data?.generatedAt ?? null, data?.issuedAt ?? null);
      addToast({
        type: "success",
        title: data?.alreadyGenerated
          ? "Certyfikat jest juz gotowy"
          : "Certyfikat wygenerowany",
        message: "Pobieranie pliku PDF rozpocznie sie automatycznie.",
      });

      window.location.assign(data?.downloadUrl ?? certificateUrl);
    } catch (error) {
      addToast({
        type: "error",
        title: "Blad certyfikatu",
        message:
          error instanceof Error
            ? error.message
            : "Nie udalo sie wygenerowac certyfikatu.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isGenerated && !canRegenerate) {
    return (
      <>
        <a href={certificateUrl} download>
          <Button variant="primary">Pobierz certyfikat</Button>
        </a>
        <a
          href={`${certificateUrl}?preview=1`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline">Podglad certyfikatu</Button>
        </a>
      </>
    );
  }

  return (
    <>
      {isGenerated ? (
        <a href={certificateUrl} download>
          <Button variant="outline">Pobierz aktualny</Button>
        </a>
      ) : null}
      <Button
        variant="primary"
        loading={loading}
        onClick={() => setConfirmOpen(true)}
      >
        {actionLabel}
      </Button>
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          if (!loading) {
            setConfirmOpen(false);
          }
        }}
        onConfirm={handleGenerate}
        title={isGenerated ? "Potwierdz ponowne generowanie" : "Potwierdz dane"}
        message={confirmMessage}
        confirmText={actionLabel}
        cancelText="Anuluj"
        variant="warning"
        loading={loading}
        closeOnConfirm={false}
      />
    </>
  );
}
