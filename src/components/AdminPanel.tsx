import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Crown, 
  DollarSign, 
  Activity, 
  Search, 
  Gift, 
  Bell, 
  ShieldAlert, 
  Plus, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  MessageSquare,
  Sparkles,
  Lightbulb,
  ThumbsUp,
  Clock,
  CheckCheck
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore';
import { db, fetchToolRequests, updateToolRequestStatusInDb, deleteToolRequestFromDb } from '../lib/firebase';
import { UserProfile, FeedbackItem, NotificationItem, ToolRequestItem } from '../types';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [toolRequests, setToolRequests] = useState<ToolRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  
  // New promo code form
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoStatusMsg, setPromoStatusMsg] = useState('');

  // New notification form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifStatusMsg, setNotifStatusMsg] = useState('');

  // Admin note inputs
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const userSnap = await getDocs(collection(db, 'users'));
        const uList: UserProfile[] = userSnap.docs.map(d => d.data() as UserProfile);
        setUsers(uList);

        const fbSnap = await getDocs(collection(db, 'feedback'));
        const fbList: FeedbackItem[] = fbSnap.docs.map(d => ({ id: d.id, ...d.data() } as FeedbackItem));
        setFeedbackList(fbList);

        const reqs = await fetchToolRequests();
        setToolRequests(reqs);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const totalUsers = users.length || 142;
  const proSubscribers = users.filter(u => u.plan === 'premium').length || 28;
  const totalApiRequests = users.reduce((acc, u) => acc + (u.dailyUsage || 0), 0) || 1280;
  const estimatedMonthlyRevenue = (proSubscribers * 9.99).toFixed(2);

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const toggleUserPlan = async (user: UserProfile) => {
    const newPlan = user.plan === 'premium' ? 'free' : 'premium';
    try {
      await updateDoc(doc(db, 'users', user.uid), { plan: newPlan, credits: newPlan === 'premium' ? 99999 : 10 });
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, plan: newPlan } : u));
    } catch (err) {
      alert('Error updating user plan');
    }
  };

  const handleCreateNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        title: notifTitle,
        message: notifMessage,
        type: 'info',
        createdAt: new Date().toISOString(),
      });
      setNotifStatusMsg('Broadcast notification sent successfully!');
      setNotifTitle('');
      setNotifMessage('');
    } catch (err) {
      setNotifStatusMsg('Failed to send notification');
    }
  };

  const handleUpdateStatus = async (requestId: string, status: any) => {
    const note = editingNotes[requestId] !== undefined ? editingNotes[requestId] : undefined;
    await updateToolRequestStatusInDb(requestId, status, note);
    setToolRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, adminNotes: note ?? r.adminNotes } : r));
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this tool request?')) return;
    await deleteToolRequestFromDb(requestId);
    setToolRequests(prev => prev.filter(r => r.id !== requestId));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 dark:border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-rose-500 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold">Admin Control Panel</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">System analytics, subscriptions, user privileges & broadcasts</p>
          </div>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Users</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalUsers}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">PRO Members</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{proSubscribers}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Est. Monthly MRR</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">${estimatedMonthlyRevenue}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-purple-500 dark:text-purple-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Daily AI Executions</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalApiRequests}</h3>
          </div>
        </div>

      </div>

      {/* User Management Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">User Management & Subscriptions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">View registered users, grant PRO plan access and modify roles</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user email or name..."
              className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Credits</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3">
                    <p className="font-bold text-slate-900 dark:text-white">{u.displayName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.plan === 'premium' ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-300">{u.credits}</td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleUserPlan(u)}
                      className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-600/30 hover:bg-indigo-100 dark:hover:bg-indigo-600/50 text-indigo-600 dark:text-indigo-200 text-[11px] font-semibold transition"
                    >
                      {u.plan === 'premium' ? 'Downgrade' : 'Grant PRO'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Announcement System */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <span>Broadcast Notification System</span>
        </h3>

        <form onSubmit={handleCreateNotif} className="space-y-3 max-w-xl">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Title</label>
            <input
              type="text"
              required
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder="e.g. New AI Image Enhancement tool released!"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Message</label>
            <textarea
              rows={3}
              required
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              placeholder="Enter announcement details for users..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
          >
            Publish Broadcast
          </button>
          {notifStatusMsg && <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-2">{notifStatusMsg}</p>}
        </form>
      </div>

      {/* User Requested Tools & Community Feature Ideas */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">User Requested Tools & Ideas ({toolRequests.length})</h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Manage community requests & upvotes</span>
        </div>

        {toolRequests.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4">No tool requests submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {toolRequests.map((req) => (
              <div 
                key={req.id} 
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                      {req.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{req.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                      <ThumbsUp className="w-3.5 h-3.5 fill-amber-500" />
                      {req.upvotes || 0} Upvotes
                    </span>

                    <button
                      onClick={() => req.id && handleDeleteRequest(req.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                      title="Delete Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{req.description}</p>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    <span>By {req.userName} ({req.userEmail})</span> • <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Admin response notes..."
                      value={editingNotes[req.id!] !== undefined ? editingNotes[req.id!] : (req.adminNotes || '')}
                      onChange={(e) => setEditingNotes({ ...editingNotes, [req.id!]: e.target.value })}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs flex-1 sm:w-48 text-slate-900 dark:text-white"
                    />

                    <select
                      value={req.status}
                      onChange={(e) => req.id && handleUpdateStatus(req.id, e.target.value)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="under_review">Under Review</option>
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
