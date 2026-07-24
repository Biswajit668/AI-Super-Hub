import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Clock, Trash2, FileText, Sparkles } from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { HistoryItem } from '../types';

export const HistoryView: React.FC = () => {
  const { profile } = useAuth();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!profile) return;
      try {
        const q = query(collection(db, 'history'), where('uid', '==', profile.uid));
        const snap = await getDocs(q);
        const list: HistoryItem[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as HistoryItem));
        setHistoryItems(list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [profile]);

  const handleDeleteItem = async (id?: string) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'history', id));
      setHistoryItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20 dark:border-cyan-500/30 flex items-center justify-center">
            <HistoryIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold">Tool Usage History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">View and inspect your previously generated AI content & document outputs</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading usage history...</div>
      ) : historyItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs shadow-sm">
          No usage history found yet. Start generating with tools!
        </div>
      ) : (
        <div className="space-y-4">
          {historyItems.map((item) => (
            <div key={item.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-3 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{item.toolName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {item.input && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Input Query</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono line-clamp-2">{item.input}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Generated Output</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">{item.output}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
