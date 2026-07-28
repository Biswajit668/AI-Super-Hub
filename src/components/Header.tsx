import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  User, 
  Crown, 
  Download, 
  LogOut, 
  ShieldAlert, 
  ShieldCheck,
  CheckCircle2,
  Menu,
  X,
  Zap,
  Lightbulb,
  Home,
  LayoutGrid,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../lib/translations';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAuth: () => void;
  onOpenUpgrade: () => void;
  onOpenNotifs: () => void;
  onOpenRequestTool: () => void;
  toggleSidebar: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  onOpenUpgrade,
  onOpenNotifs,
  onOpenRequestTool,
  toggleSidebar,
  activeView,
  setActiveView,
}) => {
  const { 
    currentUser, 
    profile, 
    theme, 
    toggleTheme, 
    language, 
    logout, 
    installPrompt, 
    installPwaApp,
    notifications,
    unreadNotifCount
  } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const t = translations[language] || translations.en;
  const isPro = profile?.plan === 'premium' || profile?.role === 'admin';
  const isAdFree = profile?.plan === 'adfree';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-slate-200 dark:to-indigo-300 bg-clip-text text-transparent">
                Super Hub AI
              </span>
              <span className="hidden lg:inline-block ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30">
                v2.5 PRO
              </span>
            </div>
          </div>

          {/* Nav Tabs for Desktop */}
          <div className="hidden lg:flex items-center gap-1 ml-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeView === 'home'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeView === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Tools</span>
            </button>
          </div>
        </div>

        {/* Middle: Global Search */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Mobile Search"
          >
            <Search className="w-4 h-4" />
          </button>
          
          {/* PWA Install Button */}
          {installPrompt && (
            <button
              onClick={installPwaApp}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
              title={t.installApp}
            >
              <Download className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>{t.installApp}</span>
            </button>
          )}

          {/* Credits / Plan Badge */}
          <button
            onClick={onOpenUpgrade}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition border shrink-0 ${
              isPro
                ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 shadow-sm'
                : isAdFree
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-sm'
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20'
            }`}
          >
            {isPro ? (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>PRO</span>
              </>
            ) : isAdFree ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Ad-Free</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>{profile ? `${profile.credits} ${t.credits}` : '10 Free'}</span>
              </>
            )}
          </button>

          {/* Request Tool / Idea Button */}
          <button
            onClick={onOpenRequestTool}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition shrink-0"
            title="Request New Tool & Feature Idea"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Request Tool</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="hidden sm:flex p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifs}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition relative shrink-0"
            aria-label="Notifications"
            title="Notifications & System Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-bounce">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            ) : notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 opacity-60" />
            )}
          </button>

          {/* User Account Menu / Login */}
          {currentUser ? (
            <div className="relative shrink-0">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-full sm:rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/40 hover:border-indigo-400 dark:hover:border-indigo-600 transition"
                title="Account Settings"
              >
                <div className="relative">
                  <img
                    src={profile?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=default'}
                    alt="Avatar"
                    className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-slate-200 dark:bg-slate-800 object-cover ring-2 ring-indigo-500/30"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <span className="hidden sm:inline-block text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[90px]">
                  {profile?.displayName?.split(' ')[0] || 'Account'}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{profile?.displayName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{profile?.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        profile?.role === 'admin' 
                          ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                          : profile?.plan === 'premium'
                          ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {profile?.role === 'admin' ? 'Admin' : profile?.plan === 'premium' ? 'PRO Plan' : 'Free Plan'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveView('analytics');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>My Analytics & Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('history');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    {t.history}
                  </button>

                  {(profile?.role === 'admin' || currentUser.email === 'biswajitnaskar668@gmail.com') && (
                    <button
                      onClick={() => {
                        setActiveView('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{t.adminPanel}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition shrink-0 active:scale-95"
            >
              {t.login}
            </button>
          )}

        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {showMobileSearch && (
        <div className="sm:hidden px-4 pb-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 shadow-lg">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-medium"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Quick Search Tag Recommendations */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto scrollbar-none pb-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0 uppercase tracking-wider">Quick:</span>
            {['AI Chat', 'PDF Merge', 'Bg Remover', 'Calculator', 'Converter'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  setActiveView('dashboard');
                }}
                className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 text-[10px] font-bold shrink-0 active:scale-95 transition-transform"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
