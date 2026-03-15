import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { ChevronUpIcon, ChevronDownIcon } from '@/components/ui/Icon';

export interface Column<T = any> {
  key: string;
  title: React.ReactNode;
  dataIndex: keyof T;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface TableProps<T = any> extends React.HTMLAttributes<HTMLTableElement> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  empty?: React.ReactNode;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
  };
  onRowClick?: (record: T, index: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  striped?: boolean;
  bordered?: boolean;
}

type SortConfig = {
  column: string;
  direction: 'asc' | 'desc';
};

const Table = <T extends Record<string, any>>({
  data = [],
  columns = [],
  loading = false,
  empty,
  pagination,
  onRowClick,
  onSort,
  className,
  size = 'md',
  striped = false,
  bordered = false,
  ...props
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.column === column.key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const newSortConfig = { column: column.key, direction };
    setSortConfig(newSortConfig);
    onSort?.(column.key, direction);
  };

  const getSortedData = () => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.column];
      const bValue = b[sortConfig.column];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const sortedData = getSortedData();
  const sizeClasses = getSizeClasses();

  // Pagination
  const paginatedData = pagination
    ? sortedData.slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
      )
    : sortedData;

  const renderCell = (column: Column<T>, record: T, index: number) => {
    const value = record[column.dataIndex];
    
    if (column.render) {
      return column.render(value, record);
    }

    return <div className={cn('truncate', getAlignClass(column.align))}>{value}</div>;
  };

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return <>{column.title}</>;

    const isActive = sortConfig?.column === column.key;
    const direction = sortConfig?.direction === 'asc' ? 'up' : 'down';

    return (
      <button
        type="button"
        onClick={() => handleSort(column)}
        className="inline-flex items-center gap-1.5 hover:text-[var(--coffee-mocha)] transition-colors duration-200"
      >
        {column.title}
        <span className="inline-flex shrink-0 flex-col items-center justify-center leading-none" aria-hidden>
          <ChevronUpIcon
            size="xs"
            className={cn(
              'block -mb-0.5 transition-opacity duration-150',
              isActive && direction === 'up' ? 'opacity-100' : 'opacity-40'
            )}
          />
          <ChevronDownIcon
            size="xs"
            className={cn(
              'block -mt-0.5 transition-opacity duration-150',
              isActive && direction === 'down' ? 'opacity-100' : 'opacity-40'
            )}
          />
        </span>
      </button>
    );
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  if (loading) {
    return (
      <div className="w-full">
        <div className="min-h-[200px] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (paginatedData.length === 0 && empty) {
    return (
      <div className="w-full">
        {empty}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          'overflow-x-auto border border-radius table-border',
          striped && 'divide-y divide-[var(--table-border)]',
          bordered && 'border-2',
          className
        )}
      >
        <table
          {...props}
          className={cn(
            'w-full',
            sizeClasses,
            'border-collapse'
          )}
        >
          <thead className={cn(
            'bg-[var(--coffee-cream)]',
            striped && 'bg-[var(--coffee-cream)]'
          )}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left font-semibold text-[var(--coffee-charcoal)]',
                    getAlignClass(column.align),
                    column.width && 'whitespace-nowrap'
                  )}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((record, index) => (
              <tr
                key={index}
                className={cn(
                  'border-t table-border-t hover:bg-[var(--coffee-cream)] transition-colors duration-150',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(record, index)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3',
                      getAlignClass(column.align)
                    )}
                    style={{ width: column.width }}
                  >
                    {renderCell(column, record, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t table-border-t">
          <div className="text-sm text-[var(--coffee-macchiato)]">
            Pokazano {((pagination.current - 1) * pagination.pageSize) + 1}–
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} z {pagination.total}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => pagination.onChange(1)}
              disabled={pagination.current === 1}
              className="px-3 py-1 text-sm border border-[var(--coffee-cappuccino)] border-radius hover:bg-[var(--coffee-cream)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pierwsza
            </button>

            <button
              type="button"
              onClick={() => pagination.onChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="px-3 py-1 text-sm border border-[var(--coffee-cappuccino)] border-radius hover:bg-[var(--coffee-cream)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Poprzednia
            </button>

            <span className="text-sm text-[var(--coffee-charcoal)]">
              Strona {pagination.current} z {totalPages}
            </span>

            <button
              type="button"
              onClick={() => pagination.onChange(pagination.current + 1)}
              disabled={pagination.current === totalPages}
              className="px-3 py-1 text-sm border border-[var(--coffee-cappuccino)] border-radius hover:bg-[var(--coffee-cream)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Następna
            </button>

            <button
              type="button"
              onClick={() => pagination.onChange(totalPages)}
              disabled={pagination.current === totalPages}
              className="px-3 py-1 text-sm border border-[var(--coffee-cappuccino)] border-radius hover:bg-[var(--coffee-cream)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ostatnia
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

Table.displayName = 'Table';

export { Table };
