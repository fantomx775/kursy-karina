import type { StudentCourseProgress } from "@/types/student";

export function getCertificateGrantConfirmationMessage(
  course: Pick<StudentCourseProgress, "completionPercentage">,
): string {
  if (course.completionPercentage < 100) {
    return "UWAGA! Ten kursant nie ukonczyl jeszcze 100% kursu. Czy na pewno chcesz mu przyznac certyfikat?";
  }

  return "Ten kursant ukonczyl 100% kursu. Czy na pewno chcesz mu przyznac certyfikat?";
}
