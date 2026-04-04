import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from './ProgressBar';

function ModuleItem({ moduleData, completionState, onToggleSubsection }) {
  const [expanded, setExpanded] = useState(false);
  
  const completedCount = moduleData.subsections.filter(sub => completionState[sub.id]).length;
  const totalCount = moduleData.subsections.length;
  const remainingCount = totalCount - completedCount;
  const progress = totalCount === 0 ? 0 : completedCount / totalCount;

  return (
    <div className="mb-3 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <button 
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 text-left pr-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-slate-800">
              Module {moduleData.number}: {moduleData.title}
            </h4>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium mb-2">
            <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">{completedCount} Done</span>
            <span className="text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">{remainingCount} Remaining</span>
          </div>
          <ProgressBar progress={progress} />
        </div>
        <div className="text-slate-400">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 p-2"
          >
            {moduleData.subsections.map(sub => {
              const isDone = !!completionState[sub.id];
              return (
                <button
                  key={sub.id}
                  className="w-full flex items-center p-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                  onClick={() => onToggleSubsection(sub.id, !isDone)}
                >
                  {isDone ? (
                    <CheckCircle className="text-emerald-500 mr-3 flex-shrink-0" size={20} />
                  ) : (
                    <Circle className="text-slate-300 mr-3 flex-shrink-0" size={20} />
                  )}
                  <span className={`text-sm flex-1 ${isDone ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                    {sub.title}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionItem({ section, completionState, onToggleSubsection }) {
  const [expanded, setExpanded] = useState(false);

  let totalSubs = 0;
  let completedSubs = 0;
  section.modules.forEach(mod => {
    totalSubs += mod.subsections.length;
    completedSubs += mod.subsections.filter(sub => completionState[sub.id]).length;
  });
  const remainingSubs = totalSubs - completedSubs;
  const progress = totalSubs === 0 ? 0 : completedSubs / totalSubs;

  return (
    <div className="mb-4">
      <button 
        className="w-full bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 text-left pr-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Section {section.number}</p>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{section.title}</h3>
          <div className="flex items-center gap-3 text-xs font-medium mb-3">
            <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md shadow-sm">{completedSubs} / {totalSubs} Completed</span>
            {remainingSubs === 0 ? (
              <span className="text-emerald-700 font-bold ml-1">🎉 Mastered!</span>
            ) : (
              <span className="text-slate-500">{remainingSubs} left</span>
            )}
          </div>
          <ProgressBar progress={progress} />
        </div>
        <div className="bg-slate-100 p-2 rounded-full text-slate-500">
          {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            className="pt-3 pl-2 pr-1"
          >
            {section.modules.map(mod => (
              <ModuleItem 
                key={mod.id} 
                moduleData={mod} 
                completionState={completionState} 
                onToggleSubsection={onToggleSubsection} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SectionList({ sections, completionState, onToggleSubsection }) {
  if (!sections || sections.length === 0) return null;
  return (
    <div className="pb-24">
      {sections.map(section => (
        <SectionItem 
          key={section.id} 
          section={section} 
          completionState={completionState} 
          onToggleSubsection={onToggleSubsection} 
        />
      ))}
    </div>
  );
}
