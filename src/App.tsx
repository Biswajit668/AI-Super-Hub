/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AdminPanel } from './components/AdminPanel';
import { HistoryView } from './components/HistoryView';
import { NotificationCenter } from './components/NotificationCenter';
import { AuthModal } from './components/AuthModal';
import { UpgradeModal } from './components/UpgradeModal';
import { ShareModal } from './components/ShareModal';
import { FeedbackModal } from './components/FeedbackModal';

import { AiToolRunner } from './components/tools/AiToolRunner';
import { PdfToolRunner } from './components/tools/PdfToolRunner';
import { ImageToolRunner } from './components/tools/ImageToolRunner';
import { TextToolRunner } from './components/tools/TextToolRunner';
import { UtilityToolRunner } from './components/tools/UtilityToolRunner';
import { SEO } from './components/SEO';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

import { ToolItem, ToolCategory } from './types';
import { TOOLS_LIST } from './lib/toolsData';
import { ArrowLeft, Sparkles, Heart, Share2, Star, ArrowRight } from 'lucide-react';

const MainContent: React.FC = () => {
  const { addRecentTool, favorites, toggleFavorite, theme } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [showAuth, setShowAuth] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [shareTool, setShareTool] = useState<ToolItem | null>(null);
  const [feedbackTool, setFeedbackTool] = useState<ToolItem | null>(null);

  // Sync state with URL search params on mount & popstate
  useEffect(() => {
    const handleUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      const toolId = params.get('tool');
      const viewParam = params.get('view');

      if (toolId) {
        const foundTool = TOOLS_LIST.find(t => t.id === toolId);
        if (foundTool) {
          setSelectedTool(foundTool);
          addRecentTool(foundTool.id);
          setActiveView('tool-runner');
          return;
        }
      }

      if (viewParam && ['dashboard', 'favorites', 'history', 'admin'].includes(viewParam)) {
        setActiveView(viewParam);
        setSelectedTool(null);
      } else if (!toolId) {
        setActiveView('dashboard');
        setSelectedTool(null);
      }
    };

    handleUrlParams();

    window.addEventListener('popstate', handleUrlParams);
    return () => window.removeEventListener('popstate', handleUrlParams);
  }, []);

  const handleSelectTool = (tool: ToolItem) => {
    setSelectedTool(tool);
    addRecentTool(tool.id);
    setActiveView('tool-runner');

    // Update URL query parameters so link can be copied/shared directly
    const url = new URL(window.location.href);
    url.searchParams.set('tool', tool.id);
    url.searchParams.delete('view');
    window.history.pushState({ toolId: tool.id }, '', url.toString());

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateView = (view: string) => {
    setActiveView(view);
    if (view !== 'tool-runner') {
      setSelectedTool(null);
      const url = new URL(window.location.href);
      url.searchParams.delete('tool');
      if (view !== 'dashboard') {
        url.searchParams.set('view', view);
      } else {
        url.searchParams.delete('view');
      }
      window.history.pushState({}, '', url.toString());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <SEO activeView={activeView} selectedTool={selectedTool} activeCategory={activeCategory} />
      <PwaInstallPrompt />
      
      {/* Header Bar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAuth={() => setShowAuth(true)}
        onOpenUpgrade={() => setShowUpgrade(true)}
        onOpenNotifs={() => setShowNotifs(true)}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeView={activeView}
        setActiveView={handleNavigateView}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto flex items-start">
        
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeView={activeView}
          setActiveView={handleNavigateView}
          onOpenUpgrade={() => setShowUpgrade(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          
          {/* 1. Dashboard View */}
          {activeView === 'dashboard' && (
            <DashboardView
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              onSelectTool={handleSelectTool}
              onShareTool={(t) => setShareTool(t)}
              onFeedbackTool={(t) => setFeedbackTool(t)}
              onOpenUpgrade={() => setShowUpgrade(true)}
            />
          )}

          {/* 2. Tool Execution View */}
          {activeView === 'tool-runner' && selectedTool && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => handleNavigateView('dashboard')}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to All Tools</span>
                </button>

                <button
                  onClick={() => toggleFavorite(selectedTool.id)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition shadow-sm ${
                    favorites.includes(selectedTool.id)
                      ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-300 dark:border-pink-800/80 text-pink-600 dark:text-pink-300'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(selectedTool.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                  <span>{favorites.includes(selectedTool.id) ? 'Bookmarked' : 'Add to Favorites'}</span>
                </button>
              </div>

              {selectedTool.category === 'ai' && (
                <AiToolRunner tool={selectedTool} onOpenUpgrade={() => setShowUpgrade(true)} />
              )}
              {selectedTool.category === 'pdf' && (
                <PdfToolRunner tool={selectedTool} />
              )}
              {selectedTool.category === 'image' && (
                <ImageToolRunner tool={selectedTool} />
              )}
              {selectedTool.category === 'text' && (
                <TextToolRunner tool={selectedTool} />
              )}
              {selectedTool.category === 'utility' && (
                <UtilityToolRunner tool={selectedTool} />
              )}
            </div>
          )}

          {/* 3. Favorite Tools View */}
          {activeView === 'favorites' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-500">
                    <Heart className="w-6 h-6 fill-pink-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold flex items-center gap-2">
                      <span>My Bookmarked Tools</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 font-bold border border-pink-200 dark:border-pink-800">
                        {favorites.length} Saved
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Quick access to your favorite AI, PDF & Utility tools</p>
                  </div>
                </div>

                <button
                  onClick={() => handleNavigateView('dashboard')}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs transition"
                >
                  <span>Explore More Tools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {favorites.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="w-16 h-16 mx-auto rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500">
                    <Heart className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Favorites Added Yet</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      You haven't bookmarked any tools yet. Browse through our 60+ AI, PDF, Image, Text & Utility tools and click the heart icon to save your top tools here!
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavigateView('dashboard')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition"
                  >
                    <span>Browse All Tools</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TOOLS_LIST.filter(t => favorites.includes(t.id)).map(tool => {
                    const isFav = favorites.includes(tool.id);
                    return (
                      <div 
                        key={tool.id}
                        className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-all duration-200 group hover:-translate-y-1 shadow-sm hover:shadow-md relative"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700/60 uppercase">
                              {tool.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(tool.id);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-pink-500 transition"
                                aria-label="Toggle Favorite"
                              >
                                <Heart className={`w-4 h-4 ${isFav ? 'text-pink-500 fill-pink-500' : ''}`} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShareTool(tool);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                                aria-label="Share Tool"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <h3 
                            onClick={() => handleSelectTool(tool)}
                            className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            {tool.name}
                          </h3>
                          <p 
                            onClick={() => handleSelectTool(tool)}
                            className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed cursor-pointer line-clamp-2"
                          >
                            {tool.description}
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                          <div 
                            onClick={() => setFeedbackTool(tool)}
                            className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-amber-500 cursor-pointer transition"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="font-bold text-slate-900 dark:text-white">{tool.rating}</span>
                          </div>

                          <button
                            onClick={() => handleSelectTool(tool)}
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
              )}
            </div>
          )}

          {/* 4. History View */}
          {activeView === 'history' && <HistoryView />}

          {/* 5. Admin Panel */}
          {activeView === 'admin' && <AdminPanel />}

        </main>
      </div>

      {/* Modals & Slide-over Drawers */}
      <NotificationCenter isOpen={showNotifs} onClose={() => setShowNotifs(false)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
      <ShareModal tool={shareTool} isOpen={!!shareTool} onClose={() => setShareTool(null)} />
      <FeedbackModal tool={feedbackTool} isOpen={!!feedbackTool} onClose={() => setFeedbackTool(null)} />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
