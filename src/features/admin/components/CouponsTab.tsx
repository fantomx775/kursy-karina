"use client";

import { useState, useEffect } from "react";
import type { Coupon } from "@/types/coupon";
import { Table, Badge } from "@/components/ui";
import type { Column } from "@/components/ui/Table";

type CouponsTabProps = {
  coupons: Coupon[];
  loading: boolean;
  onEditCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (couponId: string) => void;
};

const PAGE_SIZE = 10;

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
      key: "isActive",
      title: "Status",
      dataIndex: "isActive",
      sortable: true,
      render: (_, record) =>
        record.isActive ? (
          <Badge variant="success" appearance="button">Aktywny</Badge>
        ) : (
          <Badge variant="error" appearance="button">Nieaktywny</Badge>
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
