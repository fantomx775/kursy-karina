"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui";
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const valueNum = parseFloat(discountValue.replace(",", "."));
    if (Number.isNaN(valueNum) || valueNum <= 0) return;
    if (discountType === "percentage" && valueNum > 100) return;
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

  const hintEndDate = "Puste = brak daty końcowej";
  const hintLimit = "Puste lub 0 = brak limitu";
  const labelClass =
    "block text-sm font-medium text-[var(--coffee-charcoal)] mb-1";
  const hintClass = "text-xs text-[var(--coffee-espresso)] mb-1";
  const inputClass =
    "border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white border-radius w-full";
  const labelBlockClass = "min-h-[2.75rem]"; // etykieta + opcjonalna linia hintu

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nazwa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Kod kuponu"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
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
            onChange={(e) => setDiscountValue(e.target.value)}
            className={`${inputClass} w-28`}
            required
          />
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
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
            required
          />
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
            onChange={(e) => setUsageLimit(e.target.value)}
            className={`${inputClass} w-28`}
            placeholder="—"
          />
        </div>
        <div>
          <label className={labelClass}>Limit na użytkownika (opcjonalnie)</label>
          <p className={hintClass}>{hintLimit}</p>
          <input
            type="number"
            min={0}
            value={usageLimitPerUser}
            onChange={(e) => setUsageLimitPerUser(e.target.value)}
            className={`${inputClass} w-28`}
            placeholder="—"
          />
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
