import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  Zap, 
  Crown, 
  Calendar, 
  Clock, 
  Sparkles, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Flame, 
  Bot, 
  Wrench, 
  TrendingUp, 
  CheckCircle2, 
  Activity, 
  RefreshCw,
  User,
  ShieldCheck,
  Gift,
  Users,
  Copy,
  UserCheck,
  Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HistoryItem } from '../types';
import { TOOLS_LIST } from '../lib/toolsData';
import { exportHistoryToPdf, exportHistoryToJson, exportHistoryToCsv } from '../lib/exportUtils';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UserAnalyticsViewProps {
  onOpenUpgrade?: () => void;
}

export const UserAnalyticsView: React.FC<UserAnalyticsViewProps> = ({ onOpenUpgrade }) => {
  const { profile, favorites } = useAuth();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const userRefCode = profile?.referralCode || profile?.uid?.slice(0, 8).toUpperCase() || 'SUPERHUB';
  const referralLink = `${window.location.origin}?ref=${userRefCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userRefCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Fetch complete usage history for analysis
  useEffect(() => {
    const loadHistory = async () => {
      setLoadingHistory(true);
      const userId = profile?.uid || 'guest';
      let localList: HistoryItem[] = [];
      try {
        const storageKey = `user_history_${userId}`;
        localList = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem('user_history') || '[]');
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
          console.error('Error loading history for analytics:', err);
        }
      }

      const map = new Map<string, HistoryItem>();
      [...remoteList, ...localList].forEach(item => {
        const key = item.id || `${item.toolId}-${item.timestamp}`;
        if (!map.has(key)) map.set(key, item);
      });

      const sorted = Array.from(map.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setHistoryItems(sorted);
      setLoadingHistory(false);
    };

    loadHistory();
  }, [profile]);

  // 1. Calculate Most Frequently Used Tools
  const toolUsageCounts: { [toolId: string]: { count: number; toolName: string; category: string } } = {};
  historyItems.forEach(item => {
    if (item.toolId) {
      if (!toolUsageCounts[item.toolId]) {
        const toolObj = TOOLS_LIST.find(t => t.id === item.toolId);
        toolUsageCounts[item.toolId] = {
          count: 0,
          toolName: item.toolName || toolObj?.name || item.toolId,
          category: toolObj?.category || 'utility'
        };
      }
      toolUsageCounts[item.toolId].count += 1;
    }
  });

  const sortedTopTools = Object.entries(toolUsageCounts)
    .map(([toolId, data]) => ({ toolId, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const maxToolUsage = sortedTopTools.length > 0 ? sortedTopTools[0].count : 1;

  // 2. Calculate Daily Prompts vs Utility Tools Breakdown (Last 7 Days)
  const last7Days: { dateStr: string; label: string; prompts: number; utilities: number }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { weekday: 'short' });

    // Filter items on this date
    const dayItems = historyItems.filter(item => {
      if (!item.timestamp) return false;
      return new Date(item.timestamp).toISOString().slice(0, 10) === dateStr;
    });

    let promptsCount = 0;
    let utilitiesCount = 0;

    dayItems.forEach(item => {
      const toolObj = TOOLS_LIST.find(t => t.id === item.toolId);
      if (toolObj?.isAi || toolObj?.category === 'ai') {
        promptsCount += 1;
      } else {
        utilitiesCount += 1;
      }
    });

    last7Days.push({
      dateStr,
      label,
      prompts: promptsCount,
      utilities: utilitiesCount
    });
  }

  const maxDailyTotal = Math.max(1, ...last7Days.map(d => d.prompts + d.utilities));

  // 3. Live Credit & Plan Usage Calculations
  const isPro = profile?.plan === 'premium' || profile?.role === 'admin';
  const dailyLimit = isPro ? 9999 : 10;
  const usedToday = profile?.dailyUsage || 0;
  const remainingCredits = isPro ? 'Unlimited' : Math.max(0, dailyLimit - usedToday);
  const usagePercentage = isPro ? 100 : Math.min(100, Math.round((usedToday / dailyLimit) * 100));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner: Profile Overview & Plan Gauge */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Personal Usage Analytics & Dashboard</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-xl text-white shadow-lg">
                {profile?.displayName ? profile.displayName[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                  <span>{profile?.displayName || 'User Profile'}</span>
                  {isPro ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      PRO Plan
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Free Plan
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{profile?.email || 'Guest Account'}</p>
              </div>
            </div>
          </div>

          {/* Live Credit Gauge Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 min-w-[280px] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Daily Usage Meter</span>
              </span>
              <span className="font-extrabold text-white font-mono">
                {usedToday} / {isPro ? '∞' : dailyLimit} Runs
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${isPro ? 100 : usagePercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Remaining Today:</span>
              <span className="font-bold text-amber-400 font-mono">{remainingCredits}</span>
            </div>

            {!isPro && onOpenUpgrade && (
              <button
                onClick={onOpenUpgrade}
                className="w-full mt-1 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Upgrade for Unlimited Access</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total History</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{historyItems.length}</p>
          <span className="text-[10px] text-slate-500">Saved executions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tools Tried</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{Object.keys(toolUsageCounts).length}</p>
          <span className="text-[10px] text-slate-500">Unique tools used</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Favorites</span>
            <Sparkles className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{favorites.length}</p>
          <span className="text-[10px] text-slate-500">Bookmarked tools</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Account Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
            {isPro ? 'PRO Active' : 'Active'}
          </p>
          <span className="text-[10px] text-slate-500">Auto-refills daily</span>
        </div>
      </div>

      {/* REFER FRIENDS & EARN REWARDS CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-slate-900 border border-indigo-500/30 text-white shadow-xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>Refer Friends & Earn Free Rewards</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  +20 Credits
                </span>
              </h3>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Invite 10 friends to join Super Hub AI and unlock <strong>1 Month FREE Offline & Ad-Free Plan (₹99 value)</strong>!
              </p>
            </div>
          </div>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! Join me on Super Hub AI using my referral link and get 20 bonus credits: ${referralLink}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-500/20 shrink-0"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </a>
        </div>

        {/* Code & Link Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Your Referral Code</span>
              <span className="font-mono text-sm font-black text-amber-400 tracking-wider">
                {userRefCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition shrink-0 border border-indigo-500/30"
            >
              {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Direct Invite Link</span>
              <span className="text-xs font-semibold text-slate-200 truncate block">
                {referralLink}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-1.5 transition shrink-0 border border-purple-500/30"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs flex-wrap gap-1">
            <span className="font-extrabold text-white">
              Referral Milestone Progress: <span className="text-amber-400 font-black">{profile?.referralCount || 0}</span> / 10 Friends Joined
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {10 - ((profile?.referralCount || 0) % 10)} more needed for next 1-month reward
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(((profile?.referralCount || 0) % 10) * 10, 100)}%` }}
            />
          </div>

          {(profile?.referralRewardsClaimed || 0) > 0 && (
            <div className="pt-1 text-center">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                🎉 {profile?.referralRewardsClaimed} Month(s) FREE Ad-Free Plan Unlocked!
              </span>
            </div>
          )}
        </div>

        {/* Referred Members List */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Joined Friends ({profile?.referrals?.length || 0})</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Date & Details</span>
          </div>

          {profile?.referrals && profile.referrals.length > 0 ? (
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/60">
              {profile.referrals.map((refItem, idx) => {
                const displayName = refItem.name || (refItem.email ? refItem.email.split('@')[0] : 'Member');
                const formattedDate = refItem.date 
                  ? new Date(refItem.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Recently';
                return (
                  <div key={refItem.uid || idx} className="pt-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{displayName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{formattedDate}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">
              No friends have joined using your referral link yet. Share your link to start earning rewards!
            </p>
          )}
        </div>
      </div>

      {/* Main Analytics Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Daily Prompts & Utility Tool Usage (7 Days Graph) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <span>Daily Prompts & Utilities Breakdown</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              Last 7 Days
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track your daily AI prompt queries vs utility tool executions over the past week.
          </p>

          <div className="pt-4 flex items-end justify-between gap-2 h-48 border-b border-slate-200 dark:border-slate-800 pb-2">
            {last7Days.map((day, idx) => {
              const total = day.prompts + day.utilities;
              const heightPercent = total > 0 ? Math.max(15, Math.round((total / maxDailyTotal) * 100)) : 8;
              const promptHeight = total > 0 ? (day.prompts / total) * 100 : 50;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 transition font-mono">
                    {total}
                  </div>

                  {/* Dual Bar (Prompts on Top, Utility on Bottom) */}
                  <div 
                    className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col justify-end transition-all duration-300 group-hover:scale-105"
                    style={{ height: `${heightPercent}%` }}
                  >
                    {day.prompts > 0 && (
                      <div 
                        className="w-full bg-indigo-600 dark:bg-indigo-500 transition-all" 
                        style={{ height: `${promptHeight}%` }}
                        title={`${day.prompts} AI Prompts`}
                      />
                    )}
                    {day.utilities > 0 && (
                      <div 
                        className="w-full bg-cyan-500 transition-all" 
                        style={{ height: `${100 - promptHeight}%` }}
                        title={`${day.utilities} Utility Tools`}
                      />
                    )}
                  </div>

                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-xs pt-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-600 dark:bg-indigo-500" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">AI Prompts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-cyan-500" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Utility Tools</span>
            </div>
          </div>
        </div>

        {/* CHART 2: Most Frequently Used Tools */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-500" />
              <span>Most Frequently Used Tools</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Top Ranked
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Which tools you rely on most based on your saved execution history.
          </p>

          {sortedTopTools.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-1">
              <Wrench className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-700" />
              <p>No tools used yet in this session.</p>
              <p className="text-[10px] text-slate-400">Run any AI or Utility tool to see your top usage ranking here!</p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {sortedTopTools.map((t, idx) => {
                const percent = Math.round((t.count / maxToolUsage) * 100);
                return (
                  <div key={t.toolId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold flex items-center justify-center text-slate-600 dark:text-slate-400">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{t.toolName}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{t.count} runs</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* EXPORT HISTORY SECTION */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-500" />
              <span>Export Complete AI & Tool History</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Download all your generated AI texts, outputs, and prompt records in one click.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl w-fit">
            {historyItems.length} Records Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          {/* Download PDF */}
          <button
            onClick={() => exportHistoryToPdf(historyItems, profile?.displayName || profile?.email || 'User')}
            className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 border border-rose-200 dark:border-rose-800/80 hover:border-rose-400 text-rose-900 dark:text-rose-100 flex flex-col items-start gap-3 transition group text-left shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs flex items-center gap-1.5">
                <span>Download as PDF</span>
                <Download className="w-3.5 h-3.5 text-rose-500" />
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Formatted printable document report containing prompts & outputs.
              </p>
            </div>
          </button>

          {/* Download CSV */}
          <button
            onClick={() => exportHistoryToCsv(historyItems)}
            className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400 text-emerald-900 dark:text-emerald-100 flex flex-col items-start gap-3 transition group text-left shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs flex items-center gap-1.5">
                <span>Download as CSV</span>
                <Download className="w-3.5 h-3.5 text-emerald-500" />
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Spreadsheet format ready for Microsoft Excel, Google Sheets & data tools.
              </p>
            </div>
          </button>

          {/* Download JSON */}
          <button
            onClick={() => exportHistoryToJson(historyItems)}
            className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950/40 dark:to-cyan-950/40 border border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-400 text-indigo-900 dark:text-indigo-100 flex flex-col items-start gap-3 transition group text-left shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs flex items-center gap-1.5">
                <span>Download as JSON</span>
                <Download className="w-3.5 h-3.5 text-indigo-500" />
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Raw structured JSON dataset format for developer backups.
              </p>
            </div>
          </button>

        </div>
      </div>

    </div>
  );
};
