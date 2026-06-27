import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function ProgressBar({ progress, label, isGlobal = false }) {
  const percent = Math.min(Math.max(progress * 100, 0), 100).toFixed(1);
  const percentNum = parseFloat(percent);

  // Gradient based on completion
  let colorClass = "from-red-400 to-orange-400";
  if (percentNum > 20) colorClass = "from-orange-400 to-yellow-400";
  if (percentNum > 50) colorClass = "from-yellow-400 to-green-400";
  if (percentNum > 80) colorClass = "from-green-400 to-emerald-500";
  if (percentNum === 100) colorClass = "from-emerald-400 to-teal-500";

  return (
    <div className={clsx("w-full mb-4", isGlobal ? "px-2" : "")}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className={clsx("font-semibold text-slate-700", isGlobal ? "text-lg" : "text-sm")}>{label}</span>
          <span className={clsx("font-bold", isGlobal ? "text-lg text-slate-900" : "text-sm text-slate-600")}>
            {percent}%
          </span>
        </div>
      )}
      <div className={clsx("w-full bg-slate-200 rounded-full overflow-hidden", isGlobal ? "h-4" : "h-2")}>
        <motion.div 
          className={`h-full bg-gradient-to-r ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
