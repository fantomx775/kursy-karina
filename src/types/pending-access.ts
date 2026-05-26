export type PendingAccessRecord = {
  id: string;
  orderId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  instagramUsername: string | null;
  courseId: string;
  courseTitle: string;
  courseSlug: string | null;
  purchaseDate: string;
  pendingSince: string;
  daysWaiting: number;
  accessDurationMonths: number | null;
};

export type PendingAccessActivationResult = {
  itemId: string;
  status: "activated" | "already_active" | "not_found" | "failed";
  accessExpiresAt: string | null;
  error?: string;
};
