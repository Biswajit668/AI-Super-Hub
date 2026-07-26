import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  FileText, 
  Copyright, 
  Heart, 
  Lightbulb, 
  Globe, 
  CheckCircle2, 
  Zap,
  Star
} from 'lucide-react';
import { LegalDocType } from './LegalModal';

interface FooterProps {
  onOpenLegal: (tab: LegalDocType) => void;
  onOpenRequestTool: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onOpenRequestTool,
  onSelectCategory,
}) => {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 mt-16 transition-colors">
      
      {/* Top Banner Feature Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
          
          <div className="flex items-center justify-center sm:justify-start gap-3 p-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">100% Private & Secure</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Browser-based file processing</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 p-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Powered by Gemini 2.5</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Ultra-fast AI generation</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 p-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">100+ Free Online Tools</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">No installation required</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 p-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">SEO & Mobile Optimized</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Fast on all devices</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Brand Info (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
              Super Hub <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-2">
            Super Hub AI is an all-in-one suite of free online AI tools, PDF utilities, image editors, format converters, text formatters, and smart calculators. Fast, secure, and powered by next-generation Google Gemini AI technology.
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenRequestTool}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-xs transition"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Request New Tool or Feature</span>
            </button>
          </div>
        </div>

        {/* Quick Tool Categories (4 cols) */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Tool Categories
          </h4>
          <ul className="grid grid-cols-2 gap-2 text-xs">
            <li>
              <button 
                onClick={() => onSelectCategory('ai')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                AI Generators & Writers
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectCategory('pdf')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                PDF Mergers & Tools
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectCategory('image')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Image Editors & Converters
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectCategory('text')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Text Formatters & OCR
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectCategory('calculator')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Calculators & Finance
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectCategory('utility')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Smart Utility Suite
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Governance (3 cols) */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Legal & Governance
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => onOpenLegal('terms')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Terms of Service</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenLegal('privacy')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Privacy Policy</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenLegal('copyright')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5"
              >
                <Copyright className="w-3.5 h-3.5 text-slate-400" />
                <span>Copyright & DMCA Notice</span>
              </button>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          
          <div className="flex items-center gap-1.5 font-medium">
            <Copyright className="w-3.5 h-3.5 text-slate-400" />
            <span>2026 Super Hub AI. All Rights Reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button 
              onClick={() => onOpenLegal('terms')} 
              className="hover:underline hover:text-slate-800 dark:hover:text-slate-200"
            >
              Terms
            </button>
            <span>•</span>
            <button 
              onClick={() => onOpenLegal('privacy')} 
              className="hover:underline hover:text-slate-800 dark:hover:text-slate-200"
            >
              Privacy
            </button>
            <span>•</span>
            <button 
              onClick={() => onOpenLegal('copyright')} 
              className="hover:underline hover:text-slate-800 dark:hover:text-slate-200"
            >
              Copyright Policy
            </button>
          </div>

        </div>
      </div>

    </footer>
  );
};
