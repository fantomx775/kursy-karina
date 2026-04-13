"use client";

import { useMemo, useState } from "react";
import { evaluateQuizAttempt, type QuizSelections } from "@/lib/courseQuiz";
import type { CourseItem, CourseQuizQuestion } from "@/types/course";

type Props = {
  item: CourseItem;
  isCompleted: boolean;
  onPass: (itemId: string) => Promise<void> | void;
};

type AttemptState = {
  totalQuestions: number;
  correctQuestions: number;
  unansweredQuestions: number;
  isPassed: boolean;
};

function getQuestionTypeLabel(question: CourseQuizQuestion): string {
  return question.type === "multiple"
    ? "Wielokrotny wybor"
    : "Jednokrotny wybor";
}

export function QuizSection({ item, isCompleted, onPass }: Props) {
  const quiz = item.quiz_data;
  const [selections, setSelections] = useState<QuizSelections>({});
  const [attempt, setAttempt] = useState<AttemptState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusText = isCompleted
    ? "Quiz zaliczony. Kolejne proby nie cofna progresu."
    : "Rozwiaz quiz i kliknij Sprawdz.";

  const attemptMessage = useMemo(() => {
    if (!attempt) {
      return null;
    }

    if (attempt.isPassed) {
      return isCompleted
        ? `Wynik: ${attempt.correctQuestions}/${attempt.totalQuestions}. Quiz pozostaje zaliczony.`
        : `Wynik: ${attempt.correctQuestions}/${attempt.totalQuestions}. Quiz zostal zaliczony.`;
    }

    if (isCompleted) {
      return `Wynik tej proby: ${attempt.correctQuestions}/${attempt.totalQuestions}. Quiz pozostaje zaliczony.`;
    }

    return `Wynik: ${attempt.correctQuestions}/${attempt.totalQuestions}. Sprobuj ponownie.`;
  }, [attempt, isCompleted]);

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="border-radius border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        Ten quiz nie ma jeszcze skonfigurowanych pytan.
      </div>
    );
  }

  const setSingleSelection = (questionIndex: number, answerIndex: number) => {
    setSelections((previous) => ({
      ...previous,
      [questionIndex]: [answerIndex],
    }));
  };

  const toggleMultipleSelection = (questionIndex: number, answerIndex: number) => {
    setSelections((previous) => {
      const current = previous[questionIndex] ?? [];
      const alreadySelected = current.includes(answerIndex);
      const nextSelection = alreadySelected
        ? current.filter((value) => value !== answerIndex)
        : [...current, answerIndex];

      return {
        ...previous,
        [questionIndex]: nextSelection,
      };
    });
  };

  const handleSubmit = async () => {
    const result = evaluateQuizAttempt(quiz, selections);
    setAttempt(result);

    if (!result.isPassed || isCompleted) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onPass(item.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded border border-[var(--coffee-cappuccino)] bg-[var(--coffee-cream)] p-4">
        <div className="text-sm font-semibold text-[var(--coffee-charcoal)]">
          {statusText}
        </div>
        <div className="mt-1 text-sm text-[var(--coffee-espresso)]">
          Aby zaliczyc quiz, wszystkie pytania musza byc rozwiazane poprawnie.
        </div>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question, questionIndex) => (
          <fieldset
            key={questionIndex}
            className="rounded border border-[var(--coffee-cappuccino)] bg-[var(--coffee-cream)] p-4"
          >
            <legend className="px-1 text-sm font-semibold text-[var(--coffee-charcoal)]">
              Pytanie {questionIndex + 1}
            </legend>

            <div className="space-y-3">
              <div>
                <div className="text-base font-medium text-[var(--coffee-charcoal)]">
                  {question.text}
                </div>
                <div className="text-sm text-[var(--coffee-espresso)]">
                  {getQuestionTypeLabel(question)}
                </div>
              </div>

              <div className="space-y-2">
                {question.answers.map((answer, answerIndex) => {
                  const inputId = `${item.id}-question-${questionIndex}-answer-${answerIndex}`;
                  const selectedAnswers = selections[questionIndex] ?? [];
                  const checked = selectedAnswers.includes(answerIndex);

                  return (
                    <label
                      key={answerIndex}
                      htmlFor={inputId}
                      className="flex cursor-pointer items-center gap-3 rounded border border-[var(--coffee-cappuccino)] bg-white px-3 py-3 text-sm text-[var(--coffee-charcoal)]"
                    >
                      <input
                        id={inputId}
                        type={question.type === "single" ? "radio" : "checkbox"}
                        name={`${item.id}-question-${questionIndex}`}
                        checked={checked}
                        onChange={() =>
                          question.type === "single"
                            ? setSingleSelection(questionIndex, answerIndex)
                            : toggleMultipleSelection(questionIndex, answerIndex)
                        }
                      />
                      <span>{answer.text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </fieldset>
        ))}
      </div>

      {attemptMessage ? (
        <div
          className={`rounded border p-3 text-sm ${
            attempt?.isPassed || isCompleted
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
          role="status"
        >
          {attemptMessage}
          {attempt && attempt.unansweredQuestions > 0 ? (
            <div className="mt-1">
              Nie odpowiedziano na: {attempt.unansweredQuestions}
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          void handleSubmit();
        }}
        disabled={isSubmitting}
        className="h-10 border-radius bg-[var(--coffee-mocha)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--coffee-espresso)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Zapisywanie..." : "Sprawdz"}
      </button>
    </div>
  );
}
