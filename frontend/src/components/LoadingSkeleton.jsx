import React from 'react';

export default function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4 w-full animate-pulse p-4">
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-4">
            <div className="h-3 bg-slate-100 rounded col-span-2"></div>
            <div className="h-3 bg-slate-100 rounded col-span-1"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
