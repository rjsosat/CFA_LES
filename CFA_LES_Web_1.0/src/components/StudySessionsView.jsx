import React, { useState, useEffect, useMemo } from 'react';
import { loadStudySessions, saveStudySessions } from '../utils/storage';
import CalendarView from './CalendarView';
import { Clock, Plus, Flame, Brain, BookOpen } from 'lucide-react';
import { isSameMonth, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function StudySessionsView({ curriculumData }) {
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [topics, setTopics] = useState('');
  const [feeling, setFeeling] = useState('Good'); // Great, Good, Struggle

  useEffect(() => {
    const loaded = loadStudySessions();
    if (loaded && loaded.length > 0) {
      // Sort newest first
      loaded.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSessions(loaded);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!hours && !minutes) return; // Need some duration

    const newSession = {
      id: Date.now().toString(),
      date,
      hours: hours || '0',
      minutes: minutes || '0',
      topics,
      feeling,
      timestamp: new Date().toISOString()
    };

    const updated = [newSession, ...sessions];
    updated.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setSessions(updated);
    saveStudySessions(updated);
    
    // Reset defaults except date
    setHours('');
    setMinutes('');
    setTopics('');
    setFeeling('Good');
    setShowForm(false);
  };

  const handleDelete = (id) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    saveStudySessions(updated);
  };

  // Tallies
  const { totalHours, monthHours } = useMemo(() => {
    let totMin = 0;
    let monMin = 0;
    const now = new Date();

    sessions.forEach(s => {
      const mins = (parseInt(s.hours, 10) * 60) + parseInt(s.minutes, 10);
      totMin += mins;
      
      // If the session date is same month and year as right now
      if (s.date && isSameMonth(parseISO(s.date), now)) {
        monMin += mins;
      }
    });

    return {
      totalHours: (totMin / 60).toFixed(1),
      monthHours: (monMin / 60).toFixed(1)
    };
  }, [sessions]);

  const feelingColors = {
    'Great': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Good': 'bg-blue-100 text-blue-700 border-blue-200',
    'Struggle': 'bg-orange-100 text-orange-700 border-orange-200'
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Tallies */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-5 shadow-lg shadow-blue-500/20 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Flame size={20} />
            <span className="font-semibold text-sm">This Month</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black">{monthHours}</span>
            <span className="text-sm font-medium opacity-80">hrs</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <Brain size={20} />
            <span className="font-semibold text-sm">Total Study Time</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-800">{totalHours}</span>
            <span className="text-sm font-medium text-slate-500">hrs</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="mb-8">
        <CalendarView sessions={sessions} />
      </div>

      {/* Log Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-extrabold text-slate-800">Session Log</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm",
            showForm 
              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30"
          )}
        >
          {showForm ? 'Cancel' : <><Plus size={18} /> Log Session</>}
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm mb-6 overflow-hidden"
            onSubmit={handleSave}
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    min="0"
                    placeholder="Hrs"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                  />
                  <input 
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Min"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Topics Covered</label>
              <input 
                type="text"
                placeholder="E.g. Multiple Regression, Time Series..."
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">How did it feel?</label>
              <div className="flex gap-2">
                {['Great', 'Good', 'Struggle'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFeeling(f)}
                    className={clsx(
                      "flex-1 py-2 font-semibold text-sm rounded-lg border transition",
                      feeling === f 
                        ? (f === 'Great' ? 'bg-emerald-500 text-white border-emerald-600' : 
                           f === 'Good' ? 'bg-blue-500 text-white border-blue-600' : 
                                          'bg-orange-500 text-white border-orange-600')
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={!hours && !minutes}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-sm shadow-blue-500/20"
            >
              Save Session
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* History List */}
      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-10 bg-slate-100 rounded-2xl border border-slate-200 border-dashed">
            <BookOpen className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-500 font-medium">No study sessions logged yet.</p>
          </div>
        ) : (
          sessions.map(s => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 transition">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{parseISO(s.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-medium">
                    {s.hours > 0 ? `${s.hours}h ` : ''}{s.minutes > 0 ? `${s.minutes}m` : (s.hours > 0 ? '' : '0m')}
                  </span>
                  <span className={clsx("text-xs font-bold px-2 py-0.5 rounded border ml-2", feelingColors[s.feeling])}>
                    {s.feeling}
                  </span>
                </div>
                {s.topics && (
                  <p className="text-sm text-slate-500 truncate max-w-sm">{s.topics}</p>
                )}
              </div>
              <button 
                onClick={() => handleDelete(s.id)}
                className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition self-start sm:self-center"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
