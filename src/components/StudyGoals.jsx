import React, { useState, useMemo } from 'react';
import { Target, Edit3, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { isSameDay, isSameWeek, parseISO } from 'date-fns';
import clsx from 'clsx';

export default function StudyGoals({ goals, onSaveGoals, sessions }) {
  const [isEditing, setIsEditing] = useState(false);
  const [dailyTarget, setDailyTarget] = useState(goals?.dailyHours ?? 3);
  const [weeklyTarget, setWeeklyTarget] = useState(goals?.weeklyHours ?? 20);

  const { todayHours, weekHours } = useMemo(() => {
    const now = new Date();
    let todayMin = 0;
    let weekMin = 0;

    sessions.forEach(s => {
      if (!s.date) return;
      const d = parseISO(s.date);
      const mins = (parseInt(s.hours, 10) || 0) * 60 + (parseInt(s.minutes, 10) || 0);
      if (isSameDay(d, now)) todayMin += mins;
      if (isSameWeek(d, now, { weekStartsOn: 1 })) weekMin += mins;
    });

    return {
      todayHours: todayMin / 60,
      weekHours: weekMin / 60,
    };
  }, [sessions]);

  const activeDaily = goals?.dailyHours ?? 3;
  const activeWeekly = goals?.weeklyHours ?? 20;

  const dailyPct = Math.min(todayHours / activeDaily, 1);
  const weeklyPct = Math.min(weekHours / activeWeekly, 1);

  const handleSave = () => {
    onSaveGoals({ dailyHours: dailyTarget, weeklyHours: weeklyTarget });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-blue-500" />
          <h3 className="font-bold text-slate-800">Study Goals</h3>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="text-xs font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition"
        >
          {isEditing ? <><Check size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
        </button>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Daily Goal</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(parseFloat(e.target.value) || 0.5)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
              />
              <span className="text-xs text-slate-400 whitespace-nowrap">hrs/day</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Weekly Goal</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
              />
              <span className="text-xs text-slate-400 whitespace-nowrap">hrs/wk</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Daily */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today</span>
              <span className="text-xs font-bold text-slate-700">
                {todayHours.toFixed(1)} / {activeDaily}h
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className={clsx(
                  "h-full rounded-full",
                  dailyPct >= 1 ? "bg-emerald-500" : "bg-blue-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${dailyPct * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {dailyPct >= 1 && (
              <p className="text-xs text-emerald-600 font-bold mt-1">Daily goal reached!</p>
            )}
          </div>

          {/* Weekly */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">This Week</span>
              <span className="text-xs font-bold text-slate-700">
                {weekHours.toFixed(1)} / {activeWeekly}h
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className={clsx(
                  "h-full rounded-full",
                  weeklyPct >= 1 ? "bg-emerald-500" : "bg-indigo-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${weeklyPct * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {weeklyPct >= 1 && (
              <p className="text-xs text-emerald-600 font-bold mt-1">Weekly goal reached!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
