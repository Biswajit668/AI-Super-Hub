import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  FileText, 
  Image as ImageIcon, 
  Type, 
  Calculator,
  Wrench, 
  Heart, 
  History, 
  ShieldAlert, 
  Crown, 
  X,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../lib/translations';
import { ToolCategory } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: ToolCategory;
  setActiveCategory: (cat: ToolCategory) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenUpgrade: () => void;
  onOpenRequestTool: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeCategory,
  setActiveCategory,
  activeView,
  setActiveView,
  onOpenUpgrade,
  onOpenRequestTool,
}) => {
  const { profile, language, currentUser } = useAuth();
  const t = translations[language] || translations.en;

  const categories = [
    { id: 'all', label: t.allTools, icon: LayoutDashboard },
    { id: 'ai', label: t.aiTools, icon: Bot, badge: '23' },
    { id: 'pdf', label: t.pdfTools, icon: FileText, badge: '33' },
    { id: 'image', label: t.imageTools, icon: ImageIcon, badge: '9' },
    { id: 'text', label: t.textTools, icon: Type, badge: '12' },
    { id: 'calculator', label: t.calculatorTools, icon: Calculator, badge: '7+' },
    { id: 'utility', label: t.utilityTools, icon: Wrench, badge: '5' },
  ];

  const handleSelectCategory = (catId: string) => {
    setActiveView('dashboard');
    setActiveCategory(catId as ToolCategory);
    onClose();
  };

  const handleSelectView = (view: string) => {
    setActiveView(view);
    onClose();
  };

  const isAdmin = profile?.role === 'admin' || currentUser?.email === 'biswajitnaskar668@gmail.com';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-sm
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 flex-1 overflow-y-auto">
          
          {/* Mobile Header Close */}
          <div className="flex items-center justify-between pb-4 mb-2 md:hidden border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-slate-900 dark:text-white text-base">Menu Navigation</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categories Navigation */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Tool Suites
            </p>

            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeView === 'dashboard' && activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group
                    ${isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/30 shadow-sm' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                    <span>{cat.label}</span>
                  </div>
                  {cat.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Workspace */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              My Workspace
            </p>

            <button
              onClick={() => handleSelectView('favorites')}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition
                ${activeView === 'favorites' ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}
              `}
            >
              <Heart className="w-4 h-4 text-pink-500" />
              <span>{t.favoriteTools}</span>
            </button>

            <button
              onClick={() => handleSelectView('history')}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition
                ${activeView === 'history' ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}
              `}
            >
              <History className="w-4 h-4 text-cyan-500" />
              <span>{t.history}</span>
            </button>

            <button
              onClick={() => {
                onOpenRequestTool();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
            >
              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span>Request New Tool & Idea</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => handleSelectView('admin')}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition
                  ${activeView === 'admin' ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400'}
                `}
              >
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>{t.adminPanel}</span>
              </button>
            )}
          </div>

        </div>

        {/* Upgrade Banner Bottom */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/60 dark:to-purple-950/60 border border-indigo-200 dark:border-indigo-500/20 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            <Crown className="w-6 h-6 text-amber-500 dark:text-amber-400 mx-auto mb-1.5" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.upgradeToPro}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
              Unlimited AI generation & 0 Ads
            </p>
            <button
              onClick={onOpenUpgrade}
              className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
            >
              Get PRO $9.99/mo
            </button>
          </div>
        </div>

      </aside>
    </>
  );
};
