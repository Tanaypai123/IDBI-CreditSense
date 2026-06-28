import React from 'react';
import { motion } from 'framer-motion';

export default function TableComponent({ headers, data, renderRow }) {
  return (
    <div className="overflow-x-auto w-full">
      <motion.table 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full text-left border-collapse font-inter text-xs text-slate-600"
      >
        <thead>
          <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {headers.map((h, idx) => (
              <th key={idx} className="pb-3 pl-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, idx) => renderRow(row, idx))}
        </tbody>
      </motion.table>
    </div>
  );
}
