"use client";

import { useState, useEffect } from "react";
import type { StudentSummary } from "@/types/student";
import { Table } from "@/components/ui";
import type { Column } from "@/components/ui/Table";

type StudentsTabProps = {
  students: StudentSummary[];
  loading: boolean;
  onViewStudent: (studentId: string) => void;
};

const PAGE_SIZE = 10;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StudentsTab({ students, loading, onViewStudent }: StudentsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [students.length]);

  const columns: Column<StudentSummary>[] = [
    { key: "fullName", title: "Imię i nazwisko", dataIndex: "fullName", sortable: true },
    { key: "email", title: "Email", dataIndex: "email", sortable: true },
    {
      key: "registrationDate",
      title: "Data rejestracji",
      dataIndex: "registrationDate",
      sortable: true,
      render: (_, record) => formatDate(record.registrationDate),
    },
    {
      key: "lastLogin",
      title: "Ostatnie logowanie",
      dataIndex: "lastLogin",
      sortable: true,
      render: (_, record) => formatDate(record.lastLogin ?? null),
    },
    {
      key: "coursesEnrolled",
      title: "Liczba kursów",
      dataIndex: "coursesEnrolled",
      align: "center",
      sortable: true,
    },
    {
      key: "actions",
      title: "Akcje",
      dataIndex: "id",
      render: (_, record) => (
        <button
          type="button"
          className="border border-[var(--coffee-mocha)] text-[var(--coffee-mocha)] px-3 py-2 hover:bg-[var(--coffee-cream)] border-radius"
          onClick={(e) => {
            e.stopPropagation();
            onViewStudent(record.id);
          }}
        >
          Szczegóły
        </button>
      ),
    },
  ];

  const empty = (
    <div className="bg-white border border-[var(--coffee-cappuccino)] p-6 text-center text-[var(--coffee-espresso)]">
      Brak kursantów.
    </div>
  );

  return (
    <div className="overflow-hidden bg-white border-radius">
      <Table<StudentSummary>
        data={students}
        columns={columns}
        loading={loading}
        empty={empty}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          total: students.length,
          onChange: setCurrentPage,
        }}
      />
    </div>
  );
}
