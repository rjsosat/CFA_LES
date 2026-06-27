import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BookOpen, Clock, Timer, Settings } from 'lucide-react';
import SectionList from './components/SectionList';
import ProgressBar from './components/ProgressBar';
import StudySessionsView from './components/StudySessionsView';
import PomodoroTimer from './components/PomodoroTimer';
import StudyGoals from './components/StudyGoals';
import StreakCard from './components/StreakCard';
import Achievements from './components/Achievements';
import DataManager from './components/DataManager';
import { parseCurriculumCSV } from './utils/csvParser';
import {
  loadExamDate, saveExamDate,
  loadCompletionState, saveCompletionState,
  loadStudySessions, saveStudySessions,
  loadStudyGoals, saveStudyGoals,
} from './utils/storage';
import { curriculumCsvString } from './data/curriculumData';
import { computeStudyStats } from './utils/stats';

export default function App() {
  const [examDateStr, setExamDateStr] = useState('');
  const [curriculumData, setCurriculumData] = useState([]);
  const [completionState, setCompletionState] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [studyGoals, setStudyGoals] = useState({ dailyHours: 3, weeklyHours: 20 });
  const [sessions, setSessions] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  // Collapsing header — hysteresis bands prevent oscillation when the
  // layout shifts as the (large) countdown card mounts/unmounts.
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    const COLLAPSE_AT = 120; // collapse once scrolled past this
    const EXPAND_AT = 50;    // only re-expand above this — wide dead zone

    const evaluate = () => {
      tickingRef.current = false;
      const y = window.scrollY;
      setHeaderCollapsed(prev => {
        if (!prev && y > COLLAPSE_AT) return true;
        if (prev && y < EXPAND_AT) return false;
        return prev; // inside the dead zone: keep current state
      });
    };

    const handleScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        window.requestAnimationFrame(evaluate);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        const savedDate = await loadExamDate();
        if (savedDate) setExamDateStr(savedDate);

        const savedCompletion = await loadCompletionState();
        if (savedCompletion) setCompletionState(savedCompletion);

        const savedGoals = loadStudyGoals();
        if (savedGoals) setStudyGoals(savedGoals);

        const loadedSessions = loadStudySessions();
        if (loadedSessions) setSessions(loadedSessions);

        if (curriculumCsvString) {
          const parsed = await parseCurriculumCSV(curriculumCsvString);
          setCurriculumData(parsed);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const handleToggleSubsection = (id, isCompleted) => {
    const newState = { ...completionState, [id]: isCompleted };
    setCompletionState(newState);
    saveCompletionState(newState);
  };

  const handleDateChange = (e) => setTempDate(e.target.value);

  const handleSaveDate = () => {
    if (tempDate) {
      setExamDateStr(tempDate);
      saveExamDate(tempDate);
    }
    setIsEditingDate(false);
  };

  const handleSaveGoals = (goals) => {
    setStudyGoals(goals);
    saveStudyGoals(goals);
  };

  const daysLeft = useMemo(() => {
    if (!examDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(examDateStr);
    targetDate.setHours(0, 0, 0, 0);
    if (isNaN(targetDate.getTime())) return null;
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [examDateStr]);

  const globalProgress = useMemo(() => {
    if (!curriculumData || curriculumData.length === 0) return 0;
    let totalCompleted = 0;
    let totalSubs = 0;
    curriculumData.forEach(section => {
      totalSubs += section.subCount || 0;
      section.modules.forEach(mod => {
        totalCompleted += mod.subsections.filter(sub => completionState[sub.id]).length;
      });
    });
    return totalSubs > 0 ? totalCompleted / totalSubs : 0;
  }, [curriculumData, completionState]);

  const studyStats = useMemo(
    () => computeStudyStats(sessions, completionState),
    [sessions, completionState]
  );

  const handlePomodoroComplete = ({ subsectionId, minutes }) => {
    handleToggleSubsection(subsectionId, true);

    const today = new Date().toISOString().split('T')[0];
    const section = curriculumData.find(s => s.modules.some(m => m.subsections.some(sub => sub.id === subsectionId)));
    const mod = section?.modules.find(m => m.subsections.some(sub => sub.id === subsectionId));
    const sub = mod?.subsections.find(s => s.id === subsectionId);

    const newSession = {
      id: Date.now().toString(),
      date: today,
      hours: String(Math.floor(minutes / 60)),
      minutes: String(minutes % 60),
      topics: mod && sub ? `${mod.title} - ${sub.title}` : 'Pomodoro Session',
      sectionId: section?.id || '',
      moduleId: mod?.id || '',
      subsectionId,
      feeling: 'Good',
      timestamp: new Date().toISOString(),
    };

    const updated = [newSession, ...sessions];
    updated.sort((a, b) => new Date(b.date) - new Date(a.date));
    setSessions(updated);
    saveStudySessions(updated);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-semibold text-lg">Loading Curriculum...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header — collapses on scroll down */}
      <div
        className={`bg-white px-6 rounded-b-3xl shadow-sm border-b border-slate-200 sticky top-0 z-10 transition-all duration-300 ${
          headerCollapsed ? 'py-3' : 'py-6'
        }`}
      >
        <div className="flex items-center justify-between">
          <h1
            className={`font-extrabold text-slate-800 tracking-tight transition-all duration-300 ${
              headerCollapsed ? 'text-lg mb-0' : 'text-3xl mb-0'
            }`}
          >
            Level II Tracker
          </h1>

          <div className="flex items-center gap-2">
            {/* Compact countdown when collapsed */}
            <AnimatePresence>
              {headerCollapsed && daysLeft !== null && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200"
                >
                  {Math.max(0, daysLeft)}d left
                </motion.span>
              )}
            </AnimatePresence>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Expanded countdown card */}
        <AnimatePresence initial={false}>
          {!headerCollapsed && currentTab === 'dashboard' && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 shadow-lg shadow-blue-500/30 flex items-center justify-between">
                <div className="flex items-center text-white">
                  <Calendar size={28} className="mr-3 opacity-80" />

              {isEditingDate ? (
                <div className="flex flex-col">
                  <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">Set Date</p>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="bg-white/20 border border-white/30 text-white rounded-lg px-3 py-1 text-sm outline-none focus:bg-white/30"
                      value={tempDate}
                      onChange={handleDateChange}
                    />
                    <button onClick={handleSaveDate} className="bg-white text-blue-600 px-3 py-1 rounded-lg font-bold text-sm">Save</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setTempDate(examDateStr); setIsEditingDate(true); }} className="text-left">
                  {daysLeft !== null ? (
                    <>
                      <h2 className="text-3xl font-black">{Math.max(0, daysLeft)} <span className="text-lg font-medium opacity-80">Days</span></h2>
                      <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mt-0.5">Until Exam Day</p>
                    </>
                  ) : (
                    <h2 className="text-lg font-bold bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm shadow-sm transition hover:bg-white/30">Set Exam Date</h2>
                  )}
                </button>
              )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <main className="max-w-2xl mx-auto px-4 mt-6">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <DataManager onImportComplete={() => window.location.reload()} />
          </div>
        )}

        {currentTab === 'dashboard' ? (
          <>
            {/* Study Goals */}
            <StudyGoals goals={studyGoals} onSaveGoals={handleSaveGoals} sessions={sessions} />

            {/* Global Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
              <ProgressBar progress={globalProgress} label="Curriculum Mastered" isGlobal={true} />
            </div>

            {/* Streak */}
            <StreakCard stats={studyStats} />

            {/* Achievements — its own section */}
            <Achievements stats={studyStats} />

            <h2 className="text-xl font-extrabold text-slate-800 mb-4 px-2">Study Modules</h2>
            <SectionList
              sections={curriculumData}
              completionState={completionState}
              onToggleSubsection={handleToggleSubsection}
            />
          </>
        ) : currentTab === 'pomodoro' ? (
          <PomodoroTimer
            curriculumData={curriculumData}
            onPomodoroComplete={handlePomodoroComplete}
          />
        ) : (
          <StudySessionsView
            curriculumData={curriculumData}
            onSessionLogged={(subsectionId) => handleToggleSubsection(subsectionId, true)}
          />
        )}
      </main>

      {/* Bottom Tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center py-4 px-6 transition-colors ${currentTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <BookOpen size={24} className={currentTab === 'dashboard' ? 'drop-shadow-[0_2px_8px_rgba(37,99,235,0.4)]' : ''} />
            <span className="text-xs font-bold mt-1 tracking-wider uppercase">Units</span>
          </button>

          <button
            onClick={() => setCurrentTab('pomodoro')}
            className={`flex flex-col items-center py-4 px-6 transition-colors ${currentTab === 'pomodoro' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Timer size={24} className={currentTab === 'pomodoro' ? 'drop-shadow-[0_2px_8px_rgba(37,99,235,0.4)]' : ''} />
            <span className="text-xs font-bold mt-1 tracking-wider uppercase">Focus</span>
          </button>

          <button
            onClick={() => setCurrentTab('sessions')}
            className={`flex flex-col items-center py-4 px-6 transition-colors ${currentTab === 'sessions' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Clock size={24} className={currentTab === 'sessions' ? 'drop-shadow-[0_2px_8px_rgba(37,99,235,0.4)]' : ''} />
            <span className="text-xs font-bold mt-1 tracking-wider uppercase">Log</span>
          </button>
        </div>
      </div>
    </div>
  );
}
