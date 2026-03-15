"use client";

import type { CourseWithContent } from "@/types/course";

type CourseProgressProps = {
  course: CourseWithContent;
  completedItems: string[];
};

export function CourseProgress({ course, completedItems }: CourseProgressProps) {
  const totalItems = course.sections.reduce((sum, section) => sum + section.items.length, 0);
  const completedCount = completedItems.length;
  const percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <div className="bg-white border border-[var(--coffee-cappuccino)] border-radius p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-[var(--coffee-charcoal)]">Postęp</h3>
        <span className="text-sm text-[var(--coffee-espresso)]">
          {completedCount}/{totalItems} lekcji ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-[var(--coffee-mocha)] h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
