export type StudentSummary = {
  id: string;
  fullName: string;
  email: string;
  registrationDate: string;
  lastLogin: string | null;
  coursesEnrolled: number;
  certificatesRedeemed: number;
};

export type StudentCourseProgress = {
  courseId: string;
  courseTitle: string;
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
  certificateGranted: boolean;
  certificateGrantedAt: string | null;
  certificateGenerated: boolean;
  certificateGeneratedAt: string | null;
  certificateIssuedAt: string | null;
  certificateRegenerationAllowed: boolean;
};

export type StudentDetail = {
  id: string;
  fullName: string;
  email: string;
  registrationDate: string;
  lastLogin: string | null;
  courses: StudentCourseProgress[];
};
