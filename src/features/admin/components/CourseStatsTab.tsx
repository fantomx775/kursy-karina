"use client";

import { useState, useEffect } from "react";
import type { CourseStatsSummary } from "@/types/admin-stats";
import { Table } from "@/components/ui";
import type { Column } from "@/components/ui/Table";

type CourseStatsTabProps = {
  courseStats: CourseStatsSummary[];
  loading: boolean;
  onViewDetails: (courseId: string) => void;
};

const PAGE_SIZE = 10;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatRevenue(grosze: number | null | undefined): string {
  if (grosze == null) return "—";
  return `${(grosze / 100).toFixed(2)} PLN`;
}

export function CourseStatsTab({
  courseStats,
  loading,
  onViewDetails,
}: CourseStatsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [courseStats.length]);

  const columns: Column<CourseStatsSummary>[] = [
    { key: "title", title: "Tytuł", dataIndex: "title" },
    {
      key: "createdAt",
      title: "Data dodania",
      dataIndex: "createdAt",
      render: (_, record) => formatDate(record.createdAt),
    },
    {
      key: "buyersCount",
      title: "Liczba kupujących",
      dataIndex: "buyersCount",
      align: "right",
      render: (_, record) => String(record.buyersCount),
    },
    {
      key: "lastPurchaseAt",
      title: "Ostatni zakup",
      dataIndex: "lastPurchaseAt",
      render: (_, record) => formatDate(record.lastPurchaseAt),
    },
    {
      key: "totalRevenue",
      title: "Przychód",
      dataIndex: "totalRevenue",
      align: "right",
      render: (_, record) => formatRevenue(record.totalRevenue),
    },
    {
      key: "details",
      title: "Szczegóły",
      dataIndex: "id",
      render: (_, record) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(record.id);
          }}
          className="inline-block border border-[var(--coffee-mocha)] text-[var(--coffee-mocha)] px-3 py-2 hover:bg-[var(--coffee-cream)] border-radius"
        >
          Szczegóły
        </button>
      ),
    },
  ];

  const empty = (
    <div className="border border-[var(--coffee-cappuccino)] border-radius p-8 text-center text-[var(--coffee-espresso)] bg-[var(--coffee-cream)]">
      <p className="font-medium">Brak kursów do wyświetlenia.</p>
      <p className="mt-2 text-sm">Statystyki pokazują wszystkie kursy z liczbą kupujących i przychodem.</p>
    </div>
  );

  return (
    <div className="overflow-hidden bg-white border-radius">
      <Table<CourseStatsSummary>
        data={courseStats}
        columns={columns}
        loading={loading}
        empty={empty}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          total: courseStats.length,
          onChange: setCurrentPage,
        }}
        onRowClick={(record) => onViewDetails(record.id)}
      />
    </div>
  );
}
