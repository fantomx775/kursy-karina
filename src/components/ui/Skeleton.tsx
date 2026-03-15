export function SkeletonLoader({ 
  className = "", 
  lines = 3,
  height = "h-4" 
}: { 
  className?: string; 
  lines?: number; 
  height?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 border-radius ${height} ${
            index === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-[var(--coffee-cappuccino)] p-4 border-radius"
        >
          <SkeletonLoader lines={2} height="h-5" />
          <div className="mt-3 flex justify-end">
            <div className="w-20 h-8 bg-gray-200 border-radius animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 3 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white border border-[var(--coffee-cappuccino)] border-radius overflow-hidden">
      <div className="p-4">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 items-center">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={`animate-pulse bg-gray-200 border-radius h-4 ${
                    colIndex === 0 ? "flex-1" : colIndex === 1 ? "w-32" : "w-20"
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
