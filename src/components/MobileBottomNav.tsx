import React, { useState } from 'react';
import { LayoutGrid, Bot, FileText, Calculator, Heart, Crown, Wrench, User, ShieldAlert, History, LogOut, X, Zap, ChevronRight } from 'lucide-react';
import { ToolCategory } from '../types';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
  activeCategory: ToolCategory;
  setActiveCategory: (cat: ToolCategory) => void;
  onOpenUpgrade: () => void;
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  setActiveView,
  activeCategory,
  setActiveCategory,
  onOpenUpgrade,
  onOpenAuth,
}) => {
  const { currentUser, profile, logout } = useAuth();
  const [showAccountModal, setShowAccountModal] = useState(false);

  const isPro = profile?.plan === 'premium' || profile?.role === 'admin';
  const isAdmin = profile?.role === 'admin' || currentUser?.email === 'biswajitnaskar668@gmail.com';

  const items = [
    {
      id: 'all',
      label: 'Tools',
      icon: LayoutGrid,
      action: () => {
        setActiveView('dashboard');
        setActiveCategory('all');
      },
      isActive: activeView === 'dashboard' && activeCategory === 'all',
    },
    {
      id: 'ai',
      label: 'AI Studio',
      icon: Bot,
      action: () => {
        setActiveView('dashboard');
        setActiveCategory('ai');
      },
      isActive: activeView === 'dashboard' && activeCategory === 'ai',
    },
    {
      id: 'pdf',
      label: 'PDF Tools',
      icon: FileText,
      action: () => {
        setActiveView('dashboard');
        setActiveCategory('pdf');
      },
      isActive: activeView === 'dashboard' && activeCategory === 'pdf',
    },
    {
      id: 'calculator',
      label: 'Calculator',
      icon: Calculator,
      action: () => {
        setActiveView('dashboard');
        setActiveCategory('calculator');
      },
      isActive: activeView === 'dashboard' && activeCategory === 'calculator',
    },
    {
      id: 'pro',
      label: isPro ? 'PRO' : 'Upgrade',
      icon: Crown,
      action: () => {
        onOpenUpgrade();
      },
      isActive: false,
      isHighlighted: !isPro,
    },
    {
      id: 'account',
      label: currentUser ? 'Account' : 'Login',
      icon: User,
      action: () => {
        if (currentUser) {
          setShowAccountModal(true);
        } else {
          onOpenAuth();
        }
      },
      isActive: showAccountModal,
      isUserAvatar: !!currentUser,
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between px-1.5 py-1 max-w-md mx-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive;

            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all duration-200 active:scale-95 min-h-[48px] ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-black'
                    : item.isHighlighted
                    ? 'text-amber-500 font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-semibold'
                }`}
              >
                {/* Active Pill Background Indicator */}
                {isActive && (
                  <span className="absolute inset-x-1 inset-y-0.5 bg-indigo-50 dark:bg-indigo-950/70 rounded-2xl -z-10 border border-indigo-200/80 dark:border-indigo-500/30 transition-all duration-200" />
                )}

                <div className="relative flex items-center justify-center">
                  {item.isUserAvatar && profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt="Profile"
                      className={`w-5 h-5 rounded-full object-cover border ${
                        isActive ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-300 dark:border-slate-700'
                      }`}
                    />
                  ) : (
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? 'scale-110 text-indigo-600 dark:text-indigo-400' : ''
                      } ${item.isHighlighted ? 'animate-bounce text-amber-500' : ''}`}
                    />
                  )}

                  {item.id === 'ai' && !isActive && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                  {item.id === 'account' && currentUser && (
                    <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
                  )}
                </div>

                <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Account Profile Drawer / Slide-Up Sheet */}
      {showAccountModal && currentUser && (
        <div className="fixed inset-0 z-50 md:hidden flex items-end justify-center bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setShowAccountModal(false)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl p-5 space-y-5 shadow-2xl z-10 animate-in slide-in-from-bottom duration-250 max-h-[85vh] overflow-y-auto">
            {/* Header Handle & Close */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full inline-block" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">My Account</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3.5">
              <img
                src={profile?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=default'}
                alt="Avatar"
                className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 object-cover border-2 border-indigo-500"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {profile?.displayName || 'Super Hub User'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {profile?.email}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase border ${
                    isAdmin
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      : isPro
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                  }`}>
                    {isAdmin ? 'ADMINISTRATOR' : isPro ? 'PRO MEMBER' : 'FREE PLAN'}
                  </span>

                  {!isPro && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAccountModal(false);
                        onOpenUpgrade();
                      }}
                      className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                    >
                      <Crown className="w-3 h-3" />
                      <span>Upgrade</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Credits & Usage Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold">AI Credits</span>
                </div>
                <div className="text-lg font-black text-indigo-950 dark:text-indigo-100">
                  {profile?.credits ?? 10} Left
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-xs font-bold">Today Usage</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {profile?.dailyUsage ?? 0} Used
                </div>
              </div>
            </div>

            {/* Account Quick Links */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowAccountModal(false);
                  setActiveView('history');
                }}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-indigo-500" />
                  <span>My Activity & History</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAccountModal(false);
                  setActiveView('favorites');
                }}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span>Bookmarked Tools</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountModal(false);
                    setActiveView('admin');
                  }}
                  className="w-full p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>Admin Control Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                </button>
              )}
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => {
                setShowAccountModal(false);
                logout();
              }}
              className="w-full py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center justify-center gap-2 border border-rose-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Account</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};


