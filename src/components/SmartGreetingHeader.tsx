import React, { useMemo } from 'react';
import { 
  Sun, 
  Sunset, 
  Moon, 
  Sparkles, 
  Heart, 
  Clock, 
  ArrowRight, 
  Zap, 
  Star, 
  Bot, 
  FileText, 
  Image as ImageIcon, 
  Calculator, 
  Wrench,
  Type
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ToolItem } from '../types';
import { TOOLS_LIST } from '../lib/toolsData';

interface SmartGreetingHeaderProps {
  onSelectTool: (tool: ToolItem) => void;
  onNavigateView: (view: string) => void;
}

export const SmartGreetingHeader: React.FC<SmartGreetingHeaderProps> = ({
  onSelectTool,
  onNavigateView,
}) => {
  const { profile, favorites, recentToolIds, toggleFavorite, addRecentTool } = useAuth();

  // Determine time-based greeting & icon
  const greetingData = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        text: 'Good Morning',
        icon: Sun,
        color: 'text-amber-400',
        bgGlow: 'from-amber-500/10 via-indigo-500/10 to-purple-500/10',
        quote: "☀️ Start your morning with AI assistance and boost your productivity today!"
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        text: 'Good Afternoon',
        icon: Sun,
        color: 'text-amber-500',
        bgGlow: 'from-amber-500/15 via-blue-500/10 to-indigo-500/10',
        quote: "🌤️ Midday focus time! Convert PDFs, write articles, or compute finances in 1-click."
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        text: 'Good Evening',
        icon: Sunset,
        color: 'text-orange-400',
        bgGlow: 'from-orange-500/15 via-purple-500/10 to-indigo-500/10',
        quote: "🌆 Evening power-hour! Wrap up your tasks quickly with Super Hub AI tools."
      };
    } else {
      return {
        text: 'Good Night',
        icon: Moon,
        color: 'text-indigo-400',
        bgGlow: 'from-indigo-600/15 via-purple-600/10 to-slate-900',
        quote: "🌙 Late night creation mode active. All 60+ AI and utility tools are ready for you."
      };
    }
  }, []);

  const IconComponent = greetingData.icon;

  // Format user name
  const getUserDisplayName = () => {
    if (profile?.displayName) return profile.displayName;
    if (profile?.email) return profile.email.split('@')[0];
    return 'Creator';
  };

  // Get user's preferred / frequent tools
  const preferredTools = useMemo(() => {
    const combinedIds = Array.from(new Set([...favorites, ...recentToolIds]));
    let matched = TOOLS_LIST.filter(t => combinedIds.includes(t.id));

    // Fallback if brand new user with no favorites/recents yet
    if (matched.length === 0) {
      const defaultIds = ['ai-article-writer', 'bg-remover', 'pdf-merge', 'loan-emi-calculator'];
      matched = TOOLS_LIST.filter(t => defaultIds.includes(t.id));
    }

    return matched.slice(0, 6);
  }, [favorites, recentToolIds]);

  // Helper icon renderer
  const renderIcon = (category: string) => {
    if (category === 'ai') return <Bot className="w-4 h-4 text-purple-400" />;
    if (category === 'pdf') return <FileText className="w-4 h-4 text-rose-400" />;
    if (category === 'image') return <ImageIcon className="w-4 h-4 text-emerald-400" />;
    if (category === 'text') return <Type className="w-4 h-4 text-blue-400" />;
    if (category === 'calculator') return <Calculator className="w-4 h-4 text-amber-400" />;
    return <Wrench className="w-4 h-4 text-indigo-400" />;
  };

  const handleToolClick = (tool: ToolItem) => {
    addRecentTool(tool.id);
    onSelectTool(tool);
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      
      {/* 1. Time-Based Warm Greeting Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${greetingData.bgGlow} bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-500/30 text-slate-900 dark:text-white shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2 max-w-2xl">
            {/* Greeting Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs">
              <IconComponent className={`w-4 h-4 ${greetingData.color}`} />
              <span>{greetingData.text}, <span className="text-indigo-600 dark:text-amber-400 font-extrabold">{getUserDisplayName()}</span>!</span>
            </div>

            {/* Main Greeting Headline */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              Welcome back to your <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Personal AI Workspace</span> 👋
            </h2>

            {/* Dynamic Quote / Advice */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-indigo-200/90 font-medium leading-relaxed">
              {greetingData.quote}
            </p>
          </div>

          {/* Quick User Plan Badge & Stats */}
          <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-4 shrink-0 shadow-md backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {profile?.plan === 'premium' || profile?.role === 'admin' ? 'PRO Member ⚡' : 'Free Plan'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">
                  {profile?.credits || 100} Credits
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Daily Refill Active • 60+ Tools Available
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. User Preference Space (My Favorite & Frequent Tools) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Your Preference Space</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  {preferredTools.length} Quick Launch
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {favorites.length > 0 ? "Fast 1-click access to your starred and recently opened tools." : "Top handpicked AI and utility tools recommended for you today."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateView('favorites')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <span>View All Favorites ({favorites.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Preferred Tools Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {preferredTools.map((tool) => {
            const isFav = favorites.includes(tool.id);

            return (
              <div
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="group p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/90 hover:border-indigo-500/50 hover:bg-indigo-50/60 dark:hover:bg-slate-800/50 transition duration-200 cursor-pointer flex items-center justify-between gap-3 relative shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-indigo-500/40 shrink-0 transition shadow-2xs">
                    {renderIcon(tool.category)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate transition">
                      {tool.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(tool.id);
                    }}
                    className={`p-1.5 rounded-lg transition ${
                      isFav ? 'text-rose-500 bg-rose-500/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                    title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                  </button>

                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
