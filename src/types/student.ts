export type StudentSummary = {
  id: string;
  fullName: string;
  email: string;
  instagramUsername: string | null;
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
  accessStatus: "active" | "pending" | "expired";
  accessExpiresAt: string | null;
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
  instagramUsername: string | null;
  registrationDate: string;
  lastLogin: string | null;
  courses: StudentCourseProgress[];
};
