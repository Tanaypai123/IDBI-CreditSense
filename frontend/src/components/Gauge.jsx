import React from 'react';

export default function Gauge({ score, title }) {
  const r = 50;
  const circumference = 2 * Math.PI * r;
  const dashoffset = circumference * (100 - score) / 100;

  // Stripe-blue for good health, amber/orange for moderate, rose/red for warning
  let strokeColor = '#0061FF'; // Brand Blue
  if (score < 50) {
    strokeColor = '#EF4444'; // Red
  } else if (score < 70) {
    strokeColor = '#F59E0B'; // Amber
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200/60 rounded-xl shadow-premium h-full">
      {title && (
        <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4 font-outfit">
          {title}
        </h4>
      )}
      <div className="relative flex items-center justify-center w-40 h-40">
        <svg width="140" height="140" viewBox="0 0 120 120" className="transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="8"
          />
          {/* Foreground Metric Circle */}
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight text-slate-800 font-outfit">
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Health Score
          </span>
        </div>
      </div>
    </div>
  );
}
