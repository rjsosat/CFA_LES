import { parseISO, differenceInCalendarDays, startOfDay } from 'date-fns';

export function computeStudyStats(sessions, completionState) {
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce(
    (acc, s) => acc + (parseInt(s.hours, 10) || 0) * 60 + (parseInt(s.minutes, 10) || 0),
    0
  );
  const totalHours = totalMinutes / 60;

  const completedSubs = Object.values(completionState || {}).filter(Boolean).length;

  const uniqueDays = [...new Set(sessions.map(s => s.date).filter(Boolean))];

  let currentStreak = 0;
  let bestStreak = 0;

  if (uniqueDays.length > 0) {
    const today = startOfDay(new Date());
    const sortedDesc = uniqueDays
      .map(d => startOfDay(parseISO(d)))
      .sort((a, b) => b - a);

    const mostRecent = sortedDesc[0];
    const daysSinceLast = differenceInCalendarDays(today, mostRecent);

    if (daysSinceLast <= 1) {
      currentStreak = 1;
      for (let i = 1; i < sortedDesc.length; i++) {
        const diff = differenceInCalendarDays(sortedDesc[i - 1], sortedDesc[i]);
        if (diff === 1) currentStreak++;
        else break;
      }
    }

    const sortedAsc = [...sortedDesc].reverse();
    let streak = 1;
    bestStreak = 1;
    for (let i = 1; i < sortedAsc.length; i++) {
      const diff = differenceInCalendarDays(sortedAsc[i], sortedAsc[i - 1]);
      if (diff === 1) {
        streak++;
        if (streak > bestStreak) bestStreak = streak;
      } else {
        streak = 1;
      }
    }
  }

  return { totalSessions, totalHours, completedSubs, currentStreak, bestStreak };
}
