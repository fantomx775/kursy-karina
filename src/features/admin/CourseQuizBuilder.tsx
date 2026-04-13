"use client";

import { Button, Card, CardContent } from "@/components/ui";
import { sanitizeQuestionType } from "@/lib/courseQuiz";
import type {
  CourseFormQuiz,
  CourseFormQuizAnswer,
  CourseFormQuizQuestion,
} from "./course-form-types";

type Props = {
  value: CourseFormQuiz;
  onChange: (nextQuiz: CourseFormQuiz) => void;
};

function createAnswer(): CourseFormQuizAnswer {
  return {
    text: "",
    isCorrect: false,
  };
}

function createQuestion(): CourseFormQuizQuestion {
  return {
    text: "",
    type: "single",
    answers: [createAnswer(), createAnswer()],
  };
}

export function createEmptyQuiz(): CourseFormQuiz {
  return {
    questions: [createQuestion()],
  };
}

export function CourseQuizBuilder({ value, onChange }: Props) {
  const questions = value.questions;

  const setQuestions = (
    updater:
      | CourseFormQuizQuestion[]
      | ((currentQuestions: CourseFormQuizQuestion[]) => CourseFormQuizQuestion[]),
  ) => {
    const nextQuestions =
      typeof updater === "function" ? updater(questions) : updater;
    onChange({ questions: nextQuestions });
  };

  const setQuestionText = (questionIndex: number, text: string) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) =>
        index === questionIndex ? { ...question, text } : question,
      ),
    );
  };

  const setQuestionType = (
    questionIndex: number,
    type: CourseFormQuizQuestion["type"],
  ) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              type,
              answers: sanitizeQuestionType(type, question.answers),
            }
          : question,
      ),
    );
  };

  const addQuestion = () => {
    setQuestions((currentQuestions) => [...currentQuestions, createQuestion()]);
  };

  const removeQuestion = (questionIndex: number) => {
    if (questions.length === 1) {
      setQuestions([createQuestion()]);
      return;
    }

    setQuestions((currentQuestions) =>
      currentQuestions.filter((_, index) => index !== questionIndex),
    );
  };

  const setAnswerText = (
    questionIndex: number,
    answerIndex: number,
    text: string,
  ) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
              ...question,
              answers: question.answers.map((answer, currentAnswerIndex) =>
                currentAnswerIndex === answerIndex ? { ...answer, text } : answer,
              ),
            }
          : question,
      ),
    );
  };

  const toggleAnswerCorrect = (questionIndex: number, answerIndex: number) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, currentQuestionIndex) => {
        if (currentQuestionIndex !== questionIndex) {
          return question;
        }

        return {
          ...question,
          answers: question.answers.map((answer, currentAnswerIndex) => {
            if (question.type === "single") {
              return {
                ...answer,
                isCorrect: currentAnswerIndex === answerIndex,
              };
            }

            if (currentAnswerIndex !== answerIndex) {
              return answer;
            }

            return {
              ...answer,
              isCorrect: !answer.isCorrect,
            };
          }),
        };
      }),
    );
  };

  const addAnswer = (questionIndex: number) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
              ...question,
              answers: [...question.answers, createAnswer()],
            }
          : question,
      ),
    );
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, currentQuestionIndex) => {
        if (currentQuestionIndex !== questionIndex) {
          return question;
        }

        const nextAnswers =
          question.answers.length <= 2
            ? [createAnswer(), createAnswer()]
            : question.answers.filter((_, index) => index !== answerIndex);

        return {
          ...question,
          answers:
            question.type === "single"
              ? sanitizeQuestionType(question.type, nextAnswers)
              : nextAnswers,
        };
      }),
    );
  };

  return (
    <div className="space-y-4">
      {questions.map((question, questionIndex) => (
        <Card
          key={questionIndex}
          variant="default"
          className="border border-[var(--coffee-cappuccino)]"
        >
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-sm font-medium text-[var(--coffee-charcoal)]">
                  Pytanie {questionIndex + 1}
                </label>
                <textarea
                  value={question.text}
                  onChange={(event) =>
                    setQuestionText(questionIndex, event.target.value)
                  }
                  placeholder="Tresc pytania"
                  className="min-h-[96px] w-full border border-[var(--coffee-cappuccino)] bg-white px-3 py-2"
                />
              </div>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeQuestion(questionIndex)}
              >
                Usun pytanie
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--coffee-charcoal)]">
                <input
                  type="radio"
                  name={`question-type-${questionIndex}`}
                  checked={question.type === "single"}
                  onChange={() => setQuestionType(questionIndex, "single")}
                />
                Jednokrotny wybor
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--coffee-charcoal)]">
                <input
                  type="radio"
                  name={`question-type-${questionIndex}`}
                  checked={question.type === "multiple"}
                  onChange={() => setQuestionType(questionIndex, "multiple")}
                />
                Wielokrotny wybor
              </label>
            </div>

            <div className="space-y-3">
              {question.answers.map((answer, answerIndex) => (
                <div
                  key={answerIndex}
                  className="flex flex-wrap items-center gap-3 rounded border border-[var(--coffee-cappuccino)] bg-[var(--coffee-cream)] p-3"
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--coffee-charcoal)]">
                    <input
                      type={question.type === "single" ? "radio" : "checkbox"}
                      name={`question-${questionIndex}-correct`}
                      checked={answer.isCorrect}
                      onChange={() => toggleAnswerCorrect(questionIndex, answerIndex)}
                    />
                    Poprawna
                  </label>
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(event) =>
                      setAnswerText(questionIndex, answerIndex, event.target.value)
                    }
                    placeholder={`Odpowiedz ${answerIndex + 1}`}
                    className="h-10 min-w-0 flex-1 border border-[var(--coffee-cappuccino)] bg-white px-3 py-2"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAnswer(questionIndex, answerIndex)}
                  >
                    Usun odpowiedz
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addAnswer(questionIndex)}
            >
              + Dodaj odpowiedz
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
        + Dodaj pytanie
      </Button>
    </div>
  );
}
