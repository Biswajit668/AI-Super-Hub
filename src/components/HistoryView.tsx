import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Clock, Trash2, Copy, Check, Download, FileText, FileSpreadsheet, FileCode } from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { HistoryItem } from '../types';
import { exportHistoryToPdf, exportHistoryToCsv, exportHistoryToJson } from '../lib/exportUtils';

export const HistoryView: React.FC = () => {
  const { profile, clearAllHistory } = useAuth();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    let localList: HistoryItem[] = [];
    const userId = profile?.uid || 'guest';
    try {
      const storageKey = `user_history_${userId}`;
      const allLocal = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem('user_history') || '[]');
      localList = allLocal.filter((item: HistoryItem) => !item.uid || item.uid === userId);
    } catch {
      localList = [];
    }

    let remoteList: HistoryItem[] = [];
    if (profile?.uid) {
      try {
        const q = query(collection(db, 'history'), where('uid', '==', profile.uid));
        const snap = await getDocs(q);
        remoteList = snap.docs.map(d => ({ id: d.id, ...d.data() } as HistoryItem));
      } catch (err) {
        console.error('Failed to fetch Firestore history:', err);
      }
    }

    const combinedMap = new Map<string, HistoryItem>();
    [...remoteList, ...localList].forEach(item => {
      if (!item.uid || item.uid === userId) {
        const key = item.id || `${item.toolId}-${item.timestamp}-${item.output.slice(0, 20)}`;
        if (!combinedMap.has(key)) {
          combinedMap.set(key, item);
        }
      }
    });

    const sorted = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setHistoryItems(sorted);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [profile]);

  const handleDeleteItem = async (id?: string) => {
    if (!id) return;
    const userId = profile?.uid || 'guest';
    const storageKey = `user_history_${userId}`;
    
    setHistoryItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    try {
      await deleteDoc(doc(db, 'history', id));
    } catch (err) {
      // ignore
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear your entire usage history?')) {
      await clearAllHistory();
      setHistoryItems([]);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20 dark:border-cyan-500/30 flex items-center justify-center shrink-0">
              <HistoryIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <span>Tool Usage History</span>
                {historyItems.length > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800">
                    {historyItems.length} Saved
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">View and inspect your previously generated AI content & document outputs</p>
            </div>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/80 font-bold text-xs flex items-center gap-1.5 transition shadow-sm w-fit"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* One-Click Export Toolbar */}
        {historyItems.length > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>1-Click Export History:</span>
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => exportHistoryToPdf(historyItems, profile?.displayName || profile?.email || 'User')}
                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Report</span>
              </button>

              <button
                onClick={() => exportHistoryToCsv(historyItems)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV Sheet</span>
              </button>

              <button
                onClick={() => exportHistoryToJson(historyItems)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>JSON Data</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading usage history...</div>
      ) : historyItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs shadow-sm space-y-2">
          <HistoryIcon className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
          <p className="font-bold text-slate-700 dark:text-slate-300">No usage history found yet</p>
          <p className="text-slate-400 text-[11px]">Any output you generate using AI, PDF, Image, or Utility tools will appear here automatically!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyItems.map((item) => (
            <div key={item.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-3 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
                  {item.toolName}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <button 
                    onClick={() => handleCopy(item.output, item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    title="Copy Output"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {item.input && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Input Query / Command</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono line-clamp-2">{item.input}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Generated Output</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">{item.output}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
