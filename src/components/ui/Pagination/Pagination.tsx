import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icon/index';

export interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  className?: string;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({
    current,
    total,
    pageSize,
    onChange,
    className,
    showSizeChanger = false,
    showQuickJumper = false,
    ...props
  }, ref) => {
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);

    const handlePrev = () => {
      if (current > 1) {
        onChange(current - 1);
      }
    };

    const handleNext = () => {
      if (current < totalPages) {
        onChange(current + 1);
      }
    };

    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        onChange(page);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between gap-4',
          className
        )}
        {...props}
      >
        <div className="text-sm text-gray-600">
          Showing {startItem}-{endItem} of {total} items
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={current === 1}
            className={cn(
              'p-2 border-radius border border-gray-300 bg-white hover:bg-gray-50',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <ChevronLeftIcon><span className="w-4 h-4" /></ChevronLeftIcon>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={cn(
                  'px-3 py-1 text-sm border-radius border',
                  current === page
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                )}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={current === totalPages}
            className={cn(
              'p-2 border-radius border border-gray-300 bg-white hover:bg-gray-50',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <ChevronRightIcon><span className="w-4 h-4" /></ChevronRightIcon>
          </button>
        </div>

        {showQuickJumper && (
          <div className="flex items-center gap-2 text-sm">
            <span>Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={current}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (!isNaN(page)) {
                  handlePageChange(page);
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 border-radius"
            />
          </div>
        )}
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';

export { Pagination };
