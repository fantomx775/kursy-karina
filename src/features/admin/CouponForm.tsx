"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Coupon } from "@/types/coupon";

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
};

type Props = {
  initial?: Coupon;
  onCancel: () => void;
  onSave: (data: CouponFormData) => void;
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

export function CouponForm({ initial, onCancel, onSave }: Props) {
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
  const [fieldErrors, setFieldErrors] = useState<CouponFieldErrors>({});

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
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
    onSave({
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
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2" noValidate>
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
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="border border-[var(--coffee-cappuccino)] text-[var(--coffee-espresso)] px-4 py-2 border-radius"
        >
          Anuluj
        </button>
        <button
          type="submit"
          className="bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white px-4 py-2 border-radius"
        >
          Zapisz
        </button>
      </div>
    </form>
  );
}
