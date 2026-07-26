import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Copyright, Lock, Scale, Sparkles } from 'lucide-react';

export type LegalDocType = 'terms' | 'privacy' | 'copyright';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-900 dark:text-slate-100 shadow-2xl relative flex flex-col max-h-[88vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Legal & Governance Center
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Terms of Service, Privacy Policy & Copyright Protection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-100/50 dark:bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('copyright')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'copyright'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Copyright className="w-4 h-4" />
            <span>Copyright & DMCA</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          
          {/* TAB 1: Terms of Service */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-800 dark:text-indigo-300 font-medium">
                <span className="font-bold">Last Updated: July 2026.</span> By accessing or using Super Hub AI, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  1. Acceptance of Terms & Usage
                </h3>
                <p>
                  Super Hub AI provides online utility tools, AI generators, PDF processors, image converters, and text tools free of charge for personal and commercial use. By using our website, you agree not to use the services for any unlawful, illegal, harmful, or fraudulent activities.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  2. User Account & Free Daily Credits
                </h3>
                <p>
                  - Free accounts receive daily AI credit allocations that reset automatically every 24 hours.
                  <br />
                  - Users are responsible for maintaining the security of their login credentials.
                  <br />
                  - Automated scraping, bot exploitation, or flooding of our API endpoints is strictly prohibited and will result in permanent IP bans.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  3. Intellectual Property Rights & Generated Output
                </h3>
                <p>
                  All content generated by users using Super Hub AI tools (e.g., converted files, generated text, compressed images) belongs to the user. Super Hub AI claims zero ownership rights over user-generated outputs.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  4. Service Availability & Disclaimer of Warranties
                </h3>
                <p>
                  Our services are provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for 99.9% uptime and extreme reliability, Super Hub AI does not warrant that services will be completely uninterrupted or error-free.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: Privacy Policy */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Your privacy is 100% protected. We process files locally in your browser whenever possible and never store user documents on our servers.</span>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  1. Information We Collect
                </h3>
                <p>
                  - <strong>Account Data:</strong> Email address and profile name provided during account creation or Google Sign-In.
                  <br />
                  - <strong>Usage Telemetry:</strong> Anonymized usage counts to manage credit limits and prevent spam.
                  <br />
                  - <strong>Uploaded Files:</strong> File processing (PDF merging, image converting, background removal) happens client-side in your browser or in temporary memory. Files are <strong>never saved or indexed</strong> on our persistent databases.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  2. AI Content Security & Third-Party APIs
                </h3>
                <p>
                  AI text and code tools utilize Google Gemini 2.5 APIs. Prompts submitted to AI tools are transmitted securely over SSL encrypted channels and are processed according to Google Enterprise Privacy guidelines. Prompts are not used to train public AI models.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  3. Cookies & Local Storage
                </h3>
                <p>
                  We use browser LocalStorage and essential session cookies to store your UI preferences (dark/light theme, language selection, bookmarked favorite tools) and authentication tokens.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  4. GDPR & CCPA Compliance
                </h3>
                <p>
                  Under European GDPR and California CCPA guidelines, you have the right to request deletion of your account and associated activity history at any time through our support team or admin panel.
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: Copyright & DMCA */}
          {activeTab === 'copyright' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-medium">
                <span className="font-bold">© 2026 Super Hub AI. All Rights Reserved.</span> All platform designs, UI components, branding, logos, and custom codebase are protected under international copyright laws.
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  1. Copyright Notice
                </h3>
                <p>
                  The logo, design assets, website layout, graphics, icon sets, source code, and tool configurations on Super Hub AI (https://superhub.ai) are the exclusive intellectual property of Super Hub AI Team. Unauthorized copying, reproduction, or redistribution of this software is strictly prohibited.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  2. User Content Ownership
                </h3>
                <p>
                  Users retain full copyright and ownership of all files, images, documents, and code generated or converted using Super Hub AI tools. You are free to publish, sell, or distribute your generated output without royalty fees or attribution requirements.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  3. DMCA Takedown & Copyright Infringement Policy
                </h3>
                <p>
                  Super Hub AI respects the intellectual property rights of others. If you believe that your copyrighted work has been infringed upon by any content hosted on or processed through our platform, please send a formal DMCA notice containing:
                  <br />
                  1. Identification of the copyrighted work claimed to have been infringed.
                  <br />
                  2. Exact URL or location of the material.
                  <br />
                  3. Your contact email and electronic signature.
                  <br />
                  Direct DMCA notices to: <strong className="text-indigo-600 dark:text-indigo-400">legal@superhub.ai</strong>
                </p>
              </section>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>SSL Encrypted & GDPR Compliant</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
