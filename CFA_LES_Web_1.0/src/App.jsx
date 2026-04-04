import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, BookOpen, Clock } from 'lucide-react';
import SectionList from './components/SectionList';
import ProgressBar from './components/ProgressBar';
import StudySessionsView from './components/StudySessionsView';
import { parseCurriculumCSV } from './utils/csvParser';
import { loadExamDate, saveExamDate, loadCompletionState, saveCompletionState } from './utils/storage';
import { curriculumCsvString } from './data/curriculumData';

export default function App() {
  const [examDateStr, setExamDateStr] = useState('');
  const [curriculumData, setCurriculumData] = useState([]);
  const [completionState, setCompletionState] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard', 'sessions'

  useEffect(() => {
    const initApp = async () => {
      try {
        const savedDate = await loadExamDate();
        if (savedDate) setExamDateStr(savedDate);
        
        const savedCompletion = await loadCompletionState();
        if (savedCompletion) setCompletionState(savedCompletion);

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

  const handleDateChange = (e) => {
    const val = e.target.value;
    setTempDate(val);
  };

  const handleSaveDate = () => {
    if (tempDate) {
      setExamDateStr(tempDate);
      saveExamDate(tempDate);
    }
    setIsEditingDate(false);
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

    if (totalSubs > 0) {
      return totalCompleted / totalSubs;
    }
    return 0;
  }, [curriculumData, completionState]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-semibold text-lg hover:animate-pulse">Loading Curriculum...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-8 rounded-b-3xl shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-6">Level II Tracker</h1>
        
        {/* Countdown Card */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-blue-500/30 flex items-center justify-between">
          <div className="flex items-center text-white">
            <Calendar size={32} className="mr-4 opacity-80" />
            
            {isEditingDate ? (
              <div className="flex flex-col">
                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-1">Set Date</p>
                <div className="flex gap-2">
                  <input 
                    type="date"
                    className="bg-white/20 border border-white/30 text-white rounded-lg px-3 py-1 outline-none focus:bg-white/30"
                    placeholder="YYYY-MM-DD"
                    value={tempDate}
                    onChange={handleDateChange}
                  />
                  <button onClick={handleSaveDate} className="bg-white text-blue-600 px-3 py-1 rounded-lg font-bold">Save</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setTempDate(examDateStr); setIsEditingDate(true); }} className="text-left">
                {daysLeft !== null ? (
                  <>
                    <h2 className="text-4xl font-black">{Math.max(0, daysLeft)} <span className="text-xl font-medium opacity-80">Days</span></h2>
                    <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider mt-1">Until Exam Day</p>
                  </>
                ) : (
                  <h2 className="text-xl font-bold bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm shadow-sm transition hover:bg-white/30">Set Exam Date</h2>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 mt-6">
        {currentTab === 'dashboard' ? (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
              <ProgressBar progress={globalProgress} label="Curriculum Mastered" isGlobal={true} />
            </div>
            
            <h2 className="text-xl font-extrabold text-slate-800 mb-4 px-2">Study Modules</h2>
            <SectionList 
              sections={curriculumData} 
              completionState={completionState} 
              onToggleSubsection={handleToggleSubsection} 
            />
          </>
        ) : (
          <StudySessionsView curriculumData={curriculumData} />
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
