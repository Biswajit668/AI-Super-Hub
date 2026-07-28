import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Zap, 
  Crown, 
  FileText, 
  Bot, 
  Image as ImageIcon, 
  Type, 
  Calculator, 
  Wrench, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  Users, 
  Cpu, 
  Clock, 
  Lock, 
  Smartphone, 
  Lightbulb, 
  PlusCircle, 
  Flame, 
  Layers, 
  Globe,
  ArrowUpRight,
  ChevronRight,
  MessageSquare,
  PenTool,
  RefreshCw,
  Scissors,
  FilePlus,
  Crop,
  Sliders,
  Code,
  Key,
  FileSpreadsheet
} from 'lucide-react';
import { SmartGreetingHeader } from './SmartGreetingHeader';
import { ToolItem, ToolCategory } from '../types';
import { TOOLS_LIST } from '../lib/toolsData';
import { useAuth } from '../context/AuthContext';
import { translations } from '../lib/translations';

interface HomeViewProps {
  onSelectTool: (tool: ToolItem) => void;
  onNavigateView: (view: string) => void;
  onSelectCategory: (category: ToolCategory) => void;
  onOpenUpgrade: () => void;
  onOpenRequestTool: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTool,
  onNavigateView,
  onSelectCategory,
  onOpenUpgrade,
  onOpenRequestTool,
}) => {
  const { profile, language } = useAuth();
  const t = translations[language] || translations.en;
  const isPro = profile?.plan === 'premium' || profile?.role === 'admin';

  const [heroSearch, setHeroSearch] = useState('');

  // Total tool count
  const totalToolsCount = TOOLS_LIST.length;

  // Helper to get exact tool count per category
  const getCategoryCount = (catId: string) => TOOLS_LIST.filter(t => t.category === catId).length;

  // Helper to render proper icon components for tools
  const renderToolIcon = (iconName: string, category: string) => {
    switch (iconName) {
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'PenTool': return <PenTool className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'RefreshCw': return <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'FileText': return <FileText className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'FilePlus': return <FilePlus className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'Scissors': return <Scissors className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'Lock': return <Lock className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'Image': return <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'Crop': return <Crop className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'Sliders': return <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'Calculator': return <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'Wrench': return <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'Code': return <Code className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'Globe': return <Globe className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'Key': return <Key className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />;
      default:
        if (category === 'ai') return <Bot className="w-5 h-5 sm:w-6 sm:h-6" />;
        if (category === 'pdf') return <FileText className="w-5 h-5 sm:w-6 sm:h-6" />;
        if (category === 'image') return <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />;
        if (category === 'text') return <Type className="w-5 h-5 sm:w-6 sm:h-6" />;
        if (category === 'calculator') return <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />;
        if (category === 'utility') return <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />;
        return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  // Exactly Top 10 popular tools for featured section
  const popularTools = [...TOOLS_LIST]
    .sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return (b.usageCount || 0) - (a.usageCount || 0);
    })
    .slice(0, 10);

  // Search results inside hero live search
  const searchResults = heroSearch.trim()
    ? TOOLS_LIST.filter(tool =>
        tool.name.toLowerCase().includes(heroSearch.toLowerCase()) ||
        tool.description.toLowerCase().includes(heroSearch.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(heroSearch.toLowerCase()))
      ).slice(0, 5)
    : [];

  const toolSuites = [
    {
      id: 'ai',
      title: 'AI Studio Suite',
      description: 'Powered by Google Gemini Flash for instant writing, summarization & code generation.',
      icon: Bot,
      count: `${getCategoryCount('ai')} Tools`,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      sampleTools: ['AI Article Writer', 'Text Summarizer', 'Code Debugger', 'Email Generator'],
    },
    {
      id: 'pdf',
      title: 'PDF Document Engine',
      description: 'Merge, split, compress, convert & lock PDFs securely in your browser.',
      icon: FileText,
      count: `${getCategoryCount('pdf')} Tools`,
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-500/10 border-red-500/20 text-red-400',
      sampleTools: ['PDF Merger', 'Compress PDF', 'PDF to Word', 'Split PDF'],
    },
    {
      id: 'image',
      title: 'Image Magic Studio',
      description: 'Remove backgrounds, resize, compress, and convert photo formats instantly.',
      icon: ImageIcon,
      count: `${getCategoryCount('image')} Tools`,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      sampleTools: ['Background Remover', 'Image Compressor', 'Resizer', 'WEBP Converter'],
    },
    {
      id: 'text',
      title: 'Text & Writer Utilities',
      description: 'Word count, diff comparison, case conversion, and markdown previews.',
      icon: Type,
      count: `${getCategoryCount('text')} Tools`,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      sampleTools: ['Text Diff Checker', 'Plagiarism Checker', 'Word Counter'],
    },
    {
      id: 'calculator',
      title: 'Financial Calculators',
      description: 'Calculate loan EMIs, GST tax, percentage changes, and investment returns.',
      icon: Calculator,
      count: `${getCategoryCount('calculator')} Tools`,
      color: 'from-amber-500 to-yellow-600',
      bgColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      sampleTools: ['Loan EMI Calculator', 'GST Tax Calculator', 'CAGR Return'],
    },
    {
      id: 'utility',
      title: 'Web & Developer Suite',
      description: 'JSON formatters, QR code generators, Base64 encoder/decoder, and passwords.',
      icon: Wrench,
      count: `${getCategoryCount('utility')} Tools`,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      sampleTools: ['JSON Formatter', 'QR Code Generator', 'Password Generator'],
    },
  ];

  const quickPills = [
    { label: '🤖 Gemini AI Writer', toolId: 'ai-article-writer' },
    { label: '🖼️ Remove BG', toolId: 'bg-remover' },
    { label: '📄 PDF Compress', toolId: 'pdf-compress' },
    { label: '📊 CSV to JSON', toolId: 'csv-to-json' },
    { label: '📷 Image Resizer', toolId: 'image-resizer' },
  ];

  const handlePillClick = (toolId: string) => {
    const found = TOOLS_LIST.find(t => t.id === toolId);
    if (found) {
      onSelectTool(found);
    } else {
      onNavigateView('dashboard');
    }
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-300 pb-12">
      
      {/* Smart Personalization & Time-Based Greeting Header */}
      <SmartGreetingHeader onSelectTool={onSelectTool} onNavigateView={onNavigateView} />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 dark:bg-slate-950 border border-indigo-200/80 dark:border-slate-800 text-slate-900 dark:text-white shadow-xl p-6 sm:p-12 lg:p-16">
        {/* Background Decorative Glow Effect */}
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/80 dark:bg-gradient-to-r dark:from-indigo-500/15 dark:via-purple-500/15 dark:to-pink-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
            <span>Super Hub AI v2.5 — Next-Gen SaaS Platform</span>
            <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold text-white">
              {totalToolsCount} Tools Available
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-slate-900 dark:text-white">
            The Ultimate All-in-One <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              AI, PDF, Image & Utility
            </span> SaaS Suite
          </h1>

          {/* Hero Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            One powerful, fast & mobile-optimized workspace with {totalToolsCount} tools. Generate content with AI, convert PDFs, optimize photos, and run smart utilities in seconds.
          </p>

          {/* Interactive Live Tool Search Box */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative">
              <div className="relative flex items-center bg-white/90 dark:bg-slate-900/90 border-2 border-indigo-500/40 focus-within:border-indigo-600 rounded-2xl p-2 shadow-lg backdrop-blur-xl transition">
                <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="What would you like to build or convert today? (e.g. PDF, BG Remover, AI Writer)..."
                  className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                />
                {heroSearch && (
                  <button
                    onClick={() => setHeroSearch('')}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => {
                    if (heroSearch.trim() && searchResults.length > 0) {
                      onSelectTool(searchResults[0]);
                    } else {
                      onNavigateView('dashboard');
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Instant Search Suggestions Dropdown */}
              {heroSearch.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 text-left divide-y divide-slate-800">
                  {searchResults.length > 0 ? (
                    searchResults.map((tool) => (
                      <div
                        key={tool.id}
                        onClick={() => {
                          onSelectTool(tool);
                          setHeroSearch('');
                        }}
                        className="p-3 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{tool.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                              {tool.name}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">
                              {tool.description}
                            </div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-bold shrink-0">
                          Launch →
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No matching tools found for "{heroSearch}".{' '}
                      <button 
                        onClick={() => {
                          onNavigateView('dashboard');
                          setHeroSearch('');
                        }}
                        className="text-indigo-400 font-bold underline"
                      >
                        View All Tools
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              <span className="text-[11px] text-slate-400 font-medium">Quick Try:</span>
              {quickPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePillClick(pill.toolId)}
                  className="px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/80 text-xs text-slate-200 hover:text-white hover:border-indigo-500/50 transition active:scale-95"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Call To Actions */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                onSelectCategory('all');
                onNavigateView('dashboard');
              }}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <Layers className="w-5 h-5" />
              <span>Explore All {totalToolsCount} Tools</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {!isPro ? (
              <button
                onClick={onOpenUpgrade}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-extrabold text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Crown className="w-5 h-5 text-amber-400" />
                <span>Get Pro Unlimited</span>
              </button>
            ) : (
              <div className="px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>You have active Pro Unlimited Access</span>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ================= LIVE STATS STRIP ================= */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: Layers, label: 'SaaS Tools', value: `${totalToolsCount}+`, color: 'text-indigo-500 dark:text-indigo-400' },
          { icon: Users, label: 'Active Users', value: '100k+', color: 'text-purple-500 dark:text-purple-400' },
          { icon: Cpu, label: 'Average Execution', value: '0.2s', color: 'text-emerald-500 dark:text-emerald-400' },
          { icon: Lock, label: 'Privacy & Security', value: '100% Private', color: 'text-pink-500 dark:text-pink-400' },
        ].map((stat, i) => {
          const StatIcon = stat.icon;
          return (
            <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center gap-3 shadow-sm">
              <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                <StatIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {stat.value}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ================= FEATURED / TRENDING 10 POPULAR TOOLS SHOWCASE ================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>Trending & Top Used</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Top 10 Popular Tools</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                10 Tools
              </span>
            </h2>
          </div>

          <button
            onClick={() => {
              onSelectCategory('all');
              onNavigateView('dashboard');
            }}
            className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View All {totalToolsCount} Tools</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
          {popularTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool)}
              className="group relative bg-white dark:bg-slate-900 hover:bg-indigo-50/40 dark:hover:bg-slate-850 border border-slate-200/90 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    {renderToolIcon(tool.icon, tool.category)}
                  </div>
                  
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {tool.popular && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-extrabold flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        <span>TOP</span>
                      </span>
                    )}
                    {(tool.category === 'ai' || tool.isAi || tool.isPremium) && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-extrabold flex items-center gap-1 uppercase">
                        <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                        <span>PRO API</span>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase">
                      {tool.category}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition flex items-center gap-1 leading-snug">
                    <span className="line-clamp-1">{tool.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500 shrink-0" />
                  <span>{tool.rating || '4.9'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({((tool.usageCount || 1200) / 1000).toFixed(1)}k)</span>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-bold text-[11px] sm:text-xs group-hover:bg-indigo-500 transition shadow-sm">
                  Run Tool
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= BENTO BOX: CATEGORY SUITES ================= */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Structured Suites</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Explore 6 Specialty Suites
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Everything you need for content creation, document workflows, image editing & financial calculation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {toolSuites.map((suite) => {
            const SuiteIcon = suite.icon;
            return (
              <div
                key={suite.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-2xl border ${suite.bgColor}`}>
                      <SuiteIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {suite.count}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-500 transition">
                      {suite.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {suite.description}
                    </p>
                  </div>

                  {/* Sample Tool Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {suite.sampleTools.map((st, i) => (
                      <span key={i} className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                        • {st}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectCategory(suite.id as ToolCategory);
                    onNavigateView('dashboard');
                  }}
                  className="mt-6 w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Explore {suite.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= HOW IT WORKS (3 SIMPLE STEPS) ================= */}
      <section className="bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 border border-indigo-500/20 text-white shadow-xl space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">
            Simple Workflow
          </span>
          <h2 className="text-2xl sm:text-4xl font-black">
            How Super Hub AI Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Get your tasks done in 3 effortless steps with zero learning curve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Select Any Tool',
              desc: 'Choose from 60+ AI generators, PDF mergers, image editors, or calculators.',
              icon: Search,
            },
            {
              step: '02',
              title: 'Type or Upload Data',
              desc: 'Paste your prompt, upload your PDF or image, or enter numbers directly.',
              icon: Zap,
            },
            {
              step: '03',
              title: 'Get Instant Results',
              desc: 'Copy generated AI content, download processed PDFs, or save optimized photos.',
              icon: CheckCircle2,
            },
          ].map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                    <ItemIcon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-indigo-500/40">
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= WHY CHOOSE SUPER HUB AI ================= */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Built for Speed, Privacy & Power
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Why millions of developers, creators, students, and businesses trust our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Gemini 3.6 Flash Intelligence',
              desc: 'State-of-the-art AI model powers your writing, coding, and summarization with extreme speed.',
              icon: Bot,
              color: 'text-purple-500',
            },
            {
              title: 'Client-Side Privacy',
              desc: 'Your PDF & Image files are processed locally in your browser when possible for 100% data privacy.',
              icon: Lock,
              color: 'text-emerald-500',
            },
            {
              title: 'Zero Software Installation',
              desc: 'Access everything from any web browser on Android, iOS, Windows, Mac, or Linux.',
              icon: Globe,
              color: 'text-blue-500',
            },
            {
              title: 'PWA Mobile App Ready',
              desc: 'Install Super Hub AI directly on your phone home screen for instant native app launcher experience.',
              icon: Smartphone,
              color: 'text-pink-500',
            },
            {
              title: '10 Free Requests Daily',
              desc: 'Enjoy generous daily usage credits across all AI tools with no credit card required.',
              icon: Zap,
              color: 'text-amber-500',
            },
            {
              title: 'Community Driven',
              desc: 'Request custom tools and vote on new feature releases directly with our development team.',
              icon: Lightbulb,
              color: 'text-indigo-500',
            },
          ].map((feature, i) => {
            const FIcon = feature.icon;
            return (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2.5">
                <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${feature.color}`}>
                  <FIcon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= COMMUNITY REQUEST & PRO CTA BANNER ================= */}
      <section className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 p-6 sm:p-10 text-slate-950 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/15 text-slate-950 text-xs font-black">
            <Lightbulb className="w-4 h-4 fill-slate-950" />
            <span>Community Tool Hub</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Have a Tool Request or Feature Idea?
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-900/80 leading-relaxed">
            Suggest new AI, PDF, or image utilities and vote on community ideas. Our team adds new tools every week!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenRequestTool}
            className="px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xl transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Request New Tool</span>
          </button>

          {!isPro && (
            <button
              onClick={onOpenUpgrade}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xl transition active:scale-95"
            >
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Upgrade to Pro</span>
            </button>
          )}
        </div>
      </section>

    </div>
  );
};
