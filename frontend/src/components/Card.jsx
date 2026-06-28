import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ title, children, className = "" }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ shadow: "0 10px 30px -10px rgba(0,0,0,0.06)" }}
      className={`bg-white border border-slate-200/60 rounded-xl p-6 shadow-premium transition-shadow duration-300 ${className}`}
    >
      {title && (
        <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 pb-3 mb-5 font-outfit">
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  );
}
