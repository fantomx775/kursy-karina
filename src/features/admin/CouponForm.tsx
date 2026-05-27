"use client";

import { FormEvent, useState } from "react";
import { BlockingSpinner, Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Coupon } from "@/types/coupon";
import type { Course } from "@/types/course";

export type CouponFormData = {
  name: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  isActive: boolean;
  applicableCourseIds: string[];
  requiredCourseIds: string[];
};

type Props = {
  initial?: Coupon;
  courseOptions: Course[];
  onCancel: () => void;
  onSave: (data: CouponFormData) => void | Promise<void>;
  saving?: boolean;
};

type CouponFieldErrors = Partial<
  Record<
    | "name"
    | "code"
    | "discountValue"
    | "startDate"
    | "usageLimit"
    | "usageLimitPerUser",
    string
  >
>;

function toFormDate(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function toggleCourseId(ids: string[], courseId: string): string[] {
  return ids.includes(courseId)
    ? ids.filter((id) => id !== courseId)
    : [...ids, courseId];
}

export function CouponForm({
  initial,
  courseOptions,
  onCancel,
  onSave,
  saving = false,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    initial?.discountType ?? "percentage",
  );
  const [discountValue, setDiscountValue] = useState(
    initial
      ? initial.discountType === "percentage"
        ? String(initial.discountValue)
        : String(initial.discountValue)
      : "",
  );
  const [startDate, setStartDate] = useState(toFormDate(initial?.startDate));
  const [endDate, setEndDate] = useState(toFormDate(initial?.endDate));
  const [usageLimit, setUsageLimit] = useState(
    initial?.usageLimit != null ? String(initial.usageLimit) : "",
  );
  const [usageLimitPerUser, setUsageLimitPerUser] = useState(
    initial?.usageLimitPerUser != null ? String(initial.usageLimitPerUser) : "",
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [applicableCourseIds, setApplicableCourseIds] = useState<string[]>(
    initial?.applicableCourseIds ?? [],
  );
  const [requiredCourseIds, setRequiredCourseIds] = useState<string[]>(
    initial?.requiredCourseIds ?? [],
  );
  const [fieldErrors, setFieldErrors] = useState<CouponFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const isSaving = saving || submitting;

  const hintEndDate = "Puste = brak daty końcowej";
  const hintLimit = "Puste lub 0 = brak limitu";
  const labelClass =
    "block text-sm font-medium text-[var(--coffee-charcoal)] mb-1";
  const hintClass = "text-xs text-[var(--coffee-espresso)] mb-1";
  const inputClass =
    "border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white border-radius w-full";
  const labelBlockClass = "min-h-[2.75rem]"; // etykieta + opcjonalna linia hintu

  const clearFieldError = (field: keyof CouponFieldErrors) => {
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const getInputClass = (field: keyof CouponFieldErrors, className?: string) =>
    cn(
      inputClass,
      fieldErrors[field] &&
        "input-border input-border-error focus:outline-none focus:border-[var(--error)] focus:ring-2 focus:ring-[var(--error)]",
      className,
    );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSaving) {
      return;
    }

    const nextErrors: CouponFieldErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Podaj nazwe kuponu.";
    }

    if (!code.trim()) {
      nextErrors.code = "Podaj kod kuponu.";
    }

    const valueNum = parseFloat(discountValue.replace(",", "."));
    if (Number.isNaN(valueNum) || valueNum <= 0) {
      nextErrors.discountValue = "Podaj wartość zniżki większą niż 0.";
    } else if (discountType === "percentage" && valueNum > 100) {
      nextErrors.discountValue =
        "Zniżka procentowa nie może być większa niż 100.";
    }

    if (!startDate.trim()) {
      nextErrors.startDate = "Podaj datę rozpoczęcia.";
    }

    const usageLimitValue = parseInt(usageLimit, 10);
    if (
      usageLimit.trim() &&
      (Number.isNaN(usageLimitValue) || usageLimitValue < 1)
    ) {
      nextErrors.usageLimit = "Limit musi być pusty albo większy niż 0.";
    }

    const usageLimitPerUserValue = parseInt(usageLimitPerUser, 10);
    if (
      usageLimitPerUser.trim() &&
      (Number.isNaN(usageLimitPerUserValue) || usageLimitPerUserValue < 1)
    ) {
      nextErrors.usageLimitPerUser =
        "Limit na użytkownika musi być pusty albo większy niż 0.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        code: code.trim(),
        discountType,
        discountValue: valueNum,
        startDate: startDate || new Date().toISOString().slice(0, 10),
        endDate: endDate.trim() || null,
        usageLimit: usageLimit.trim()
          ? Math.max(1, parseInt(usageLimit, 10) || 0) || null
          : null,
        usageLimitPerUser: usageLimitPerUser.trim()
          ? Math.max(1, parseInt(usageLimitPerUser, 10) || 0) || null
          : null,
        isActive,
        applicableCourseIds,
        requiredCourseIds,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-2"
      noValidate
      aria-busy={isSaving}
    >
      <BlockingSpinner show={isSaving} message="Zapisywanie kuponu..." />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nazwa"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearFieldError("name");
          }}
          error={fieldErrors.name}
          required
        />
        <Input
          label="Kod kuponu"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            clearFieldError("code");
          }}
          error={fieldErrors.code}
          required
          className="uppercase"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Typ zniżki</label>
          <select
            value={discountType}
            onChange={(e) =>
              setDiscountType(e.target.value as "percentage" | "fixed")
            }
            className={`${inputClass} min-h-[2.75rem]`}
          >
            <option value="percentage">Procent (%)</option>
            <option value="fixed">Kwota (PLN)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>
            {discountType === "percentage" ? "Wartość (%)" : "Wartość (PLN)"}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={discountValue}
            onChange={(e) => {
              setDiscountValue(e.target.value);
              clearFieldError("discountValue");
            }}
            className={getInputClass("discountValue", "w-28")}
            aria-invalid={fieldErrors.discountValue ? "true" : "false"}
            aria-describedby={
              fieldErrors.discountValue
                ? "coupon-discount-value-error"
                : undefined
            }
            required
          />
          {fieldErrors.discountValue ? (
            <p
              id="coupon-discount-value-error"
              className="mt-1 text-sm text-[var(--error)]"
            >
              {fieldErrors.discountValue}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className={labelBlockClass}>
            <label className={labelClass}>Data rozpoczęcia</label>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              clearFieldError("startDate");
            }}
            className={getInputClass("startDate")}
            aria-invalid={fieldErrors.startDate ? "true" : "false"}
            aria-describedby={
              fieldErrors.startDate ? "coupon-start-date-error" : undefined
            }
            required
          />
          {fieldErrors.startDate ? (
            <p
              id="coupon-start-date-error"
              className="mt-1 text-sm text-[var(--error)]"
            >
              {fieldErrors.startDate}
            </p>
          ) : null}
        </div>
        <div>
          <label className={labelClass}>Data zakończenia (opcjonalnie)</label>
          <p className={hintClass}>{hintEndDate}</p>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Limit użyć (opcjonalnie)</label>
          <p className={hintClass}>{hintLimit}</p>
          <input
            type="number"
            min={0}
            value={usageLimit}
            onChange={(e) => {
              setUsageLimit(e.target.value);
              clearFieldError("usageLimit");
            }}
            className={getInputClass("usageLimit", "w-28")}
            aria-invalid={fieldErrors.usageLimit ? "true" : "false"}
            aria-describedby={
              fieldErrors.usageLimit ? "coupon-usage-limit-error" : undefined
            }
            placeholder="—"
          />
          {fieldErrors.usageLimit ? (
            <p
              id="coupon-usage-limit-error"
              className="mt-1 text-sm text-[var(--error)]"
            >
              {fieldErrors.usageLimit}
            </p>
          ) : null}
        </div>
        <div>
          <label className={labelClass}>
            Limit na użytkownika (opcjonalnie)
          </label>
          <p className={hintClass}>{hintLimit}</p>
          <input
            type="number"
            min={0}
            value={usageLimitPerUser}
            onChange={(e) => {
              setUsageLimitPerUser(e.target.value);
              clearFieldError("usageLimitPerUser");
            }}
            className={getInputClass("usageLimitPerUser", "w-28")}
            aria-invalid={fieldErrors.usageLimitPerUser ? "true" : "false"}
            aria-describedby={
              fieldErrors.usageLimitPerUser
                ? "coupon-usage-limit-per-user-error"
                : undefined
            }
            placeholder="—"
          />
          {fieldErrors.usageLimitPerUser ? (
            <p
              id="coupon-usage-limit-per-user-error"
              className="mt-1 text-sm text-[var(--error)]"
            >
              {fieldErrors.usageLimitPerUser}
            </p>
          ) : null}
        </div>
      </div>
      <div>
        <label htmlFor="coupon-status" className={labelClass}>
          Status
        </label>
        <select
          id="coupon-status"
          value={isActive ? "active" : "inactive"}
          onChange={(e) => setIsActive(e.target.value === "active")}
          className={`${inputClass} min-h-[2.75rem] w-full max-w-xs`}
        >
          <option value="inactive">Nieaktywny</option>
          <option value="active">Aktywny</option>
        </select>
      </div>
      <div className="space-y-4 border-t border-[var(--coffee-cappuccino)] pt-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--coffee-charcoal)]">
            Reguły kursów
          </h3>
          <p className={hintClass}>
            Pusta lista oznacza brak ograniczenia dla danego pola.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className={labelClass}>Rabat obejmuje kursy</label>
            <div className="max-h-56 overflow-y-auto border border-[var(--coffee-cappuccino)] bg-white p-2">
              {courseOptions.length > 0 ? (
                courseOptions.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-start gap-2 px-2 py-2 text-sm text-[var(--coffee-charcoal)]"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={applicableCourseIds.includes(course.id)}
                      onChange={() =>
                        setApplicableCourseIds((current) =>
                          toggleCourseId(current, course.id),
                        )
                      }
                    />
                    <span>{course.title}</span>
                  </label>
                ))
              ) : (
                <p className="px-2 py-3 text-sm text-[var(--coffee-espresso)]">
                  Brak kursów do wyboru.
                </p>
              )}
            </div>
          </div>
          <div>
            <label className={labelClass}>Wymagane razem w koszyku</label>
            <div className="max-h-56 overflow-y-auto border border-[var(--coffee-cappuccino)] bg-white p-2">
              {courseOptions.length > 0 ? (
                courseOptions.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-start gap-2 px-2 py-2 text-sm text-[var(--coffee-charcoal)]"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={requiredCourseIds.includes(course.id)}
                      onChange={() =>
                        setRequiredCourseIds((current) =>
                          toggleCourseId(current, course.id),
                        )
                      }
                    />
                    <span>{course.title}</span>
                  </label>
                ))
              ) : (
                <p className="px-2 py-3 text-sm text-[var(--coffee-espresso)]">
                  Brak kursów do wyboru.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={isSaving}
        >
          Anuluj
        </Button>
        <Button type="submit" variant="primary" loading={isSaving}>
          Zapisz
        </Button>
      </div>
    </form>
  );
}
