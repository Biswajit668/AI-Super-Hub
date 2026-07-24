import React from 'react';
import { 
  Sparkles, 
  Search, 
  Heart, 
  Star, 
  ArrowRight, 
  Zap, 
  Crown, 
  Share2, 
  MessageSquare, 
  Flame,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../lib/translations';
import { ToolItem, ToolCategory } from '../types';
import { TOOLS_LIST } from '../lib/toolsData';
import { AdBanner } from './AdBanner';

interface DashboardViewProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategory: ToolCategory;
  setActiveCategory: (cat: ToolCategory) => void;
  onSelectTool: (tool: ToolItem) => void;
  onShareTool: (tool: ToolItem) => void;
  onFeedbackTool: (tool: ToolItem) => void;
  onOpenUpgrade: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  onSelectTool,
  onShareTool,
  onFeedbackTool,
  onOpenUpgrade,
}) => {
  const { 
    profile, 
    language, 
    favorites, 
    toggleFavorite, 
    recentToolIds 
  } = useAuth();

  const t = translations[language] || translations.en;
  const isPro = profile?.plan === 'premium' || profile?.role === 'admin';

  // Filter tools based on search and category
  const filteredTools = TOOLS_LIST.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = !searchQuery || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Recently used tools
  const recentTools = TOOLS_LIST.filter(t => recentToolIds.includes(t.id));

  // Favorite tools
  const favoriteTools = TOOLS_LIST.filter(t => favorites.includes(t.id));

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Super Hub AI v2.5 Suite</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            {t.tagline}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Access 60+ AI, PDF, Image, Text & Utility tools. Unlimited AI generations, OCR vision, and PDF tools in one fast platform.
          </p>

          {/* User Credits Tracker Pill */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-2 text-xs">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">Daily Usage:</span>
              <span className="font-bold text-white">{profile ? profile.dailyUsage : 0} / {isPro ? '∞ Unlimited' : '10 Free'}</span>
            </div>

            {!isPro && (
              <button
                onClick={onOpenUpgrade}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{t.upgradeToPro}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ad Banner for Free Users */}
      <AdBanner onOpenUpgrade={onOpenUpgrade} />

      {/* Recently Used Tools Carousel */}
      {recentTools.length > 0 && !searchQuery && activeCategory === 'all' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>{t.recentTools}</span>
            </h3>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {recentTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool)}
                className="min-w-[220px] p-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 cursor-pointer transition group shrink-0 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {tool.name}
                  </span>
                  {tool.isAi && <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 no-scrollbar scrollbar-none">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: t.allTools },
            { id: 'ai', label: t.aiTools },
            { id: 'pdf', label: t.pdfTools },
            { id: 'image', label: t.imageTools },
            { id: 'text', label: t.textTools },
            { id: 'utility', label: t.utilityTools },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as ToolCategory)}
              className={`
                px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 touch-manipulation active:scale-95
                ${activeCategory === cat.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' 
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 shrink-0 hidden sm:inline-block font-medium">
          Showing {filteredTools.length} Tools
        </span>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => {
          const isFav = favorites.includes(tool.id);

          return (
            <div
              key={tool.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-slate-700 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-all duration-200 group hover:-translate-y-1 shadow-sm hover:shadow-md relative"
            >
              <div>
                {/* Top Row Badges & Actions */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700/60 uppercase">
                      {tool.category}
                    </span>
                    {tool.popular && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 uppercase">
                        {t.popularBadge}
                      </span>
                    )}
                    {tool.isPremium && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 uppercase">
                        {t.proBadge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pink-500 transition"
                      aria-label="Bookmark Tool"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'text-pink-500 fill-pink-500' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareTool(tool);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                      aria-label="Share Tool"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 
                  onClick={() => onSelectTool(tool)}
                  className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  {tool.name}
                </h3>
                
                <p 
                  onClick={() => onSelectTool(tool)}
                  className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed cursor-pointer line-clamp-2"
                >
                  {tool.description}
                </p>
              </div>

              {/* Bottom Row Rating & CTA */}
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <div 
                  onClick={() => onFeedbackTool(tool)}
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-amber-500 cursor-pointer transition"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-slate-900 dark:text-white">{tool.rating}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">({(tool.usageCount / 1000).toFixed(1)}k)</span>
                </div>

                <button
                  onClick={() => onSelectTool(tool)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 text-slate-700 dark:text-slate-300 group-hover:text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
