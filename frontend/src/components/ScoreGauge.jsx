import React from 'react';
import { motion } from 'framer-motion';

export default function ScoreGauge({ score, title }) {
  const r = 50;
  const circumference = 2 * Math.PI * r;
  const dashoffset = circumference * (100 - score) / 100;

  let strokeColor = '#2563EB'; // Primary Blue
  if (score < 50) {
    strokeColor = '#DC2626'; // Danger Red
  } else if (score < 70) {
    strokeColor = '#F59E0B'; // Warning Amber
  }

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      whileHover={{ y: -4 }}
      className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200/80 rounded-xl shadow-premium hover:shadow-premium-hover transition-all duration-300 h-full"
    >
      {title && (
        <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-4 font-outfit">
          {title}
        </h4>
      )}
      <div className="relative flex items-center justify-center w-36 h-36">
        <svg width="130" height="130" viewBox="0 0 120 120" className="transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="8"
          />
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
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold tracking-tight text-slate-800 font-outfit leading-none"
          >
            {score.toFixed(1)}
          </motion.span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Health Score
          </span>
        </div>
      </div>
    </motion.div>
  );
}
