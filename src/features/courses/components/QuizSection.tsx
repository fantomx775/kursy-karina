"use client";

import { useMemo, useState } from "react";
import { BlockingSpinner } from "@/components/ui";
import { Badge } from "@/components/ui/Badge/Badge";
import {
  evaluateQuizAttempt,
  evaluateQuizQuestion,
  type QuizSelections,
} from "@/lib/courseQuiz";
import { cn } from "@/lib/utils";
import type { CourseItem, CourseQuizQuestion } from "@/types/course";

type Props = {
  item: CourseItem;
  isCompleted: boolean;
  onPass: (itemId: string) => Promise<void> | void;
};

type AttemptState = {
  totalQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  unansweredQuestions: number;
  isPassed: boolean;
};

function getQuestionFieldsetClassName(
  isLockedCorrect: boolean,
  hasActiveAttempt: boolean,
  evaluation: { isCorrect: boolean; isAnswered: boolean } | null,
): string {
  if (isLockedCorrect) {
    return "border-radius border border-green-200 bg-green-50";
  }

  if (!hasActiveAttempt || !evaluation) {
    return "border-radius border border-[var(--coffee-cappuccino)] bg-[var(--coffee-cream)]";
  }

  if (evaluation.isCorrect) {
    return "border-radius border border-green-200 bg-green-50";
  }

  if (evaluation.isAnswered) {
    return "border-radius border border-red-200 bg-red-50";
  }

  return "border-radius border border-amber-200 bg-amber-50";
}

function getQuestionTypeLabel(question: CourseQuizQuestion): string {
  return question.type === "multiple"
    ? "Wielokrotny wybór"
    : "Jednokrotny wybór";
}

export function QuizSection({ item, isCompleted, onPass }: Props) {
  const quiz = item.quiz_data;
  const [selections, setSelections] = useState<QuizSelections>({});
  const [attempt, setAttempt] = useState<AttemptState | null>(null);
  const [lockedCorrectQuestions, setLockedCorrectQuestions] = useState<
    Set<number>
  >(() => new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasActiveAttempt = attempt !== null;

  const statusText = isCompleted
    ? "Quiz zaliczony. Kolejne próby nie cofną progresu."
    : "Rozwiąż quiz i kliknij Sprawdź.";

  const attemptMessage = useMemo(() => {
    if (!hasActiveAttempt || !attempt) {
      return null;
    }

    if (attempt.isPassed) {
      return isCompleted
        ? `Wynik: ${attempt.correctQuestions}/${attempt.totalQuestions}. Quiz pozostaje zaliczony.`
        : `Wynik: ${attempt.correctQuestions}/${attempt.totalQuestions}. Quiz został zaliczony.`;
    }

    if (isCompleted) {
      return `Wynik tej próby: ${attempt.correctQuestions}/${attempt.totalQuestions}. Quiz pozostaje zaliczony.`;
    }

    return `Wynik: ${attempt.correctQuestions}/${attempt.totalQuestions}. Spróbuj ponownie.`;
  }, [attempt, hasActiveAttempt, isCompleted]);

  const attemptBreakdown = useMemo(() => {
    if (!hasActiveAttempt || !attempt) {
      return null;
    }

    return `${attempt.correctQuestions} dobrze, ${attempt.wrongQuestions} źle, ${attempt.unansweredQuestions} nieodpowiedziano`;
  }, [attempt, hasActiveAttempt]);

  const clearAttemptFeedback = () => {
    setAttempt(null);
  };

  const unlockQuestion = (questionIndex: number) => {
    setLockedCorrectQuestions((previous) => {
      if (!previous.has(questionIndex)) {
        return previous;
      }

      const next = new Set(previous);
      next.delete(questionIndex);
      return next;
    });
  };

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="border-radius border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        Ten quiz nie ma jeszcze skonfigurowanych pytan.
      </div>
    );
  }

  const setSingleSelection = (questionIndex: number, answerIndex: number) => {
    clearAttemptFeedback();
    unlockQuestion(questionIndex);
    setSelections((previous) => ({
      ...previous,
      [questionIndex]: [answerIndex],
    }));
  };

  const toggleMultipleSelection = (
    questionIndex: number,
    answerIndex: number,
  ) => {
    clearAttemptFeedback();
    unlockQuestion(questionIndex);
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
    setLockedCorrectQuestions((previous) => {
      const next = new Set(previous);
      quiz.questions.forEach((question, questionIndex) => {
        const evaluation = evaluateQuizQuestion(
          question,
          selections[questionIndex],
        );
        if (evaluation.isCorrect) {
          next.add(questionIndex);
        }
      });
      return next;
    });

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
      <BlockingSpinner show={isSubmitting} message="Zapisywanie wyniku..." />
      <div className="rounded border border-[var(--coffee-cappuccino)] bg-[var(--coffee-cream)] p-4">
        <div className="text-sm font-semibold text-[var(--coffee-charcoal)]">
          {statusText}
        </div>
        <div className="mt-1 text-sm text-[var(--coffee-espresso)]">
          Aby zaliczyć quiz, wszystkie pytania muszą być rozwiązane poprawnie.
        </div>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question, questionIndex) => {
          const isLockedCorrect = lockedCorrectQuestions.has(questionIndex);
          const questionEvaluation = hasActiveAttempt
            ? evaluateQuizQuestion(question, selections[questionIndex])
            : null;
          const showSuccessBadge =
            isLockedCorrect || questionEvaluation?.isCorrect === true;
          const showErrorBadge =
            hasActiveAttempt &&
            questionEvaluation !== null &&
            !isLockedCorrect &&
            !questionEvaluation.isCorrect &&
            questionEvaluation.isAnswered;

          return (
          <fieldset
            key={questionIndex}
            className={cn(
              "p-4",
              getQuestionFieldsetClassName(
                isLockedCorrect,
                hasActiveAttempt,
                questionEvaluation,
              ),
            )}
          >
            <legend className="flex w-full items-center justify-between gap-2 px-1 text-sm font-semibold text-[var(--coffee-charcoal)]">
              <span>Pytanie {questionIndex + 1}</span>
              {showSuccessBadge ? (
                <Badge variant="success" size="sm" rounded={false}>
                  Dobrze!
                </Badge>
              ) : null}
              {showErrorBadge ? (
                <Badge variant="error" size="sm" rounded={false}>
                  Źle
                </Badge>
              ) : null}
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
                      className="flex cursor-pointer items-center gap-3 border-radius border border-[var(--coffee-cappuccino)] bg-white px-3 py-3 text-sm text-[var(--coffee-charcoal)] transition-all duration-200 active:bg-[var(--coffee-latte)] active:scale-[0.99]"
                    >
                      <input
                        id={inputId}
                        type={question.type === "single" ? "radio" : "checkbox"}
                        name={`${item.id}-question-${questionIndex}`}
                        checked={checked}
                        onChange={() =>
                          question.type === "single"
                            ? setSingleSelection(questionIndex, answerIndex)
                            : toggleMultipleSelection(
                                questionIndex,
                                answerIndex,
                              )
                        }
                      />
                      <span>{answer.text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </fieldset>
          );
        })}
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
          {attemptBreakdown ? (
            <div className="mt-1">{attemptBreakdown}</div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          void handleSubmit();
        }}
        disabled={isSubmitting}
        className="h-10 border-radius bg-[var(--coffee-mocha)] px-4 text-sm font-medium text-white transition-all duration-200 hover:bg-[var(--coffee-espresso)] active:bg-[var(--coffee-dark)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Zapisywanie..." : "Sprawdź"}
      </button>
    </div>
  );
}
