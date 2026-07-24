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
import { ArrowLeft, Sparkles, Heart } from 'lucide-react';

const MainContent: React.FC = () => {
  const { addRecentTool, favorites, theme } = useAuth();

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

  const handleSelectTool = (tool: ToolItem) => {
    setSelectedTool(tool);
    addRecentTool(tool.id);
    setActiveView('tool-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        setActiveView={setActiveView}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto flex items-start">
        
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeView={activeView}
          setActiveView={setActiveView}
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
              <button
                onClick={() => setActiveView('dashboard')}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Tools</span>
              </button>

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
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white flex items-center gap-3 shadow-sm">
                <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                <div>
                  <h2 className="text-xl font-extrabold">My Bookmarked Tools</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quick access to your favorite AI, PDF & Utility tools</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TOOLS_LIST.filter(t => favorites.includes(t.id)).map(tool => (
                  <div 
                    key={tool.id}
                    onClick={() => handleSelectTool(tool)}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 cursor-pointer transition shadow-sm hover:shadow-md"
                  >
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{tool.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{tool.description}</p>
                  </div>
                ))}
              </div>
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
