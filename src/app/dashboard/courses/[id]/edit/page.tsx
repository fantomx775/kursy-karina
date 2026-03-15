"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CourseForm } from "@/features/admin/CourseForm";
import { useAdminActions } from "@/features/admin/hooks/useAdminActions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { Course } from "@/types/course";
import type { CourseFormData, CourseFormSection } from "@/features/admin/CourseForm";

function mapApiSectionsToForm(
  sections: Array<{
    title: string;
    items: Array<{
      title: string;
      kind: string;
      asset_path?: string | null;
      youtube_url?: string | null;
    }>;
  }>
): CourseFormSection[] {
  return (sections ?? []).map((section) => ({
    title: section.title,
    items: (section.items ?? []).map((item) => ({
      title: item.title,
      kind: item.kind as "svg" | "youtube",
      assetPath: item.asset_path ?? "",
      youtubeUrl: item.youtube_url ?? "",
    })),
  }));
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const { handleSaveCourse } = useAdminActions();

  const [course, setCourse] = useState<Course | null>(null);
  const [initialSections, setInitialSections] = useState<CourseFormSection[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Brak identyfikatora kursu.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`/api/admin/courses/${id}`);
        if (!response.ok) {
          if (response.status === 404) setError("Kurs nie został znaleziony.");
          else setError("Nie udało się załadować kursu.");
          return;
        }
        const data = await response.json();
        if (cancelled) return;
        const c = data.course as Course;
        setCourse(c);
        setInitialSections(mapApiSectionsToForm(data.sections ?? []));
      } catch {
        if (!cancelled) setError("Nie udało się załadować kursu.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowConfirmModal(true);
      setPendingNavigation("/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const handleSave = async (data: CourseFormData) => {
    if (!course) return;
    setSaving(true);
    try {
      const result = await handleSaveCourse(data, course);
      if (result.success) {
        setHasUnsavedChanges(false);
        router.push("/dashboard");
      } else {
        alert(result.error ?? "Wystąpił błąd podczas zapisywania kursu.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
    setShowConfirmModal(false);
  };

  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--coffee-cream)] py-8 flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-[var(--coffee-espresso)]">Ładowanie kursu...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[var(--coffee-cream)] py-8">
        <div className="page-width">
          <p className="text-red-600 mb-4">{error ?? "Kurs nie istnieje."}</p>
          <Link href="/dashboard">
            <Button variant="secondary">Powrót do panelu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--coffee-cream)] py-8">
      <div className="page-width">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[var(--coffee-charcoal)]">
              Edycja kursu
            </h1>
            <Link
              href="/dashboard"
              onClick={(e) => {
                if (hasUnsavedChanges) {
                  e.preventDefault();
                  setShowConfirmModal(true);
                  setPendingNavigation("/dashboard");
                }
              }}
            >
              <Button variant="secondary">Powrót do panelu</Button>
            </Link>
          </div>
          <p className="text-[var(--coffee-espresso)]">
            Zmień poniższe dane i zapisz, aby zaktualizować kurs.
          </p>
        </div>

        <div className="bg-white border border-[var(--coffee-cappuccino)] p-6 border-radius">
          <CourseForm
            initial={course}
            initialSections={initialSections}
            onCancel={handleCancel}
            onSave={handleSave}
            onChange={handleFormChange}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingNavigation(null);
        }}
        onConfirm={handleConfirmNavigation}
        title="Potwierdzenie opuszczenia strony"
        message="Masz niezapisane zmiany. Czy na pewno chcesz opuścić tę stronę? Wszystkie wprowadzone dane zostaną utracone."
        confirmText="Opuść stronę"
        cancelText="Anuluj"
        variant="warning"
      />
    </div>
  );
}
