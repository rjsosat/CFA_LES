import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Coffee, BookOpen, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const DEFAULT_SETTINGS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
};

const PHASES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
};

const PHASE_LABELS = {
  [PHASES.WORK]: 'Focus',
  [PHASES.SHORT_BREAK]: 'Short Break',
  [PHASES.LONG_BREAK]: 'Long Break',
};

const PHASE_COLORS = {
  [PHASES.WORK]: {
    bg: 'from-blue-500 to-indigo-600',
    ring: 'stroke-white',
    track: 'stroke-white/20',
    text: 'text-white',
    btnBg: 'bg-white/20 hover:bg-white/30',
    btnActive: 'bg-white text-blue-600',
  },
  [PHASES.SHORT_BREAK]: {
    bg: 'from-emerald-400 to-teal-500',
    ring: 'stroke-white',
    track: 'stroke-white/20',
    text: 'text-white',
    btnBg: 'bg-white/20 hover:bg-white/30',
    btnActive: 'bg-white text-emerald-600',
  },
  [PHASES.LONG_BREAK]: {
    bg: 'from-violet-500 to-purple-600',
    ring: 'stroke-white',
    track: 'stroke-white/20',
    text: 'text-white',
    btnBg: 'bg-white/20 hover:bg-white/30',
    btnActive: 'bg-white text-violet-600',
  },
};

export default function PomodoroTimer({ curriculumData, onPomodoroComplete }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(DEFAULT_SETTINGS);

  const [phase, setPhase] = useState(PHASES.WORK);
  const [secondsLeft, setSecondsLeft] = useState(settings.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedSubsectionId, setSelectedSubsectionId] = useState('');

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const activeSection = curriculumData?.find(s => s.id === selectedSectionId);
  const activeModule = activeSection?.modules?.find(m => m.id === selectedModuleId);

  const totalSeconds = useMemo(() => settings[phase] * 60, [settings, phase]);
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  const displayMinutes = Math.floor(secondsLeft / 60);
  const displaySeconds = secondsLeft % 60;

  const playAlarm = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      playTone(880, ctx.currentTime, 0.15);
      playTone(880, ctx.currentTime + 0.2, 0.15);
      playTone(1100, ctx.currentTime + 0.4, 0.3);
    } catch (_) {}
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const advancePhase = useCallback(() => {
    stopTimer();
    playAlarm();

    if (phase === PHASES.WORK) {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);

      if (onPomodoroComplete && selectedSubsectionId) {
        onPomodoroComplete({
          subsectionId: selectedSubsectionId,
          minutes: settings.work,
        });
      }

      if (newCount % settings.longBreakInterval === 0) {
        setPhase(PHASES.LONG_BREAK);
        setSecondsLeft(settings.longBreak * 60);
      } else {
        setPhase(PHASES.SHORT_BREAK);
        setSecondsLeft(settings.shortBreak * 60);
      }
    } else {
      setPhase(PHASES.WORK);
      setSecondsLeft(settings.work * 60);
    }
  }, [phase, completedPomodoros, settings, stopTimer, playAlarm, onPomodoroComplete, selectedSubsectionId]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            advancePhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, advancePhase]);

  const toggleTimer = () => setIsRunning(prev => !prev);

  const resetTimer = () => {
    stopTimer();
    setSecondsLeft(settings[phase] * 60);
  };

  const skipPhase = () => advancePhase();

  const switchPhase = (newPhase) => {
    stopTimer();
    setPhase(newPhase);
    setSecondsLeft(settings[newPhase] * 60);
  };

  const saveSettings = () => {
    setSettings(tempSettings);
    setShowSettings(false);
    if (!isRunning) {
      setSecondsLeft(tempSettings[phase] * 60);
    }
  };

  const colors = PHASE_COLORS[phase];

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  const dots = Array.from({ length: settings.longBreakInterval });

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Phase Selector Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm">
        {Object.values(PHASES).map(p => (
          <button
            key={p}
            onClick={() => switchPhase(p)}
            className={clsx(
              "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all",
              phase === p
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Timer Card */}
      <div className={clsx("bg-gradient-to-br rounded-3xl p-8 shadow-lg relative overflow-hidden", colors.bg)}>
        {/* Settings button */}
        <button
          onClick={() => { setTempSettings(settings); setShowSettings(true); }}
          className={clsx("absolute top-4 right-4 p-2.5 rounded-xl transition", colors.btnBg)}
        >
          <Settings2 size={20} className="text-white/80" />
        </button>

        {/* Phase icon + label */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {phase === PHASES.WORK ? (
            <BookOpen size={20} className="text-white/80" />
          ) : (
            <Coffee size={20} className="text-white/80" />
          )}
          <span className="text-white/80 font-bold text-sm uppercase tracking-widest">
            {PHASE_LABELS[phase]}
          </span>
        </div>

        {/* Circular Progress */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
            <circle
              cx="130" cy="130" r="120"
              fill="none"
              className={colors.track}
              strokeWidth="6"
            />
            <circle
              cx="130" cy="130" r="120"
              fill="none"
              className={colors.ring}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black text-white tabular-nums tracking-tight">
              {String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
            </span>
            <span className="text-white/60 text-sm font-semibold mt-1">
              {isRunning ? 'In progress...' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={resetTimer}
            className={clsx("p-3 rounded-xl transition", colors.btnBg)}
          >
            <RotateCcw size={22} className="text-white" />
          </button>

          <button
            onClick={toggleTimer}
            className={clsx(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg",
              colors.btnActive
            )}
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>

          <button
            onClick={skipPhase}
            className={clsx("p-3 rounded-xl transition", colors.btnBg)}
          >
            <SkipForward size={22} className="text-white" />
          </button>
        </div>

        {/* Pomodoro dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {dots.map((_, i) => (
            <div
              key={i}
              className={clsx(
                "w-3 h-3 rounded-full transition-all",
                i < (completedPomodoros % settings.longBreakInterval)
                  ? "bg-white scale-110"
                  : "bg-white/30"
              )}
            />
          ))}
          {completedPomodoros > 0 && (
            <span className="text-white/60 text-xs font-bold ml-2">
              {completedPomodoros} done
            </span>
          )}
        </div>
      </div>

      {/* Topic Selector */}
      <div className="mt-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          What are you studying?
        </h3>
        <div className="space-y-3">
          <select
            value={selectedSectionId}
            onChange={(e) => {
              setSelectedSectionId(e.target.value);
              setSelectedModuleId('');
              setSelectedSubsectionId('');
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          >
            <option value="">Select Section...</option>
            {curriculumData?.map(sec => (
              <option key={sec.id} value={sec.id}>Section {sec.number}: {sec.title}</option>
            ))}
          </select>

          <select
            disabled={!selectedSectionId}
            value={selectedModuleId}
            onChange={(e) => {
              setSelectedModuleId(e.target.value);
              setSelectedSubsectionId('');
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 disabled:opacity-50 transition"
          >
            <option value="">Select Module...</option>
            {activeSection?.modules?.map(mod => (
              <option key={mod.id} value={mod.id}>Module {mod.number}: {mod.title}</option>
            ))}
          </select>

          <select
            disabled={!selectedModuleId}
            value={selectedSubsectionId}
            onChange={(e) => setSelectedSubsectionId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 disabled:opacity-50 transition"
          >
            <option value="">Select Subsection...</option>
            {activeModule?.subsections?.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.title}</option>
            ))}
          </select>
        </div>
        {selectedSubsectionId && (
          <p className="mt-3 text-xs text-emerald-600 font-semibold">
            Completed pomodoros will be logged to this topic.
          </p>
        )}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-800 mb-5">Timer Settings</h3>

              {[
                { key: 'work', label: 'Focus Duration', unit: 'min' },
                { key: 'shortBreak', label: 'Short Break', unit: 'min' },
                { key: 'longBreak', label: 'Long Break', unit: 'min' },
                { key: 'longBreakInterval', label: 'Long Break After', unit: 'pomodoros' },
              ].map(({ key, label, unit }) => (
                <div key={key} className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold text-slate-700">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={key === 'longBreakInterval' ? 10 : 120}
                      value={tempSettings[key]}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        [key]: Math.max(1, parseInt(e.target.value) || 1),
                      }))}
                      className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                    />
                    <span className="text-xs text-slate-400 w-16">{unit}</span>
                  </div>
                </div>
              ))}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSettings}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition shadow-sm"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
