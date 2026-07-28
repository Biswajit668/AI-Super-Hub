import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  CheckCircle, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Target
} from 'lucide-react';
import { ToolItem } from '../types';

interface ToolGuideSectionProps {
  tool: ToolItem;
}

export const ToolGuideSection: React.FC<ToolGuideSectionProps> = ({ tool }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const getCategoryDetails = () => {
    switch (tool.category) {
      case 'ai':
        return {
          summary: `The ${tool.name} tool on Super Hub AI is a cutting-edge artificial intelligence generator powered by Google's Gemini 2.5 architecture. Designed for students, content creators, researchers, and developers, it transforms natural language queries into well-structured text, comprehensive analytical summaries, multi-language translations, and efficient code snippets.`,
          overview: `Using state-of-the-art neural language modeling, ${tool.name} processes context deeply to produce high-precision outputs. All requests are processed securely, ensuring zero data retention and 100% original, copyright-free content generation.`,
          steps: [
            'Type or paste your prompt or query into the input field above.',
            'Customize optional parameter settings such as output tone, format, or language.',
            'Click the "Generate" or "Process" button to start instant AI processing.',
            'Review, copy to clipboard, or export your generated content instantly.'
          ],
          benefits: [
            'Powered by Gemini 2.5 AI engine for maximum accuracy',
            'Privacy focused: No input content is permanently stored on servers',
            'Guaranteed 100% original and plagiarism-free text generation',
            'Fully optimized for mobile, tablet, and desktop web browsers'
          ]
        };

      case 'pdf':
        return {
          summary: `The ${tool.name} tool offers browser-native PDF management, allowing users to merge, split, compress, convert, and edit document files without downloading bulky software like Adobe Acrobat. Powered by high-speed client-side WebAssembly, document processing occurs directly inside your web browser.`,
          overview: `Document privacy is paramount. When using ${tool.name}, your files stay inside your local browser sandbox and are never uploaded to remote server databases, ensuring compliance with strict privacy standards.`,
          steps: [
            'Select your PDF file or drag and drop it directly into the upload area.',
            'Adjust processing configurations (such as page ranges, compression quality, or order).',
            'Click the "Process PDF" button to run the task.',
            'Download your processed, high-quality PDF document instantly.'
          ],
          benefits: [
            'Client-side execution: Files never leave your browser for total privacy',
            'Advanced lossy and lossless compression algorithms',
            'Cross-platform compatibility across all mobile and desktop devices',
            '100% free with no file limit or hidden subscription costs'
          ]
        };

      case 'image':
        return {
          summary: `The ${tool.name} utility provides fast graphic conversion and image editing capabilities directly in your web browser. From compressing high-resolution photos and removing visual backgrounds to converting formats (PNG, JPG, WebP) and cropping dimensions, enjoy intuitive visual workflows.`,
          overview: `Optimized for web designers, digital marketers, and casual users, ${tool.name} delivers crisp visual results while preserving image fidelity and drastically reducing load times for website assets.`,
          steps: [
            'Upload your image file by dragging and dropping or browsing your files.',
            'Select your desired output parameters (dimensions, file format, compression level).',
            'Preview the updated image in real-time to inspect quality.',
            'Click "Download Image" to save the high-resolution file.'
          ],
          benefits: [
            'Clean output without any intrusive watermarks',
            'HD quality preservation with modern WebP and PNG optimization',
            'Instant real-time rendering and client-side processing',
            'Seamless mobile touch controls for easy editing on the go'
          ]
        };

      case 'text':
        return {
          summary: `The ${tool.name} text utility delivers automated string manipulation, case conversions, word counting, markdown previewing, and syntax formatting. Built for copywriters, bloggers, SEO specialists, and software engineers, it eliminates manual editorial tedium.`,
          overview: `Whether preparing blog posts, formatting JSON data, or analyzing text statistics, ${tool.name} provides immediate feedback and real-time execution in a clean, ad-friendly interface.`,
          steps: [
            'Paste or type your raw text into the input field provided.',
            'Select your desired text operation (e.g., Uppercase, Title Case, Clean Spaces).',
            'Observe the live output updated instantly in the preview box.',
            'Click "Copy Text" to copy the formatted output directly to your clipboard.'
          ],
          benefits: [
            'Instant live output rendering as you type or paste',
            'Handles large volumes of paragraph text effortlessly',
            'Reduces time spent on repetitive text formatting tasks',
            'Accessible on all devices without software installation'
          ]
        };

      default: // Utility & Calculator
        return {
          summary: `The ${tool.name} is a high-precision interactive online calculator and utility tool. Built to simplify complex calculations, financial formulas, unit conversions, and operational tasks, it delivers accurate results with clear breakdown displays.`,
          overview: `Engineered with robust mathematical algorithms, ${tool.name} eliminates calculation errors and provides an intuitive tabular view, making technical tasks fast and accessible.`,
          steps: [
            'Enter the required values or parameters into the designated input fields.',
            'Select appropriate units or calculation options if required.',
            'Click the "Calculate" button to view immediate breakdown results.',
            'Copy or export the computed data for your personal or professional use.'
          ],
          benefits: [
            '100% mathematically accurate and verified calculation algorithms',
            'Clean, modern interface designed for ease of use',
            'Fully responsive across smartphones, tablets, and laptops',
            'Completely free with unlimited usage and zero registration barriers'
          ]
        };
    }
  };

  const details = getCategoryDetails();

  const faqs = [
    {
      q: `Is ${tool.name} completely free to use?`,
      a: 'Yes, all tools on Super Hub AI are 100% free for both personal and commercial use with generous daily usage allowances.'
    },
    {
      q: 'Are my files and data secure when using this tool?',
      a: 'Absolutely! Security and user privacy are core priorities. Most processing occurs locally in your browser, and no files or text inputs are stored permanently on server disks.'
    },
    {
      q: 'Can I use this tool on mobile devices?',
      a: 'Yes, Super Hub AI is fully responsive and supports Progressive Web App (PWA) standards, functioning smoothly on Android phones, iPhones, iPads, and desktop computers.'
    }
  ];

  return (
    <div className="w-full mt-8 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-800 dark:text-slate-200 shadow-sm">
      
      {/* Header Badge */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            User Guide & Documentation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Learn how to effectively use {tool.name} step-by-step
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Left Column: About & Overview */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>How {tool.name} Works</span>
            </h4>
            
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {details.summary}
            </p>

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              {details.overview}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>Key Features & Benefits</span>
            </h4>

            <ul className="space-y-2 text-xs">
              {details.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Step-by-Step Instructions & FAQ */}
        <div className="space-y-4">
          
          {/* Steps */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <span>Step-by-Step Instructions</span>
            </h4>

            <ol className="space-y-2 text-xs">
              {details.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Frequently Asked Questions</span>
            </h4>

            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-3 text-left text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center justify-between gap-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                  >
                    <span>{faq.q}</span>
                    {activeFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-indigo-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {activeFaq === idx && (
                    <div className="px-3 pb-3 pt-1 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Copyright-Free Quality Assurance Badge */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Original, Secure & Original Utility Content</span>
        </div>
        <div className="text-indigo-600 dark:text-indigo-400 font-semibold">
          Super Hub AI Quality Standard Verified
        </div>
      </div>

    </div>
  );
};
