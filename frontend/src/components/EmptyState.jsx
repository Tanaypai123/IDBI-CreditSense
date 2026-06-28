import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function EmptyState({ message = "No data available at this time.", icon: Icon = HelpCircle }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200/60 rounded-xl shadow-premium h-48 text-center text-slate-400 font-inter text-xs">
      <Icon className="w-8 h-8 text-slate-300 mb-3" />
      <span className="font-semibold text-slate-500 font-outfit">{message}</span>
    </div>
  );
}
