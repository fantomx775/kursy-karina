"use client";

import React from "react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Button, Card, CardContent, FileUpload } from "@/components/ui";
import type { Course } from "@/types/course";
import { CourseQuizBuilder, createEmptyQuiz } from "./CourseQuizBuilder";
import type {
  CourseFormData,
  CourseFormItem,
  CourseFormQuiz,
  CourseFormSection,
} from "./course-form-types";

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

function createEmptyItem(kind: CourseFormItem["kind"]): CourseFormItem {
  return {
    title: "",
    kind,
    assetPath: "",
    youtubeUrl: "",
    quiz: kind === "quiz" ? createEmptyQuiz() : null,
  };
}

function toFormDate(iso: string | undefined | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getItemKindLabel(kind: CourseFormItem["kind"]): string {
  switch (kind) {
    case "youtube":
      return "Video";
    case "quiz":
      return "Quiz";
    default:
      return "Tekst";
  }
}

function normalizeQuiz(quiz: CourseFormQuiz | null): CourseFormQuiz {
  return quiz ?? createEmptyQuiz();
}

function hasQuizDraftContent(quiz: CourseFormQuiz | null): boolean {
  if (!quiz) {
    return false;
  }

  return quiz.questions.some(
    (question) =>
      question.text.trim() !== "" ||
      question.answers.some(
        (answer) => answer.text.trim() !== "" || answer.isCorrect,
      ),
  );
}

function getCourseValidationError(sections: CourseFormSection[]): string | null {
  for (const section of sections) {
    for (const item of section.items) {
      const hasKindSpecificContent =
        item.assetPath.trim() !== "" ||
        item.youtubeUrl.trim() !== "" ||
        hasQuizDraftContent(item.quiz);

      if (!item.title.trim() && hasKindSpecificContent) {
        return "Kazdy element lekcji musi miec tytul.";
      }

      if (!item.title.trim()) {
        continue;
      }

      if (item.kind === "svg" && !item.assetPath.trim()) {
        return "Kazdy element typu Tekst musi miec dodany plik SVG.";
      }

      if (item.kind === "youtube" && !item.youtubeUrl.trim()) {
        return "Kazdy element typu Video musi miec podany adres URL.";
      }

      if (item.kind !== "quiz") {
        continue;
      }

      if (!item.quiz || item.quiz.questions.length === 0) {
        return "Quiz musi zawierac co najmniej jedno pytanie.";
      }

      for (const question of item.quiz.questions) {
        if (!question.text.trim()) {
          return "Kazde pytanie quizu musi miec tresc.";
        }

        if (question.answers.length < 2) {
          return "Kazde pytanie quizu musi miec minimum 2 odpowiedzi.";
        }

        if (question.answers.some((answer) => !answer.text.trim())) {
          return "Kazda odpowiedz w quizie musi miec tresc.";
        }

        const correctAnswers = question.answers.filter(
          (answer) => answer.isCorrect,
        );

        if (correctAnswers.length === 0) {
          return "Kazde pytanie quizu musi miec przynajmniej jedna poprawna odpowiedz.";
        }

        if (question.type === "single" && correctAnswers.length > 1) {
          return "Pytanie jednokrotnego wyboru moze miec tylko jedna poprawna odpowiedz.";
        }
      }
    }
  }

  return null;
}

export type { CourseFormData, CourseFormSection } from "./course-form-types";

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
      ? initialSections.map((section) => ({
          title: section.title,
          items: section.items.map((item) => ({
            title: item.title,
            kind: item.kind,
            assetPath: item.assetPath ?? "",
            youtubeUrl: item.youtubeUrl ?? "",
            quiz: item.kind === "quiz" ? normalizeQuiz(item.quiz) : null,
          })),
        }))
      : [{ ...emptySection }],
  );
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(
    new Set(),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const formErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formError && formErrorRef.current) {
      formErrorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [formError]);

  const notifyChange = () => {
    setFormError(null);
    onChange?.();
  };

  const toggleSectionCollapsed = useCallback((index: number) => {
    setCollapsedSections((previous) => {
      const next = new Set(previous);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const addSection = () => {
    setSections((previous) => [...previous, { ...emptySection }]);
    notifyChange();
  };

  const removeSection = (index: number) => {
    setSections((previous) => previous.filter((_, current) => current !== index));
    setCollapsedSections((previous) =>
      new Set(
        [...previous]
          .filter((current) => current !== index)
          .map((current) => (current > index ? current - 1 : current)),
      ),
    );
    notifyChange();
  };

  const setSectionTitle = (index: number, value: string) => {
    setSections((previous) =>
      previous.map((section, current) =>
        current === index ? { ...section, title: value } : section,
      ),
    );
    notifyChange();
  };

  const addItem = (sectionIndex: number, kind: CourseFormItem["kind"]) => {
    setSections((previous) =>
      previous.map((section, current) =>
        current === sectionIndex
          ? {
              ...section,
              items: [...section.items, createEmptyItem(kind)],
            }
          : section,
      ),
    );
    notifyChange();
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    setSections((previous) =>
      previous.map((section, current) =>
        current === sectionIndex
          ? {
              ...section,
              items: section.items.filter((_, currentItem) => currentItem !== itemIndex),
            }
          : section,
      ),
    );
    notifyChange();
  };

  const setItem = (
    sectionIndex: number,
    itemIndex: number,
    updates: Partial<CourseFormItem>,
  ) => {
    setSections((previous) =>
      previous.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? {
              ...section,
              items: section.items.map((item, currentItemIndex) => {
                if (currentItemIndex !== itemIndex) {
                  return item;
                }

                const nextItem = {
                  ...item,
                  ...updates,
                };

                if (updates.kind === "quiz") {
                  nextItem.assetPath = "";
                  nextItem.youtubeUrl = "";
                  nextItem.quiz = normalizeQuiz(updates.quiz ?? item.quiz);
                }

                if (updates.kind === "svg") {
                  nextItem.youtubeUrl = "";
                  nextItem.quiz = null;
                }

                if (updates.kind === "youtube") {
                  nextItem.assetPath = "";
                  nextItem.quiz = null;
                }

                return nextItem;
              }),
            }
          : section,
      ),
    );
    notifyChange();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const priceValue = parseFloat(price.replace(",", "."));
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      setFormError("Podaj cene wieksza niz 0.");
      return;
    }

    const validSections = sections.filter((section) => section.title.trim());
    if (validSections.length === 0) {
      setFormError("Dodaj co najmniej jedna sekcje i podaj jej tytul.");
      return;
    }

    const contentValidationError = getCourseValidationError(validSections);
    if (contentValidationError) {
      setFormError(contentValidationError);
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
      const value = parseFloat(promotionDiscountValue.replace(",", "."));
      if (Number.isNaN(value) || value <= 0) {
        setFormError("Podaj prawidlowa wartosc znizki promocji.");
        return;
      }

      if (promotionDiscountType === "percentage" && value > 100) {
        setFormError("Znizka procentowa nie moze byc wieksza niz 100.");
        return;
      }

      promotionPayload = {
        promotionDiscountType,
        promotionDiscountValue:
          promotionDiscountType === "fixed" ? Math.round(value * 100) : value,
        promotionStartDate:
          promotionStartDate || new Date().toISOString().slice(0, 10),
        promotionEndDate: promotionEndDate.trim() || null,
      };
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      price: priceValue,
      status,
      mainImageUrl: mainImageUrl.trim() || undefined,
      sections: validSections.map((section) => ({
        title: section.title.trim(),
        items: section.items
          .filter((item) => item.title.trim())
          .map((item) => ({
            title: item.title.trim(),
            kind: item.kind,
            assetPath: item.kind === "svg" ? item.assetPath.trim() : "",
            youtubeUrl: item.kind === "youtube" ? item.youtubeUrl.trim() : "",
            quiz:
              item.kind === "quiz" && item.quiz
                ? {
                    questions: item.quiz.questions.map((question) => ({
                      text: question.text.trim(),
                      type: question.type,
                      answers: question.answers.map((answer) => ({
                        text: answer.text.trim(),
                        isCorrect: answer.isCorrect,
                      })),
                    })),
                  }
                : null,
          })),
      })),
      ...(promotionPayload
        ? promotionPayload
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
      {formError ? (
        <div
          ref={formErrorRef}
          className="border-radius border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="title"
          className="mb-1 block text-sm font-medium text-[var(--coffee-charcoal)]"
        >
          Tytul
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            notifyChange();
          }}
          className="w-full border border-[var(--coffee-cappuccino)] bg-white px-3 py-2"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-[var(--coffee-charcoal)]"
        >
          Opis
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            notifyChange();
          }}
          className="min-h-[80px] w-full border border-[var(--coffee-cappuccino)] bg-white px-3 py-2"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="price"
            className="mb-1 block text-sm font-medium text-[var(--coffee-charcoal)]"
          >
            Cena (PLN)
          </label>
          <input
            id="price"
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(event) => {
              setPrice(event.target.value);
              notifyChange();
            }}
            className="h-10 w-full border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--coffee-macchiato)]"
            required
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="mb-1 block text-sm font-medium text-[var(--coffee-charcoal)]"
          >
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "active" | "inactive");
              notifyChange();
            }}
            className="h-10 w-full border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--coffee-macchiato)]"
          >
            <option value="inactive">Nieaktywny</option>
            <option value="active">Aktywny</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--coffee-charcoal)]">
          Zdjecie glowne kursu
        </label>
        <FileUpload
          value={mainImageUrl}
          onChange={(url) => {
            setMainImageUrl(url);
            notifyChange();
          }}
          accept="image/*"
        />
        <p className="mt-1 text-sm text-[var(--coffee-espresso)]">
          Przeciagnij i upusc zdjecie kursu lub kliknij aby wybrac plik.
        </p>
      </div>

      <div className="border-t border-[var(--coffee-cappuccino)] pt-6">
        <h3 className="mb-3 text-lg font-semibold text-[var(--coffee-charcoal)]">
          Promocja
        </h3>
        <p className="mb-4 text-sm text-[var(--coffee-espresso)]">
          Opcjonalnie: ustaw date rozpoczecia, aby wlaczyc promocje. Pusta data
          zakonczenia oznacza promocje bez konca.
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm font-medium text-[var(--coffee-charcoal)]">
              Typ znizki
            </label>
            <select
              value={promotionDiscountType}
              onChange={(event) => {
                setPromotionDiscountType(
                  event.target.value as "percentage" | "fixed",
                );
                notifyChange();
              }}
              className="h-10 border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--coffee-macchiato)]"
            >
              <option value="percentage">Procent (%)</option>
              <option value="fixed">Kwota (PLN)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm font-medium text-[var(--coffee-charcoal)]">
              {promotionDiscountType === "percentage"
                ? "Wartosc (%)"
                : "Wartosc (PLN)"}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={promotionDiscountValue}
              onChange={(event) => {
                setPromotionDiscountValue(event.target.value);
                notifyChange();
              }}
              placeholder={
                promotionDiscountType === "percentage" ? "np. 20" : "np. 29.99"
              }
              className="h-10 w-28 border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--coffee-macchiato)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm font-medium text-[var(--coffee-charcoal)]">
              Data od
            </label>
            <input
              type="date"
              value={promotionStartDate}
              onChange={(event) => {
                setPromotionStartDate(event.target.value);
                notifyChange();
              }}
              className="h-10 border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--coffee-macchiato)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm font-medium text-[var(--coffee-charcoal)]">
              Data do (opcjonalnie)
            </label>
            <input
              type="date"
              value={promotionEndDate}
              onChange={(event) => {
                setPromotionEndDate(event.target.value);
                notifyChange();
              }}
              className="h-10 border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--coffee-macchiato)]"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--coffee-charcoal)]">
            Sekcje i elementy lekcji
          </h3>
          <Button type="button" variant="secondary" size="sm" onClick={addSection}>
            + Dodaj sekcje
          </Button>
        </div>

        <div className="space-y-6">
          {sections.map((section, sectionIndex) => {
            const isCollapsed = collapsedSections.has(sectionIndex);

            return (
              <Card key={sectionIndex} variant="elevated" className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSectionCollapsed(sectionIndex)}
                      aria-expanded={!isCollapsed}
                      className="shrink-0 border-radius p-1 text-[var(--coffee-charcoal)] hover:bg-[var(--coffee-cream)]"
                    >
                      {isCollapsed ? (
                        <FiChevronDown className="h-5 w-5" aria-hidden />
                      ) : (
                        <FiChevronUp className="h-5 w-5" aria-hidden />
                      )}
                    </button>
                    <input
                      type="text"
                      placeholder="Tytul sekcji"
                      value={section.title}
                      onChange={(event) =>
                        setSectionTitle(sectionIndex, event.target.value)
                      }
                      className="h-10 min-w-0 flex-1 border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--coffee-macchiato)]"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeSection(sectionIndex)}
                    >
                      Usun sekcje
                    </Button>
                  </div>

                  {isCollapsed ? null : (
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <Card
                          key={itemIndex}
                          variant="default"
                          className="border border-[var(--coffee-cappuccino)]"
                        >
                          <CardContent className="space-y-4 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <label className="mb-1 block text-sm font-medium text-[var(--coffee-charcoal)]">
                                  Tytul elementu
                                </label>
                                <input
                                  type="text"
                                  placeholder="Tytul elementu"
                                  value={item.title}
                                  onChange={(event) =>
                                    setItem(sectionIndex, itemIndex, {
                                      title: event.target.value,
                                    })
                                  }
                                  className="h-10 w-full border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--coffee-macchiato)]"
                                />
                              </div>
                              <div className="rounded bg-[var(--coffee-latte)] px-3 py-2 text-sm font-medium text-[var(--coffee-espresso)]">
                                {getItemKindLabel(item.kind)}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                              <label className="flex items-center gap-2 text-sm font-medium text-[var(--coffee-charcoal)]">
                                <input
                                  type="radio"
                                  name={`kind-${sectionIndex}-${itemIndex}`}
                                  checked={item.kind === "svg"}
                                  onChange={() =>
                                    setItem(sectionIndex, itemIndex, {
                                      kind: "svg",
                                      assetPath: item.assetPath,
                                      youtubeUrl: "",
                                      quiz: null,
                                    })
                                  }
                                />
                                Tekst
                              </label>
                              <label className="flex items-center gap-2 text-sm font-medium text-[var(--coffee-charcoal)]">
                                <input
                                  type="radio"
                                  name={`kind-${sectionIndex}-${itemIndex}`}
                                  checked={item.kind === "youtube"}
                                  onChange={() =>
                                    setItem(sectionIndex, itemIndex, {
                                      kind: "youtube",
                                      assetPath: "",
                                      youtubeUrl: item.youtubeUrl,
                                      quiz: null,
                                    })
                                  }
                                />
                                Video
                              </label>
                              <label className="flex items-center gap-2 text-sm font-medium text-[var(--coffee-charcoal)]">
                                <input
                                  type="radio"
                                  name={`kind-${sectionIndex}-${itemIndex}`}
                                  checked={item.kind === "quiz"}
                                  onChange={() =>
                                    setItem(sectionIndex, itemIndex, {
                                      kind: "quiz",
                                      assetPath: "",
                                      youtubeUrl: "",
                                      quiz: normalizeQuiz(item.quiz),
                                    })
                                  }
                                />
                                Quiz
                              </label>
                            </div>

                            {item.kind === "svg" ? (
                              <div>
                                <label className="mb-1 block text-sm font-medium text-[var(--coffee-charcoal)]">
                                  Plik SVG
                                </label>
                                <FileUpload
                                  value={item.assetPath}
                                  onChange={(url) =>
                                    setItem(sectionIndex, itemIndex, {
                                      assetPath: url,
                                    })
                                  }
                                  accept=".svg,image/svg+xml"
                                  className="w-full"
                                />
                              </div>
                            ) : null}

                            {item.kind === "youtube" ? (
                              <div>
                                <label className="mb-1 block text-sm font-medium text-[var(--coffee-charcoal)]">
                                  URL video
                                </label>
                                <input
                                  type="url"
                                  placeholder="URL YouTube (np. https://youtube.com/watch?v=...)"
                                  value={item.youtubeUrl}
                                  onChange={(event) =>
                                    setItem(sectionIndex, itemIndex, {
                                      youtubeUrl: event.target.value,
                                    })
                                  }
                                  className="h-10 w-full border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--coffee-macchiato)]"
                                />
                              </div>
                            ) : null}

                            {item.kind === "quiz" ? (
                              <div className="space-y-3">
                                <div>
                                  <div className="text-sm font-medium text-[var(--coffee-charcoal)]">
                                    Kreator quizu
                                  </div>
                                  <div className="text-sm text-[var(--coffee-espresso)]">
                                    Dodaj pytania, odpowiedzi i zaznacz poprawne
                                    odpowiedzi.
                                  </div>
                                </div>
                                <CourseQuizBuilder
                                  value={normalizeQuiz(item.quiz)}
                                  onChange={(quiz) =>
                                    setItem(sectionIndex, itemIndex, { quiz })
                                  }
                                />
                              </div>
                            ) : null}

                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => removeItem(sectionIndex, itemIndex)}
                              >
                                Usun element
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <div className="rounded border border-dashed border-[var(--coffee-cappuccino)] bg-[var(--coffee-cream)] p-4">
                        <div className="mb-3 text-sm font-medium text-[var(--coffee-charcoal)]">
                          + Dodaj element
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addItem(sectionIndex, "youtube")}
                          >
                            Video
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addItem(sectionIndex, "svg")}
                          >
                            Tekst
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addItem(sectionIndex, "quiz")}
                          >
                            Quiz
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-4">
          <Button type="button" variant="secondary" size="sm" onClick={addSection}>
            + Dodaj sekcje
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
        <Button type="submit" variant="primary">
          Zapisz
        </Button>
      </div>
    </form>
  );
}
