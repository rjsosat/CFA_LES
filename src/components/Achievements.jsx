import React from 'react';
import { Trophy, Star, BookCheck, Clock3, Zap, GraduationCap, Flame } from 'lucide-react';
import clsx from 'clsx';

const ACHIEVEMENTS = [
  { id: 'first_session', icon: Star, label: 'First Step', desc: 'Log your first session', check: (s) => s.totalSessions >= 1 },
  { id: 'sessions_10', icon: BookCheck, label: 'Dedicated', desc: '10 sessions logged', check: (s) => s.totalSessions >= 10 },
  { id: 'sessions_50', icon: BookCheck, label: 'Committed', desc: '50 sessions logged', check: (s) => s.totalSessions >= 50 },
  { id: 'hours_10', icon: Clock3, label: '10 Hour Club', desc: '10 total study hours', check: (s) => s.totalHours >= 10 },
  { id: 'hours_50', icon: Clock3, label: 'Half Century', desc: '50 total study hours', check: (s) => s.totalHours >= 50 },
  { id: 'hours_100', icon: Trophy, label: 'Centurion', desc: '100 total study hours', check: (s) => s.totalHours >= 100 },
  { id: 'hours_200', icon: Trophy, label: 'Marathon', desc: '200 total study hours', check: (s) => s.totalHours >= 200 },
  { id: 'streak_3', icon: Flame, label: 'On Fire', desc: '3-day study streak', check: (s) => s.bestStreak >= 3 },
  { id: 'streak_7', icon: Flame, label: 'Week Warrior', desc: '7-day study streak', check: (s) => s.bestStreak >= 7 },
  { id: 'streak_14', icon: Zap, label: 'Unstoppable', desc: '14-day study streak', check: (s) => s.bestStreak >= 14 },
  { id: 'streak_30', icon: Zap, label: 'Iron Will', desc: '30-day study streak', check: (s) => s.bestStreak >= 30 },
  { id: 'subs_50', icon: GraduationCap, label: 'Explorer', desc: '50 subsections completed', check: (s) => s.completedSubs >= 50 },
  { id: 'subs_100', icon: GraduationCap, label: 'Scholar', desc: '100 subsections completed', check: (s) => s.completedSubs >= 100 },
  { id: 'subs_200', icon: GraduationCap, label: 'Master', desc: '200 subsections completed', check: (s) => s.completedSubs >= 200 },
];

export default function Achievements({ stats }) {
  const unlockedCount = ACHIEVEMENTS.filter(a => a.check(stats)).length;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-extrabold text-slate-800">Achievements</h2>
        <span className="text-sm font-bold text-slate-400">
          {unlockedCount} / {ACHIEVEMENTS.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ACHIEVEMENTS.map(achievement => {
          const unlocked = achievement.check(stats);
          const Icon = achievement.icon;
          return (
            <div
              key={achievement.id}
              className={clsx(
                "flex items-center gap-2.5 p-2.5 rounded-xl border transition-all",
                unlocked
                  ? "bg-amber-50 border-amber-200"
                  : "bg-slate-50 border-slate-100 opacity-50"
              )}
            >
              <div className={clsx(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                unlocked ? "bg-amber-100" : "bg-slate-100"
              )}>
                <Icon size={16} className={unlocked ? "text-amber-600" : "text-slate-300"} />
              </div>
              <div className="min-w-0">
                <p className={clsx(
                  "text-xs font-bold truncate",
                  unlocked ? "text-slate-800" : "text-slate-400"
                )}>
                  {achievement.label}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{achievement.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
