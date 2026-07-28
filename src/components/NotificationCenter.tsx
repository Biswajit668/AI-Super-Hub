import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Info, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  CheckCheck, 
  Trash2, 
  Search, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Wrench, 
  Gift, 
  ShieldAlert, 
  ArrowRight,
  Filter,
  BellRing
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '../types';
import { requestNotificationPermission } from '../lib/firebase';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView?: (view: string) => void;
  onSelectTool?: (toolId: string) => void;
  onOpenUpgrade?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  isOpen, 
  onClose,
  onSelectView,
  onSelectTool,
  onOpenUpgrade
}) => {
  const { 
    notifications, 
    unreadNotifCount, 
    readNotifIds, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotificationItem,
    addInAppNotification
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'promo' | 'alert'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pushStatus, setPushStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;

  // Request Push Permission
  const handleEnablePush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPushStatus(perm);
        if (perm === 'granted') {
          new Notification('Super Hub AI Notifications Enabled! 🚀', {
            body: 'You will now receive instant updates on new tools, free credit gifts, and system announcements.',
            icon: '/favicon.ico'
          });
        }
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    }
  };

  // Trigger test push alert
  const handleSendTestAlert = () => {
    if (pushStatus === 'granted') {
      new Notification('🔔 Super Hub AI Test Alert', {
        body: 'Your notification system is working perfectly! You are all set.',
        icon: '/favicon.ico'
      });
    }

    addInAppNotification({
      title: 'Test Notification Delivered!',
      message: 'In-app and system alert test completed successfully.',
      type: 'success',
      category: 'system'
    });
  };

  // Filter logic
  const filteredNotifs = notifications.filter((n) => {
    const isRead = n.id ? readNotifIds.includes(n.id) : false;

    if (activeTab === 'unread' && isRead) return false;
    if (activeTab === 'promo' && n.type !== 'promo') return false;
    if (activeTab === 'alert' && n.type !== 'warning' && n.type !== 'info') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchMsg = n.message.toLowerCase().includes(q);
      return matchTitle || matchMsg;
    }

    return true;
  });

  // Calculate relative time string
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (item.id) markNotificationAsRead(item.id);

    if (item.actionView) {
      if (onSelectView) onSelectView(item.actionView);
      onClose();
    } else if (item.actionToolId) {
      if (onSelectTool) onSelectTool(item.actionToolId);
      onClose();
    } else if (item.actionUrl) {
      if (item.actionUrl === 'upgrade' && onOpenUpgrade) {
        onOpenUpgrade();
      } else {
        window.open(item.actionUrl, '_blank');
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Overlay Backdrop Click */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-250">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-ping" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Notifications</span>
                  {unreadNotifCount > 0 && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm">
                      {unreadNotifCount} New
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant updates, rewards & system releases</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadNotifCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center gap-1 transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Read All</span>
                </button>
              )}

              <button 
                onClick={onClose} 
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-xl font-bold transition whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>

            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'unread'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Unread</span>
              {unreadNotifCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('promo')}
              className={`px-3 py-1 rounded-xl font-bold transition whitespace-nowrap ${
                activeTab === 'promo'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Deals & Promos
            </button>

            <button
              onClick={() => setActiveTab('alert')}
              className={`px-3 py-1 rounded-xl font-bold transition whitespace-nowrap ${
                activeTab === 'alert'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Alerts
            </button>
          </div>
        </div>

        {/* Browser Push Banner */}
        <div className={`px-4 py-3 border-b transition ${pushStatus !== 'granted' ? 'bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-purple-500/15 border-amber-500/30 dark:border-amber-500/20' : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50'}`}>
          <div className="flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold">
              <BellRing className={`w-4 h-4 shrink-0 ${pushStatus !== 'granted' ? 'text-amber-500 animate-bounce' : 'text-indigo-600 dark:text-indigo-400'}`} />
              <span className="text-xs font-bold">
                {pushStatus !== 'granted' ? 'Turn On Live Push Notifications' : 'Browser Push Alerts:'}
              </span>
            </div>

            {pushStatus === 'granted' ? (
              <button
                onClick={handleSendTestAlert}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Enabled (Test Alert)</span>
              </button>
            ) : pushStatus === 'denied' ? (
              <button
                onClick={() => alert('Notifications are currently blocked by your browser settings. To enable: click the lock icon next to the URL in your browser address bar and set Notifications to "Allow".')}
                className="text-[10px] text-rose-500 font-extrabold underline shrink-0"
              >
                Blocked (How to Fix)
              </button>
            ) : (
              <button
                onClick={handleEnablePush}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition active:scale-95 shrink-0 flex items-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Turn On Now</span>
              </button>
            )}
          </div>
          {pushStatus !== 'granted' && (
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 font-medium">
              Enable browser notifications for real-time alerts on new AI tools, daily credit refills, and special offers.
            </p>
          )}
        </div>

        {/* Notifications List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs font-medium space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 opacity-60" />
              <p>No notifications found in this view.</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-indigo-600 dark:text-indigo-400 underline font-bold"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            filteredNotifs.map((n) => {
              const isRead = n.id ? readNotifIds.includes(n.id) : false;

              return (
                <div 
                  key={n.id || Math.random()} 
                  className={`group relative p-4 rounded-2xl border transition-all duration-200 ${
                    !isRead
                      ? 'bg-indigo-50/40 dark:bg-slate-800/90 border-indigo-200 dark:border-indigo-500/40 shadow-sm'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Icon */}
                    <div className="shrink-0 mt-0.5">
                      {n.type === 'promo' ? (
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      ) : n.type === 'warning' ? (
                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      ) : n.type === 'success' ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-bold leading-tight ${!isRead ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}>
                          {n.title}
                        </h4>

                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" title="Unread" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>

                      {/* Action Button if present */}
                      {(n.actionLabel || n.actionView || n.actionToolId || n.actionUrl) && (
                        <button
                          onClick={() => handleNotificationClick(n)}
                          className="mt-2.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition active:scale-95"
                        >
                          <span>{n.actionLabel || 'Explore Now'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{formatTime(n.createdAt)}</span>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {n.id && (
                            <button
                              onClick={() => markNotificationAsRead(n.id!)}
                              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"
                            >
                              {isRead ? 'Mark Unread' : 'Mark Read'}
                            </button>
                          )}
                          {n.id && (
                            <button
                              onClick={() => deleteNotificationItem(n.id!)}
                              className="hover:text-rose-500 p-0.5"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
