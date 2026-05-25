import type { CertificateTemplateId } from "@/lib/certificateTemplates";
import type { CourseQuiz, CourseQuizQuestionType } from "@/types/course";

export type CourseFormQuizAnswer = {
  text: string;
  isCorrect: boolean;
};

export type CourseFormQuizQuestion = {
  text: string;
  type: CourseQuizQuestionType;
  answers: CourseFormQuizAnswer[];
};

export type CourseFormQuiz = CourseQuiz;

export type CourseFormItem = {
  title: string;
  kind: "svg" | "youtube" | "quiz";
  assetPath: string;
  youtubeUrl: string;
  quiz: CourseFormQuiz | null;
};

export type CourseFormSection = {
  title: string;
  items: CourseFormItem[];
};

export type CourseFormSaleWindow = {
  startsAt: string;
  endsAt: string;
};

export type CourseFormData = {
  title: string;
  description: string;
  price: number;
  status: "active" | "inactive";
  saleMode: "always_open" | "scheduled";
  saleWindows: CourseFormSaleWindow[];
  accessDurationMonths: number;
  mainImageUrl?: string;
  certificateTemplateId: CertificateTemplateId;
  sections: CourseFormSection[];
  promotionDiscountType?: "percentage" | "fixed" | null;
  promotionDiscountValue?: number | null;
  promotionStartDate?: string | null;
  promotionEndDate?: string | null;
};
