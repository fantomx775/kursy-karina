export type CourseStatus = "active" | "inactive";
export type CourseItemKind = "svg" | "youtube";

export type PromotionDiscountType = "percentage" | "fixed";

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  status: CourseStatus;
  main_image_url?: string;
  promotion_discount_type?: PromotionDiscountType | null;
  promotion_discount_value?: number | null;
  promotion_start_date?: string | null;
  promotion_end_date?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CourseItem = {
  id: string;
  section_id: string;
  title: string;
  kind: CourseItemKind;
  asset_path: string | null;
  youtube_url: string | null;
  position: number;
  is_preview: boolean;
};

export type CourseSection = {
  id: string;
  course_id: string;
  title: string;
  position: number;
  items: CourseItem[];
};

export type CourseWithContent = Course & {
  sections: CourseSection[];
};
