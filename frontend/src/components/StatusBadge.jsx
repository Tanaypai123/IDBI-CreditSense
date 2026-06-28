import React from 'react';
import { motion } from 'framer-motion';

export default function StatusBadge({ status }) {
  const normStatus = (status || "").toLowerCase().trim();

  let styles = "bg-slate-50 text-slate-600 border-slate-200/50";
  let pulseColor = "bg-slate-400";
  
  if (normStatus === 'excellent' || normStatus === 'approved') {
    styles = "bg-emerald-50/80 text-emerald-700 border-emerald-100";
    pulseColor = "bg-emerald-500";
  } else if (normStatus === 'low risk') {
    styles = "bg-blue-50/80 text-blue-700 border-blue-100";
    pulseColor = "bg-blue-500";
  } else if (normStatus === 'medium risk') {
    styles = "bg-amber-50/80 text-amber-700 border-amber-100";
    pulseColor = "bg-amber-500";
  } else if (normStatus === 'high risk') {
    styles = "bg-orange-50/80 text-orange-700 border-orange-100";
    pulseColor = "bg-orange-500";
  } else if (normStatus === 'critical risk' || normStatus === 'locked' || normStatus === 'rejected') {
    styles = "bg-rose-50/80 text-rose-700 border-rose-100";
    pulseColor = "bg-rose-500";
  }

  return (
    <motion.span 
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-outfit uppercase tracking-wide border ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${pulseColor} animate-pulse`} />
      <span>{status}</span>
    </motion.span>
  );
}
