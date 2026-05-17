export type StudentSummary = {
  id: string;
  fullName: string;
  email: string;
  registrationDate: string;
  lastLogin: string | null;
  coursesEnrolled: number;
};

export type StudentCourseProgress = {
  courseId: string;
  courseTitle: string;
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
  accessStatus: "active" | "expired";
  accessExpiresAt: string | null;
  certificateGranted: boolean;
  certificateGrantedAt: string | null;
};

export type StudentDetail = {
  id: string;
  fullName: string;
  email: string;
  registrationDate: string;
  lastLogin: string | null;
  courses: StudentCourseProgress[];
};
