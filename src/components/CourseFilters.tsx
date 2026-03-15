"use client";

import { useState } from "react";
import type { Course } from "@/types/course";

type CourseFiltersProps = {
  courses: Course[];
  onFilteredCourses: (courses: Course[]) => void;
};

export function CourseFilters({ courses, onFilteredCourses }: CourseFiltersProps) {
  const [sortBy, setSortBy] = useState<"title" | "price" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");

  const applyFilters = () => {
    let filtered = courses.filter((course) => {
      // Status filter
      if (statusFilter !== "all" && course.status !== statusFilter) {
        return false;
      }
      
      // Price range filter
      if (course.price < priceRange[0] || course.price > priceRange[1]) {
        return false;
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "created_at":
          comparison = new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime();
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

    onFilteredCourses(filtered);
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  return (
    <div className="bg-white border border-[var(--coffee-cappuccino)] border-radius p-4 space-y-4">
      <h3 className="font-semibold text-[var(--coffee-charcoal)]">Filtry i sortowanie</h3>
      
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-[var(--coffee-charcoal)] mb-2">
          Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full border border-[var(--coffee-cappuccino)] px-3 py-2 border-radius"
        >
          <option value="all">Wszystkie</option>
          <option value="active">Aktywne</option>
          <option value="inactive">Nieaktywne</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-[var(--coffee-charcoal)] mb-2">
          Zakres cenowy: {(priceRange[0] / 100).toFixed(2)} - {(priceRange[1] / 100).toFixed(2)} PLN
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-[var(--coffee-charcoal)] mb-2">
          Sortuj według
        </label>
        <div className="flex gap-2">
          {[
            { key: "title", label: "Tytuł" },
            { key: "price", label: "Cena" },
            { key: "created_at", label: "Data" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSortChange(key as any)}
              className={`px-3 py-1 border border-radius text-sm ${
                sortBy === key
                  ? "border-[var(--coffee-mocha)] text-[var(--coffee-mocha)]"
                  : "border-[var(--coffee-cappuccino)] text-[var(--coffee-espresso)]"
              }`}
            >
              {label}
              {sortBy === key && (sortOrder === "asc" ? " ↑" : " ↓")}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={applyFilters}
        className="w-full border-radius bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white py-2"
      >
        Zastosuj filtry
      </button>
    </div>
  );
}
