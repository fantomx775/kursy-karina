"use client";

import React, { useState, useEffect } from "react";
import { CourseForm } from "@/features/admin/CourseForm";
import { useAdminActions } from "@/features/admin/hooks/useAdminActions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CourseFormData } from "@/features/admin/CourseForm";

export default function CreateCoursePage() {
  const router = useRouter();
  const { handleSaveCourse } = useAdminActions();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowConfirmModal(true);
      setPendingNavigation("/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const handleSave = async (data: CourseFormData) => {
    const result = await handleSaveCourse(data, null);
    if (result.success) {
      setHasUnsavedChanges(false);
      router.push("/dashboard");
    } else {
      alert(result.error ?? "Wystąpił błąd podczas tworzenia kursu. Spróbuj ponownie.");
    }
  };

  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  // Track form changes
  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  // Handle browser navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div className="min-h-screen bg-[var(--coffee-cream)] py-8">
      <div className="page-width">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[var(--coffee-charcoal)]">
              Tworzenie nowego kursu
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
              <Button variant="secondary">
                Powrót do panelu
              </Button>
            </Link>
          </div>
          <p className="text-[var(--coffee-espresso)]">
            Wypełnij poniższy formularz, aby stworzyć nowy kurs. Wszystkie pola oznaczone gwiazdką (*) są wymagane.
          </p>
        </div>

        {/* Course Form */}
        <div className="bg-white border border-[var(--coffee-cappuccino)] p-6 border-radius">
          <CourseForm
            onCancel={handleCancel}
            onSave={handleSave}
            onChange={handleFormChange}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
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
