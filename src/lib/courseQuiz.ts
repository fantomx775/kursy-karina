import type {
  CourseQuiz,
  CourseQuizQuestion,
  CourseQuizQuestionType,
} from "@/types/course";

export type QuizSelections = Record<number, number[]>;

export type QuizAttemptResult = {
  totalQuestions: number;
  correctQuestions: number;
  unansweredQuestions: number;
  isPassed: boolean;
};

function normalizeSelection(selection: number[] | undefined): number[] {
  return Array.from(new Set(selection ?? [])).sort((left, right) => left - right);
}

function getCorrectAnswerIndexes(question: CourseQuizQuestion): number[] {
  return question.answers
    .map((answer, index) => (answer.isCorrect ? index : -1))
    .filter((index) => index >= 0);
}

export function sanitizeQuestionType(
  type: CourseQuizQuestionType,
  answers: CourseQuizQuestion["answers"],
): CourseQuizQuestion["answers"] {
  if (type !== "single") {
    return answers;
  }

  let hasCorrect = false;

  return answers.map((answer) => {
    if (!answer.isCorrect || hasCorrect) {
      return hasCorrect && answer.isCorrect
        ? { ...answer, isCorrect: false }
        : answer;
    }

    hasCorrect = true;
    return answer;
  });
}

export function evaluateQuizQuestion(
  question: CourseQuizQuestion,
  selection: number[] | undefined,
): { isCorrect: boolean; isAnswered: boolean } {
  const selectedIndexes = normalizeSelection(selection);
  const correctIndexes = getCorrectAnswerIndexes(question);

  if (selectedIndexes.length === 0) {
    return { isCorrect: false, isAnswered: false };
  }

  if (selectedIndexes.length !== correctIndexes.length) {
    return { isCorrect: false, isAnswered: true };
  }

  const isCorrect = selectedIndexes.every(
    (selectedIndex, index) => selectedIndex === correctIndexes[index],
  );

  return { isCorrect, isAnswered: true };
}

export function evaluateQuizAttempt(
  quiz: CourseQuiz,
  selections: QuizSelections,
): QuizAttemptResult {
  const totalQuestions = quiz.questions.length;

  const summary = quiz.questions.reduce(
    (accumulator, question, index) => {
      const evaluation = evaluateQuizQuestion(question, selections[index]);

      return {
        correctQuestions:
          accumulator.correctQuestions + (evaluation.isCorrect ? 1 : 0),
        unansweredQuestions:
          accumulator.unansweredQuestions + (evaluation.isAnswered ? 0 : 1),
      };
    },
    { correctQuestions: 0, unansweredQuestions: 0 },
  );

  return {
    totalQuestions,
    correctQuestions: summary.correctQuestions,
    unansweredQuestions: summary.unansweredQuestions,
    isPassed: totalQuestions > 0 && summary.correctQuestions === totalQuestions,
  };
}
