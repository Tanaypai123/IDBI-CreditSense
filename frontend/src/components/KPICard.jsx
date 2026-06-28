import React from 'react';
import { motion } from 'framer-motion';

export default function KPICard({ label, value, subtext, icon: Icon, color = "text-blue-600 bg-blue-50/50" }) {
  return (
    <motion.div 
      whileHover={{ y: -4, shadow: "0 10px 25px -10px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-premium transition-shadow duration-300 flex items-center justify-between cursor-pointer"
    >
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none font-outfit block">
          {label}
        </span>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-outfit leading-none">
          {value}
        </h2>
        {subtext && (
          <span className="text-[11px] text-slate-500 font-medium font-inter block">
            {subtext}
          </span>
        )}
      </div>
      {Icon && (
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className={`p-3 rounded-xl transition-all duration-300 ${color}`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
      )}
    </motion.div>
  );
}
