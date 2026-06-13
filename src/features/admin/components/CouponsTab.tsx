"use client";

import { useState, useEffect } from "react";
import type { Coupon } from "@/types/coupon";
import { Table, Badge } from "@/components/ui";
import type { Column } from "@/components/ui/Table";
import {
  formatCouponValidityPeriod,
  getCouponDisplayStatus,
  type CouponDisplayStatus,
} from "@/lib/couponStatus";

type CouponsTabProps = {
  coupons: Coupon[];
  loading: boolean;
  onEditCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (couponId: string) => void;
};

const PAGE_SIZE = 10;

function formatCourseRule(
  courses: NonNullable<Coupon["applicableCourses"]>,
  emptyLabel: string,
) {
  if (courses.length === 0) return emptyLabel;
  if (courses.length === 1) return courses[0].title;
  return `${courses[0].title} +${courses.length - 1}`;
}

const STATUS_BADGE: Record<
  CouponDisplayStatus,
  {
    label: string;
    variant: "success" | "error" | "warning" | "outline" | "secondary";
  }
> = {
  active: { label: "Aktywny", variant: "success" },
  inactive: { label: "Nieaktywny", variant: "error" },
  expired: { label: "Wygasły", variant: "warning" },
  scheduled: { label: "Zaplanowany", variant: "outline" },
  exhausted: { label: "Wyczerpany", variant: "secondary" },
};

export function CouponsTab({
  coupons,
  loading,
  onEditCoupon,
  onDeleteCoupon,
}: CouponsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [coupons.length]);

  const columns: Column<Coupon>[] = [
    { key: "name", title: "Nazwa", dataIndex: "name", sortable: true },
    { key: "code", title: "Kod", dataIndex: "code", sortable: true },
    {
      key: "discountValue",
      title: "Wartość",
      dataIndex: "discountValue",
      align: "right",
      sortable: true,
      render: (_, record) =>
        record.discountType === "percentage"
          ? `${record.discountValue}%`
          : `${record.discountValue} PLN`,
    },
    {
      key: "validity",
      title: "Ważność",
      dataIndex: "startDate",
      sortable: true,
      render: (_, record) => (
        <span className="text-sm text-[var(--coffee-espresso)]">
          {formatCouponValidityPeriod(record.startDate, record.endDate)}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "isActive",
      sortable: true,
      render: (_, record) => {
        const status = getCouponDisplayStatus(record);
        const badge = STATUS_BADGE[status];
        return (
          <Badge variant={badge.variant} appearance="button">
            {badge.label}
          </Badge>
        );
      },
    },
    {
      key: "courseRules",
      title: "Kursy",
      dataIndex: "applicableCourses",
      render: (_, record) => (
        <div className="max-w-72 space-y-1 text-xs text-[var(--coffee-espresso)]">
          <div>
            <span className="font-medium text-[var(--coffee-charcoal)]">
              Rabat:
            </span>{" "}
            {formatCourseRule(record.applicableCourses ?? [], "wszystkie")}
          </div>
          <div>
            <span className="font-medium text-[var(--coffee-charcoal)]">
              Wymaga:
            </span>{" "}
            {formatCourseRule(record.requiredCourses ?? [], "brak")}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Akcje",
      dataIndex: "id",
      render: (_, record) => (
        <div className="flex gap-2">
          <button
            type="button"
            className="border border-[var(--coffee-mocha)] text-[var(--coffee-mocha)] px-3 py-2 hover:bg-[var(--coffee-cream)] border-radius"
            onClick={(e) => {
              e.stopPropagation();
              onEditCoupon(record);
            }}
          >
            Edytuj
          </button>
          <button
            type="button"
            className="border border-red-500 text-red-600 px-3 py-2 hover:bg-red-50 border-radius"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCoupon(record.id);
            }}
          >
            Usuń
          </button>
        </div>
      ),
    },
  ];

  const empty = (
    <div className="bg-white border border-[var(--coffee-cappuccino)] p-6 text-center text-[var(--coffee-espresso)]">
      Brak kuponów.
    </div>
  );

  return (
    <div className="overflow-hidden bg-white border-radius">
      <Table<Coupon>
        data={coupons}
        columns={columns}
        loading={loading}
        empty={empty}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          total: coupons.length,
          onChange: setCurrentPage,
        }}
      />
    </div>
  );
}
