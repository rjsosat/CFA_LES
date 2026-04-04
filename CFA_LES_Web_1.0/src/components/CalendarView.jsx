import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function CalendarView({ sessions }) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = monthStart;
  const endDate = monthEnd;

  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  const startDayOfWeek = getDay(monthStart); // 0 (Sun) to 6 (Sat)
  
  // Create padding for days before the 1st of the month
  const paddingDays = Array.from({ length: startDayOfWeek }).fill(null);
  const calendarDays = [...paddingDays, ...daysInMonth];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Determine intensity of study per day
  const getDayIntensity = (day) => {
    if (!day) return 0;
    const daySessions = sessions.filter(s => isSameDay(new Date(s.date), day));
    if (daySessions.length === 0) return 0;
    
    // Total hours for this day
    const totalMinutes = daySessions.reduce((acc, curr) => acc + (parseInt(curr.hours) * 60) + parseInt(curr.minutes), 0);
    const hours = totalMinutes / 60;
    
    if (hours > 6) return 4;
    if (hours > 3) return 3;
    if (hours > 1.5) return 2;
    return 1;
  };

  const getIntensityColor = (level) => {
    switch (level) {
      case 4: return 'bg-blue-600 text-white';
      case 3: return 'bg-blue-500 text-white';
      case 2: return 'bg-blue-400 text-white';
      case 1: return 'bg-blue-200 text-slate-700';
      default: return 'bg-slate-100/50 text-slate-700 hover:bg-slate-200';
    }
  };

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-xs font-bold text-slate-400 uppercase tracking-widest">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="h-10 w-10 sm:h-12 sm:w-12 mx-auto"></div>;
          
          const intensity = getDayIntensity(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={day.toString()} 
              className={clsx(
                "h-10 w-10 sm:h-12 sm:w-12 mx-auto rounded-xl flex items-center justify-center text-sm font-semibold transition-all cursor-default relative group",
                getIntensityColor(intensity),
                isToday ? "ring-2 ring-blue-500 ring-offset-2" : ""
              )}
            >
              {format(day, 'd')}
              
              {/* Tooltip on hover if data exists */}
              {intensity > 0 && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-slate-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                  {sessions
                    .filter(s => isSameDay(new Date(s.date), day))
                    .reduce((acc, curr) => acc + (parseInt(curr.hours)*60 + parseInt(curr.minutes)), 0) / 60} hrs
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex items-center justify-end text-xs text-slate-500 gap-2">
        <span>Less</span>
        <div className="w-4 h-4 rounded-sm bg-slate-100"></div>
        <div className="w-4 h-4 rounded-sm bg-blue-200"></div>
        <div className="w-4 h-4 rounded-sm bg-blue-400"></div>
        <div className="w-4 h-4 rounded-sm bg-blue-600"></div>
        <span>More</span>
      </div>
    </div>
  );
}
