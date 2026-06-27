import React from 'react';
import { Flame } from 'lucide-react';
import clsx from 'clsx';

export default function StreakCard({ stats }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center gap-4">
        <div className={clsx(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm",
          stats.currentStreak > 0
            ? "bg-gradient-to-br from-orange-400 to-red-500"
            : "bg-slate-100"
        )}>
          <Flame size={28} className={stats.currentStreak > 0 ? "text-white" : "text-slate-300"} />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.currentStreak}</span>
            <span className="text-sm font-semibold text-slate-500">day streak</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Best: {stats.bestStreak} {stats.bestStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>
    </div>
  );
}
