export type CourseStatsSummary = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  buyersCount: number;
  lastPurchaseAt?: string | null;
  activeAccessCount?: number;
  totalRevenue?: number | null;
};

export type PurchaserWithProgress = {
  userId: string;
  fullName: string;
  email: string;
  purchaseDate: string;
  accessStatus: "active" | "expired";
  accessExpiresAt: string | null;
  completedItems: number;
  totalItems: number;
  completionPercentage: number;
};

export type CourseStatsDetail = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  buyersCount: number;
  activeAccessCount?: number;
  purchasers: PurchaserWithProgress[];
};
