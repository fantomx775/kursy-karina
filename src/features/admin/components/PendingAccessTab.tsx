"use client";

import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { Button, Checkbox, Table } from "@/components/ui";
import type { Column } from "@/components/ui/Table";
import {
  DEFAULT_COURSE_ACCESS_DURATION_MONTHS,
  formatAccessDuration,
} from "@/lib/accessDuration";
import type { PendingAccessRecord } from "@/types/pending-access";

type PendingAccessTabProps = {
  pendingAccess: PendingAccessRecord[];
  loading: boolean;
  activatingIds: string[];
  onRefresh: () => Promise<void>;
  onActivate: (itemIds: string[]) => Promise<void>;
};

const PAGE_SIZE = 10;

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getWaitingLabel(daysWaiting: number): string {
  if (daysWaiting === 0) return "Dzisiaj";
  if (daysWaiting === 1) return "1 dzień";
  return `${daysWaiting} dni`;
}

export function PendingAccessTab({
  pendingAccess,
  loading,
  activatingIds,
  onRefresh,
  onActivate,
}: PendingAccessTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [courseFilter, setCourseFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const activatingSet = useMemo(() => new Set(activatingIds), [activatingIds]);

  const courseOptions = useMemo(() => {
    const byId = new Map<string, string>();
    pendingAccess.forEach((record) => {
      byId.set(record.courseId, record.courseTitle);
    });

    return Array.from(byId.entries())
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title, "pl"));
  }, [pendingAccess]);

  const filteredAccess = useMemo(() => {
    if (courseFilter === "all") return pendingAccess;
    return pendingAccess.filter((record) => record.courseId === courseFilter);
  }, [courseFilter, pendingAccess]);

  const visibleIds = useMemo(
    () => filteredAccess.map((record) => record.id),
    [filteredAccess],
  );
  const selectedVisibleIds = selectedIds.filter((id) =>
    visibleIds.includes(id),
  );
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleIds.length === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleIds.length > 0 && !allVisibleSelected;

  useEffect(() => {
    setCurrentPage(1);
  }, [courseFilter, filteredAccess.length]);

  useEffect(() => {
    setSelectedIds((previous) =>
      previous.filter((id) => pendingAccess.some((record) => record.id === id)),
    );
  }, [pendingAccess]);

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((previous) => {
      if (checked) {
        return previous.includes(id) ? previous : [...previous, id];
      }

      return previous.filter((selectedId) => selectedId !== id);
    });
  };

  const toggleVisibleSelection = (checked: boolean) => {
    setSelectedIds((previous) => {
      if (!checked) {
        return previous.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...previous, ...visibleIds]));
    });
  };

  const handleActivate = async (ids: string[]) => {
    await onActivate(ids);
    setSelectedIds((previous) => previous.filter((id) => !ids.includes(id)));
  };

  const columns: Column<PendingAccessRecord>[] = [
    {
      key: "select",
      title: (
        <Checkbox
          size="sm"
          aria-label="Zaznacz wszystkie widoczne dostępy"
          checked={allVisibleSelected}
          indeterminate={someVisibleSelected}
          disabled={visibleIds.length === 0 || activatingIds.length > 0}
          onChange={toggleVisibleSelection}
        />
      ),
      dataIndex: "id",
      width: 48,
      render: (_, record) => (
        <div onClick={(event) => event.stopPropagation()}>
          <Checkbox
            size="sm"
            aria-label={`Zaznacz dostęp ${record.studentName} do kursu ${record.courseTitle}`}
            checked={selectedIds.includes(record.id)}
            disabled={activatingIds.length > 0}
            onChange={(checked) => toggleSelection(record.id, checked)}
          />
        </div>
      ),
    },
    {
      key: "studentName",
      title: "Kursant",
      dataIndex: "studentName",
      sortable: true,
      render: (_, record) => (
        <div className="min-w-[180px]">
          <p className="font-medium text-[var(--coffee-charcoal)]">
            {record.studentName}
          </p>
          <a
            href={`mailto:${record.studentEmail}`}
            className="text-xs text-[var(--coffee-mocha)] hover:underline"
          >
            {record.studentEmail}
          </a>
          {record.instagramUsername ? (
            <p className="text-xs text-[var(--coffee-espresso)]">
              @{record.instagramUsername}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "courseTitle",
      title: "Kurs",
      dataIndex: "courseTitle",
      sortable: true,
      render: (_, record) => (
        <div className="min-w-[160px]">
          <p className="font-medium text-[var(--coffee-charcoal)]">
            {record.courseTitle}
          </p>
          <p className="text-xs text-[var(--coffee-espresso)]">
            Dostęp:{" "}
            {formatAccessDuration(
              record.accessDurationMonths ??
                DEFAULT_COURSE_ACCESS_DURATION_MONTHS,
            )}
          </p>
        </div>
      ),
    },
    {
      key: "purchaseDate",
      title: "Zakup",
      dataIndex: "purchaseDate",
      sortable: true,
      render: (_, record) => formatDateTime(record.purchaseDate),
    },
    {
      key: "daysWaiting",
      title: "Czeka",
      dataIndex: "daysWaiting",
      align: "right",
      sortable: true,
      render: (_, record) => (
        <span className="font-semibold text-[var(--coffee-mocha)]">
          {getWaitingLabel(record.daysWaiting)}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Akcja",
      dataIndex: "id",
      render: (_, record) => (
        <Button
          type="button"
          variant="primary"
          size="sm"
          loading={activatingSet.has(record.id)}
          disabled={activatingIds.length > 0 && !activatingSet.has(record.id)}
          onClick={(event) => {
            event.stopPropagation();
            void handleActivate([record.id]);
          }}
        >
          Aktywuj
        </Button>
      ),
    },
  ];

  const empty = (
    <div className="border border-[var(--coffee-cappuccino)] bg-white p-8 text-center text-[var(--coffee-espresso)]">
      <p className="font-medium">Brak dostępów oczekujących na aktywację.</p>
      <p className="mt-2 text-sm">
        Po zakupie kursu z ręczną aktywacją nowe osoby pojawią się tutaj.
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border border-[var(--coffee-cappuccino)] bg-white p-4 border-radius md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--coffee-espresso)]">
            Oczekujące dostępy
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--coffee-charcoal)]">
            {pendingAccess.length}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label
              htmlFor="pending-access-course-filter"
              className="mb-1 block text-sm font-medium text-[var(--coffee-charcoal)]"
            >
              Kurs
            </label>
            <select
              id="pending-access-course-filter"
              value={courseFilter}
              onChange={(event) => setCourseFilter(event.target.value)}
              className="h-10 min-w-56 border border-[var(--coffee-cappuccino)] bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[var(--coffee-macchiato)]"
            >
              <option value="all">Wszystkie kursy</option>
              {courseOptions.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => void onRefresh()}
            disabled={loading || activatingIds.length > 0}
          >
            <span className="inline-flex items-center gap-2">
              <FiRefreshCw className="h-4 w-4" aria-hidden />
              Odśwież
            </span>
          </Button>

          <Button
            type="button"
            variant="primary"
            disabled={selectedVisibleIds.length === 0}
            loading={activatingIds.length > 1}
            onClick={() => void handleActivate(selectedVisibleIds)}
          >
            Aktywuj zaznaczone ({selectedVisibleIds.length})
          </Button>
        </div>
      </div>

      <div className="overflow-hidden bg-white border-radius">
        <Table<PendingAccessRecord>
          data={filteredAccess}
          columns={columns}
          loading={loading}
          empty={empty}
          pagination={{
            current: currentPage,
            pageSize: PAGE_SIZE,
            total: filteredAccess.length,
            onChange: setCurrentPage,
          }}
        />
      </div>
    </div>
  );
}
