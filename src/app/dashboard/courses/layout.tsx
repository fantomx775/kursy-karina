import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { authenticateAdmin } from "@/services/auth/server";

type DashboardCoursesLayoutProps = {
  children: ReactNode;
};

export default async function DashboardCoursesLayout({
  children,
}: DashboardCoursesLayoutProps) {
  const auth = await authenticateAdmin();

  if (!auth.success) {
    if (auth.statusCode === 401) {
      redirect("/login");
    }
    redirect("/dashboard");
  }

  return <>{children}</>;
}
