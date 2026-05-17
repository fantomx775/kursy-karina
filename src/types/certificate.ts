import type { CertificateTemplate } from "@/lib/certificateTemplates";

export type CertificateEligibleStudent = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  completedItems: number;
  totalItems: number;
};

export type CertificateAdminData = {
  templates: CertificateTemplate[];
  eligibleStudents: CertificateEligibleStudent[];
  actionRequiredCount: number;
};
