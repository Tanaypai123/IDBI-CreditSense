import React from 'react';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200/50 mb-8 space-y-4 md:space-y-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-outfit tracking-tight leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs font-medium text-slate-500 mt-2 font-inter">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center space-x-3">
          {action}
        </div>
      )}
    </div>
  );
}
