"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Course } from "@/types/course";
import { Table, Badge } from "@/components/ui";
import type { Column } from "@/components/ui/Table";

type CoursesTabProps = {
  courses: Course[];
  loading: boolean;
};

const PAGE_SIZE = 10;

export function CoursesTab({ courses, loading }: CoursesTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [courses.length]);

  const columns: Column<Course>[] = [
    { key: "title", title: "Tytuł", dataIndex: "title", sortable: true },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      sortable: true,
      render: (_, record) =>
        record.status === "active" ? (
          <Badge variant="success" appearance="button">Aktywny</Badge>
        ) : (
          <Badge variant="error" appearance="button">Nieaktywny</Badge>
        ),
    },
    {
      key: "price",
      title: "Cena",
      dataIndex: "price",
      align: "right",
      sortable: true,
      render: (_, record) => `${(record.price / 100).toFixed(2)} PLN`,
    },
    {
      key: "actions",
      title: "Akcje",
      dataIndex: "id",
      render: (_, record) => (
        <Link
          href={`/dashboard/courses/${record.id}/edit`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-[var(--coffee-mocha)] text-[var(--coffee-mocha)] px-3 py-2 hover:bg-[var(--coffee-cream)] border-radius"
        >
          Edytuj
        </Link>
      ),
    },
  ];

  const empty = (
    <div className="bg-white border border-[var(--coffee-cappuccino)] p-6 text-center text-[var(--coffee-espresso)]">
      Brak kursów.
    </div>
  );

  return (
    <div className="overflow-hidden bg-white border-radius">
      <Table<Course>
        data={courses}
        columns={columns}
        loading={loading}
        empty={empty}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          total: courses.length,
          onChange: setCurrentPage,
        }}
      />
    </div>
  );
}
