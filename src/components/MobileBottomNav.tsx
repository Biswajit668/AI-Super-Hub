import React from 'react';
import { LayoutGrid, Bot, FileText, Heart, Crown, History } from 'lucide-react';
import { ToolCategory } from '../types';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
  activeCategory: ToolCategory;
  setActiveCategory: (cat: ToolCategory) => void;
  onOpenUpgrade: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  setActiveView,
  activeCategory,
  setActiveCategory,
  onOpenUpgrade,
}) => {
  const { profile } = useAuth();
  const isPro = profile?.plan === 'premium' || profile?.role === 'admin';

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
      label: 'AI',
      icon: Bot,
      action: () => {
        setActiveView('dashboard');
        setActiveCategory('ai');
      },
      isActive: activeView === 'dashboard' && activeCategory === 'ai',
    },
    {
      id: 'pdf',
      label: 'PDF',
      icon: FileText,
      action: () => {
        setActiveView('dashboard');
        setActiveCategory('pdf');
      },
      isActive: activeView === 'dashboard' && activeCategory === 'pdf',
    },
    {
      id: 'favorites',
      label: 'Saved',
      icon: Heart,
      action: () => {
        setActiveView('favorites');
      },
      isActive: activeView === 'favorites',
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
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl px-2 py-1 flex items-center justify-around text-[10px] font-bold">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.action}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
              item.isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                : item.isHighlighted
                ? 'text-amber-500 font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${item.isActive ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
              <Icon className={`w-4 h-4 ${item.isHighlighted ? 'animate-bounce text-amber-500' : ''}`} />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
