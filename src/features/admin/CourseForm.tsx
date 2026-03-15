"use client";

import React from 'react';
import { FormEvent, useState, useCallback, useRef, useEffect } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Button, Card, CardContent, FileUpload } from "@/components/ui";
import type { Course } from "@/types/course";

export type CourseFormSection = {
  title: string;
  items: {
    title: string;
    kind: "svg" | "youtube";
    assetPath: string;
    youtubeUrl: string;
  }[];
};

export type CourseFormData = {
  title: string;
  description: string;
  price: number;
  status: "active" | "inactive";
  mainImageUrl?: string;
  sections: CourseFormSection[];
  promotionDiscountType?: "percentage" | "fixed" | null;
  promotionDiscountValue?: number | null;
  promotionStartDate?: string | null;
  promotionEndDate?: string | null;
};

type Props = {
  initial?: Course;
  initialSections?: CourseFormSection[];
  onCancel: () => void;
  onSave: (data: CourseFormData) => void;
  onChange?: () => void;
};

const emptySection: CourseFormSection = {
  title: "",
  items: [],
};

const emptyItem = (kind: "svg" | "youtube") => ({
  title: "",
  kind,
  assetPath: "",
  youtubeUrl: "",
});

function toFormDate(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function CourseForm({
  initial,
  initialSections,
  onCancel,
  onSave,
  onChange,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(
    initial ? (initial.price / 100).toString() : "",
  );
  const [status, setStatus] = useState<"active" | "inactive">(
    initial?.status ?? "inactive",
  );
  const [mainImageUrl, setMainImageUrl] = useState(initial?.main_image_url ?? "");
  const [promotionDiscountType, setPromotionDiscountType] = useState<
    "percentage" | "fixed"
  >(
    (initial?.promotion_discount_type as "percentage" | "fixed") ?? "percentage",
  );
  const [promotionDiscountValue, setPromotionDiscountValue] = useState(
    initial?.promotion_discount_value != null
      ? initial.promotion_discount_type === "fixed"
        ? (initial.promotion_discount_value / 100).toString()
        : String(initial.promotion_discount_value)
      : "",
  );
  const [promotionStartDate, setPromotionStartDate] = useState(
    toFormDate(initial?.promotion_start_date),
  );
  const [promotionEndDate, setPromotionEndDate] = useState(
    toFormDate(initial?.promotion_end_date),
  );
  const [sections, setSections] = useState<CourseFormSection[]>(
    initialSections?.length
      ? initialSections.map((s) => ({
          title: s.title,
            items: s.items.map((i) => ({
            title: i.title,
            kind: i.kind,
            assetPath: i.assetPath ?? "",
            youtubeUrl: i.youtubeUrl ?? "",
          })),
        }))
      : [structuredClone(emptySection)],
  );

  /** Indices of sections that are collapsed (content hidden). */
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  /** Błąd walidacji przy zapisie (np. brak ceny, pusta sekcja). */
  const [formError, setFormError] = useState<string | null>(null);
  const formErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formError && formErrorRef.current) {
      formErrorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formError]);

  const toggleSectionCollapsed = useCallback((index: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  // Helper to call onChange when provided
  const handleChange = () => {
    setFormError(null);
    if (onChange) {
      onChange();
    }
  };


  const addSection = () => {
    setSections((prev) => [...prev, structuredClone(emptySection)]);
    handleChange();
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
    setCollapsedSections((prev) =>
      new Set(
        [...prev]
          .filter((i) => i !== index)
          .map((i) => (i > index ? i - 1 : i)),
      ),
    );
    handleChange();
  };

  const setSectionTitle = (index: number, value: string) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, title: value } : s)),
    );
    handleChange();
  };

  const addItem = (sectionIndex: number, kind: "svg" | "youtube") => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? { ...s, items: [...s.items, emptyItem(kind)] }
          : s,
      ),
    );
    handleChange();
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? { ...s, items: s.items.filter((_, j) => j !== itemIndex) }
          : s,
      ),
    );
    handleChange();
  };

  const setItem = (
    sectionIndex: number,
    itemIndex: number,
    updates: Partial<CourseFormSection["items"][0]>,
  ) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              items: s.items.map((item, j) =>
                j === itemIndex ? { ...item, ...updates } : item,
              ),
            }
          : s,
      ),
    );
    handleChange();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const priceNum = parseFloat(price.replace(",", "."));
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setFormError("Podaj cenę większą niż 0.");
      return;
    }
    const validSections = sections.filter((s) => s.title.trim());
    if (validSections.length === 0) {
      setFormError("Dodaj co najmniej jedną sekcję i podaj jej tytuł.");
      return;
    }

    const hasPromo = promotionStartDate.trim() !== "";
    let promotionPayload:
      | {
          promotionDiscountType: "percentage" | "fixed";
          promotionDiscountValue: number;
          promotionStartDate: string;
          promotionEndDate: string | null;
        }
      | undefined;
    if (hasPromo) {
      const valueNum = parseFloat(promotionDiscountValue.replace(",", "."));
      if (Number.isNaN(valueNum) || valueNum <= 0) {
        setFormError("Podaj prawidłową wartość zniżki promocji.");
        return;
      }
      if (promotionDiscountType === "percentage" && valueNum > 100) {
        setFormError("Zniżka procentowa nie może być większa niż 100.");
        return;
      }
      promotionPayload = {
        promotionDiscountType: promotionDiscountType,
        promotionDiscountValue:
          promotionDiscountType === "fixed"
            ? Math.round(valueNum * 100)
            : valueNum,
        promotionStartDate: promotionStartDate || new Date().toISOString().slice(0, 10),
        promotionEndDate: promotionEndDate.trim() || null,
      };
    }

    const itemsWithMissingAsset = validSections.some((s) =>
      s.items.some((i) => i.title.trim() && i.kind === "svg" && !i.assetPath?.trim())
    );
    if (itemsWithMissingAsset) {
      setFormError("Każdy element typu SVG musi mieć dodany plik.");
      return;
    }

    const itemsWithMissingYoutube = validSections.some((s) =>
      s.items.some((i) => i.title.trim() && i.kind === "youtube" && !i.youtubeUrl?.trim())
    );
    if (itemsWithMissingYoutube) {
      setFormError("Każdy element typu YouTube musi mieć podany adres URL.");
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      price: priceNum,
      status,
      mainImageUrl: mainImageUrl.trim() || undefined,
      sections: validSections.map((s) => ({
        title: s.title.trim(),
        items: s.items
          .filter((i) => i.title.trim())
          .map((i) => ({
            title: i.title.trim(),
            kind: i.kind,
            assetPath: i.kind === "svg" ? i.assetPath.trim() : "",
            youtubeUrl: i.kind === "youtube" ? i.youtubeUrl.trim() : "",
          })),
      })),
      ...(promotionPayload
        ? {
            promotionDiscountType: promotionPayload.promotionDiscountType,
            promotionDiscountValue: promotionPayload.promotionDiscountValue,
            promotionStartDate: promotionPayload.promotionStartDate,
            promotionEndDate: promotionPayload.promotionEndDate,
          }
        : {
            promotionDiscountType: null,
            promotionDiscountValue: null,
            promotionStartDate: null,
            promotionEndDate: null,
          }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2">
      {formError && (
        <div ref={formErrorRef} className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm border-radius" role="alert">
          {formError}
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[var(--coffee-charcoal)] mb-1">
          Tytuł
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            handleChange();
          }}
          className="w-full border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[var(--coffee-charcoal)] mb-1">
          Opis
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            handleChange();
          }}
          className="w-full border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white min-h-[80px]"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-[var(--coffee-charcoal)] mb-1">
            Cena (PLN)
          </label>
          <input
            id="price"
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              handleChange();
            }}
            className="w-full border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--coffee-macchiato)] focus:border-transparent h-10"
            required
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-[var(--coffee-charcoal)] mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "active" | "inactive");
              handleChange();
            }}
            className="w-full border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--coffee-macchiato)] focus:border-transparent h-10"
          >
            <option value="inactive">Nieaktywny</option>
            <option value="active">Aktywny</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--coffee-charcoal)] mb-1">
          Zdjęcie główne kursu
        </label>
        <FileUpload
          value={mainImageUrl}
          onChange={(url) => {
            setMainImageUrl(url);
            handleChange();
          }}
          accept="image/*"
        />
        <p className="mt-1 text-sm text-[var(--coffee-espresso)]">
          Przeciągnij i upuść zdjęcie kursu lub kliknij aby wybrać plik.
        </p>
      </div>

      <div className="border-t border-[var(--coffee-cappuccino)] pt-6">
        <h3 className="text-lg font-semibold text-[var(--coffee-charcoal)] mb-3">
          Promocja
        </h3>
        <p className="text-sm text-[var(--coffee-espresso)] mb-4">
          Opcjonalnie: ustaw datę rozpoczęcia, aby włączyć promocję. Data zakończenia pusta = bez końca.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[var(--coffee-charcoal)] whitespace-nowrap">
              Typ zniżki
            </label>
            <select
              value={promotionDiscountType}
              onChange={(e) => {
                setPromotionDiscountType(e.target.value as "percentage" | "fixed");
                handleChange();
              }}
              className="border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--coffee-macchiato)] focus:border-transparent h-10"
            >
              <option value="percentage">Procent (%)</option>
              <option value="fixed">Kwota (PLN)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[var(--coffee-charcoal)] whitespace-nowrap">
              {promotionDiscountType === "percentage"
                ? "Wartość (%)"
                : "Wartość (PLN)"}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={promotionDiscountValue}
              onChange={(e) => {
                setPromotionDiscountValue(e.target.value);
                handleChange();
              }}
              placeholder={promotionDiscountType === "percentage" ? "np. 20" : "np. 29.99"}
              className="w-28 border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--coffee-macchiato)] focus:border-transparent h-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[var(--coffee-charcoal)] whitespace-nowrap">
              Data od
            </label>
            <input
              type="date"
              value={promotionStartDate}
              onChange={(e) => {
                setPromotionStartDate(e.target.value);
                handleChange();
              }}
              className="border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--coffee-macchiato)] focus:border-transparent h-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[var(--coffee-charcoal)] whitespace-nowrap">
              Data do (opcjonalnie)
            </label>
            <input
              type="date"
              value={promotionEndDate}
              onChange={(e) => {
                setPromotionEndDate(e.target.value);
                handleChange();
              }}
              className="border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--coffee-macchiato)] focus:border-transparent h-10"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--coffee-charcoal)]">
            Sekcje i materiały
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addSection}
          >
            + Dodaj sekcję
          </Button>
        </div>
        <div className="space-y-6">
          {sections.map((section, sIdx) => {
            const isCollapsed = collapsedSections.has(sIdx);
            return (
            <Card key={sIdx} variant="elevated" className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => toggleSectionCollapsed(sIdx)}
                    aria-expanded={!isCollapsed}
                    className="shrink-0 p-1 text-[var(--coffee-charcoal)] hover:bg-[var(--coffee-cream)] border-radius"
                  >
                    {isCollapsed ? (
                      <FiChevronDown className="w-5 h-5" aria-hidden />
                    ) : (
                      <FiChevronUp className="w-5 h-5" aria-hidden />
                    )}
                  </button>
                  <input
                    type="text"
                    placeholder="Tytuł sekcji"
                    value={section.title}
                    onChange={(e) => setSectionTitle(sIdx, e.target.value)}
                    className="flex-1 min-w-0 border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--coffee-macchiato)] focus:border-transparent h-10"
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeSection(sIdx)}
                  >
                    Usuń sekcję
                  </Button>
                </div>

                {!isCollapsed && (
                <div className="space-y-4">
                  {section.items.map((item, iIdx) => (
                    <Card key={iIdx} variant="default" className="border border-[var(--coffee-cappuccino)]">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Tytuł elementu"
                            value={item.title}
                            onChange={(e) =>
                              setItem(sIdx, iIdx, { title: e.target.value })
                            }
                            className="w-full border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--coffee-macchiato)] focus:border-transparent h-10"
                          />
                          
                          <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex gap-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`kind-${sIdx}-${iIdx}`}
                                  checked={item.kind === "svg"}
                                  onChange={() =>
                                    setItem(sIdx, iIdx, {
                                      kind: "svg",
                                      assetPath: "",
                                      youtubeUrl: "",
                                    })
                                  }
                                  className="text-[var(--coffee-mocha)] focus:ring-[var(--coffee-macchiato)]"
                                />
                                <span className="text-sm font-medium">SVG</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`kind-${sIdx}-${iIdx}`}
                                  checked={item.kind === "youtube"}
                                  onChange={() =>
                                    setItem(sIdx, iIdx, {
                                      kind: "youtube",
                                      assetPath: "",
                                      youtubeUrl: "",
                                    })
                                  }
                                  className="text-[var(--coffee-mocha)] focus:ring-[var(--coffee-macchiato)]"
                                />
                                <span className="text-sm font-medium">YouTube</span>
                              </label>
                            </div>
                            
                          </div>
                          
                          {item.kind === "svg" ? (
                            <FileUpload
                              value={item.assetPath}
                              onChange={(url) => setItem(sIdx, iIdx, { assetPath: url })}
                              accept=".svg,image/svg+xml"
                              className="w-full"
                            />
                          ) : (
                            <input
                              type="url"
                              placeholder="URL YouTube (np. https://youtube.com/watch?v=...)"
                              value={item.youtubeUrl}
                              onChange={(e) =>
                                setItem(sIdx, iIdx, { youtubeUrl: e.target.value })
                              }
                              className="w-full border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--coffee-macchiato)] focus:border-transparent h-10"
                            />
                          )}

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => removeItem(sIdx, iIdx)}
                            >
                              Usuń element
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addItem(sIdx, "svg")}
                    >
                      + Element SVG
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addItem(sIdx, "youtube")}
                    >
                      + Element YouTube
                    </Button>
                  </div>
                </div>
                )}
              </CardContent>
            </Card>
          );
          })}
        </div>

        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addSection}
          >
            + Dodaj sekcję
          </Button>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Anuluj
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          Zapisz
        </Button>
      </div>
    </form>
  );
}
