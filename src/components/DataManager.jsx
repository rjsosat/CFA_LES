import React, { useRef, useState } from 'react';
import { Download, Upload, AlertTriangle, Check } from 'lucide-react';
import { exportAllData, importAllData } from '../utils/storage';
import { motion, AnimatePresence } from 'framer-motion';

export default function DataManager({ onImportComplete }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', msg: string }
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cfa-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus({ type: 'success', msg: 'Backup downloaded!' });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.version) throw new Error('Invalid file');
        setPendingData(ev.target.result);
        setShowConfirm(true);
      } catch {
        setStatus({ type: 'error', msg: 'Invalid backup file.' });
        setTimeout(() => setStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    try {
      importAllData(pendingData);
      setShowConfirm(false);
      setPendingData(null);
      setStatus({ type: 'success', msg: 'Data restored! Reloading...' });
      setTimeout(() => {
        if (onImportComplete) onImportComplete();
        else window.location.reload();
      }, 1000);
    } catch {
      setStatus({ type: 'error', msg: 'Import failed.' });
      setShowConfirm(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
      <h3 className="font-bold text-slate-800 mb-1 text-sm">Backup & Restore</h3>
      <p className="text-xs text-slate-400 mb-4">Export your data or restore from a previous backup.</p>

      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <Download size={16} /> Export
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <Upload size={16} /> Import
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Status Message */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-3 flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {status.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
            {status.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Restore Backup?</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                This will replace all current data with the backup. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmImport}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition shadow-sm"
                >
                  Restore
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
