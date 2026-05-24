export type UserRole = "admin" | "student";

export type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  instagram_username: string | null;
  role: UserRole;
  created_at: string;
  updated_at?: string;
};
