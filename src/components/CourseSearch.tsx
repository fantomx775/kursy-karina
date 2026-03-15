"use client";

import { useState, useEffect } from "react";
import type { Course } from "@/types/course";

type CourseSearchProps = {
  courses: Course[];
  onCourseSelect: (course: Course) => void;
};

export function CourseSearch({ courses, onCourseSelect }: CourseSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses);

  useEffect(() => {
    const filtered = courses.filter((course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  return (
    <div className="bg-white border border-[var(--coffee-cappuccino)] border-radius p-4">
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Szukaj kursów..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-[var(--coffee-cappuccino)] border-radius focus:outline-none focus:ring-2 focus:ring-[var(--coffee-mocha)]"
        />
        <svg
          className="absolute left-3 top-2.5 w-5 h-5 text-[var(--coffee-espresso)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {searchTerm && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredCourses.length === 0 ? (
            <p className="text-[var(--coffee-espresso)] text-center py-4">
              Nie znaleziono kursów dla "{searchTerm}"
            </p>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => onCourseSelect(course)}
                className="p-3 border border-[var(--coffee-cappuccino)] border-radius cursor-pointer hover:bg-[var(--coffee-cream)] transition-colors"
              >
                <h4 className="font-semibold text-[var(--coffee-charcoal)]">
                  {course.title}
                </h4>
                <p className="text-sm text-[var(--coffee-espresso)] line-clamp-2">
                  {course.description}
                </p>
                <p className="text-sm font-medium text-[var(--coffee-mocha)] mt-1">
                  {(course.price / 100).toFixed(2)} PLN
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
