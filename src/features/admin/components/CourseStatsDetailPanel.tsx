"use client";

import { FiCalendar, FiUsers } from "react-icons/fi";
import type { CourseStatsDetail } from "@/types/admin-stats";
import { Table } from "@/components/ui";
import type { Column } from "@/components/ui/Table";

type Props = {
  detail: CourseStatsDetail;
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CourseStatsDetailPanel({ detail }: Props) {
  const columns: Column<(typeof detail.purchasers)[number]>[] = [
    {
      key: "fullName",
      title: "Imię i nazwisko",
      dataIndex: "fullName",
      render: (_, record) => (
        <span className="font-medium text-[var(--coffee-charcoal)]">
          {record.fullName}
        </span>
      ),
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
      render: (_, record) => (
        <a
          href={`mailto:${record.email}`}
          className="text-[var(--coffee-mocha)] hover:underline"
        >
          {record.email}
        </a>
      ),
    },
    {
      key: "purchaseDate",
      title: "Data zakupu",
      dataIndex: "purchaseDate",
      render: (_, record) => formatDate(record.purchaseDate),
    },
    {
      key: "progress",
      title: "Postęp",
      dataIndex: "completionPercentage",
      align: "right",
      render: (_, record) =>
        `${record.completedItems} / ${record.totalItems} (${record.completionPercentage}%)`,
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <div className="bg-white border border-[var(--coffee-cappuccino)] border-radius p-5">
          <h3 className="text-[var(--text-sm)] font-semibold text-[var(--coffee-espresso)] uppercase tracking-wide mb-4">
            Dane kursu
          </h3>
          <p className="text-[var(--text-xl)] font-semibold text-[var(--coffee-charcoal)] mb-4">
            {detail.title}
          </p>
          <ul className="grid gap-3 sm:grid-cols-1">
            <li className="flex items-center gap-3 text-[var(--text-sm)] text-[var(--coffee-charcoal)]">
              <span className="flex shrink-0 w-8 h-8 items-center justify-center border-radius bg-[var(--coffee-latte)] text-[var(--coffee-mocha)]">
                <FiCalendar className="w-4 h-4" aria-hidden />
              </span>
              <span>
                <span className="text-[var(--coffee-espresso)]">Data dodania: </span>
                {formatDate(detail.createdAt)}
              </span>
            </li>
            <li className="flex items-center gap-3 text-[var(--text-sm)] text-[var(--coffee-charcoal)]">
              <span className="flex shrink-0 w-8 h-8 items-center justify-center border-radius bg-[var(--coffee-latte)] text-[var(--coffee-mocha)]">
                <FiUsers className="w-4 h-4" aria-hidden />
              </span>
              <span>
                <span className="text-[var(--coffee-espresso)]">Liczba kupujących: </span>
                {detail.buyersCount}
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="text-[var(--text-base)] font-semibold text-[var(--coffee-charcoal)] mb-3">
          Kupujący i postęp
        </h3>
        {detail.purchasers.length === 0 ? (
          <div className="bg-white border border-[var(--coffee-cappuccino)] border-radius p-6 text-center text-[var(--text-sm)] text-[var(--coffee-espresso)]">
            Brak kupujących.
          </div>
        ) : (
          <div className="overflow-hidden bg-white border border-[var(--coffee-cappuccino)] border-radius">
            <Table
              data={detail.purchasers}
              columns={columns}
              size="sm"
            />
          </div>
        )}
      </section>
    </div>
  );
}
