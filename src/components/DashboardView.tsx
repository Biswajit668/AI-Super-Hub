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
  LayoutGrid,
  Lightbulb,
  PlusCircle,
  Lock
} from 'lucide-react';
import { SmartGreetingHeader } from './SmartGreetingHeader';
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
  onOpenRequestTool: () => void;
  onNavigateView?: (view: string) => void;
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
  onOpenRequestTool,
  onNavigateView,
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

  const isSearching = searchQuery.trim().length > 0;

  // Filter tools based on search and category, sorted A-Z alphabetically by default
  // When a search query is active, search across ALL categories regardless of activeCategory
  const filteredTools = TOOLS_LIST.filter(tool => {
    const matchesCategory = isSearching || activeCategory === 'all' || tool.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !isSearching || 
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query) ||
      tool.tags.some(tag => tag.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Recently used tools
  const recentTools = TOOLS_LIST.filter(t => recentToolIds.includes(t.id));

  // Favorite tools
  const favoriteTools = TOOLS_LIST.filter(t => favorites.includes(t.id));

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: t.allTools },
            { id: 'ai', label: t.aiTools },
            { id: 'pdf', label: t.pdfTools },
            { id: 'image', label: t.imageTools },
            { id: 'text', label: t.textTools },
            { id: 'calculator', label: t.calculatorTools },
            { id: 'utility', label: t.utilityTools },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as ToolCategory);
                if (searchQuery) setSearchQuery('');
              }}
              className={`
                px-3.5 py-2 rounded-xl text-xs font-semibold transition touch-manipulation active:scale-95
                ${(activeCategory === cat.id && !isSearching) || (cat.id === 'all' && isSearching)
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-2 ring-indigo-500/50' 
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 shrink-0 font-bold bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          {isSearching ? `Found ${filteredTools.length} Tools` : `Showing ${filteredTools.length} of ${TOOLS_LIST.length} Tools`}
        </span>
      </div>

      {/* Active Search Banner */}
      {isSearching && (
        <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              Searching across <strong>All Categories</strong> for "<strong>{searchQuery}</strong>" ({filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} found)
            </span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition shrink-0"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Community Tool Request Banner */}
      {!isSearching && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Need a custom AI, PDF or Image tool?</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Suggest new tool ideas or vote on community requests!</p>
            </div>
          </div>

          <button
            onClick={onOpenRequestTool}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request New Tool / Vote</span>
          </button>
        </div>
      )}

      {/* Empty Search Result State */}
      {filteredTools.length === 0 && (
        <div className="py-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No tools found for "{searchQuery}"</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Try searching with different keywords like "PDF", "AI", "Image", "Compress", or "Convert".</p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition"
          >
            Show All Tools
          </button>
        </div>
      )}

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
                    {(tool.category === 'ai' || tool.isAi || tool.isPremium) && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                        <span>PRO API</span>
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
