import type { StudentCourseProgress } from "@/types/student";

export function getCertificateGrantConfirmationMessage(
  course: Pick<StudentCourseProgress, "completionPercentage">,
): string {
  if (course.completionPercentage < 100) {
    return "UWAGA! Ten kursant nie ukończył jeszcze 100% kursu. Czy na pewno chcesz mu przyznać certyfikat?";
  }

  return "Ten kursant ukończył 100% kursu. Czy na pewno chcesz mu przyznać certyfikat?";
}
