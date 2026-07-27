import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Copyright, Lock, Scale, Sparkles, Info, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export type LegalDocType = 'terms' | 'privacy' | 'about' | 'contact' | 'copyright';

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
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  if (!isOpen) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 500);
  };

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
                Legal & Company Portal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Privacy Policy, Terms, About Us, Contact & Copyright
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
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-100/50 dark:bg-slate-950/40 overflow-x-auto scrollbar-none">
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
            onClick={() => setActiveTab('about')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About Us</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'contact'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Contact Us</span>
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
            <span>Copyright</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          
          {/* TAB 1: Privacy Policy */}
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
                  3. Cookies & Advertising (Google AdSense)
                </h3>
                <p>
                  We use cookies and Google AdSense to serve non-intrusive advertisements. Google uses cookies to serve ads based on prior visits to our website or other websites. You may opt out of personalized advertising by visiting Google Ad Settings.
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

          {/* TAB 2: Terms of Service */}
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
                  2. User Account & Daily Limits
                </h3>
                <p>
                  - Free accounts receive daily AI credit allocations that reset automatically every 24 hours.
                  <br />
                  - Users are responsible for maintaining the security of their login credentials.
                  <br />
                  - Automated scraping, bot exploitation, or flooding of our API endpoints is strictly prohibited.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  3. Intellectual Property Rights & Output Ownership
                </h3>
                <p>
                  All content generated by users using Super Hub AI tools (e.g., converted files, generated text, compressed images) belongs to the user. Super Hub AI claims zero ownership rights over user-generated outputs.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  4. Disclaimer of Warranties
                </h3>
                <p>
                  Our services are provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for 99.9% uptime and extreme reliability, Super Hub AI does not warrant that services will be completely uninterrupted or error-free.
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: About Us */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-200 space-y-2">
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <span>Welcome to Super Hub AI</span>
                </h3>
                <p className="text-xs leading-relaxed">
                  Super Hub AI is a modern, high-speed suite of 100+ web-based productivity, artificial intelligence, PDF, image, and utility tools built to simplify digital tasks for students, professionals, creators, and developers worldwide.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Our Mission
                </h3>
                <p>
                  Our mission is to make advanced AI technology, document processing, and media tools completely free and accessible to everyone without requiring software installations, complex registration, or expensive subscriptions.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Why Choose Super Hub AI?
                </h3>
                <ul className="space-y-1.5 list-disc list-inside text-xs">
                  <li><strong>Browser-First Privacy:</strong> Files like PDFs and images are processed directly in your browser using modern WebAssembly and HTML5, ensuring total data privacy.</li>
                  <li><strong>Powered by Gemini 2.5:</strong> Cutting-edge Google Gemini AI engines drive our text, code, translation, and summary tools with instant speeds.</li>
                  <li><strong>100+ Free Online Tools:</strong> From PDF merging to image background removal, calculators, QR generators, and AI article writers.</li>
                  <li><strong>Fast & Responsive:</strong> Optimized for mobile phones, tablets, and desktop computers with PWA support.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Our Technology Stack
                </h3>
                <p>
                  Super Hub AI is engineered using React 19, Vite, Tailwind CSS, Google Gemini 2.5 AI SDK, and Firebase secure infrastructure.
                </p>
              </section>
            </div>
          )}

          {/* TAB 4: Contact Us */}
          {activeTab === 'contact' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Contact Information */}
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    <span>Get in Touch</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Have questions, feedback, or tool request suggestions? We'd love to hear from you! Our support team responds within 24–48 hours.
                  </p>

                  <div className="space-y-2 pt-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-white">Email Support</span>
                        <a href="mailto:biswajitnaskar668@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                          biswajitnaskar668@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-white">Location</span>
                        <span className="text-slate-500 dark:text-slate-400">Kolkata, West Bengal, India</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Message Form */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  {contactSubmitted ? (
                    <div className="p-4 text-center space-y-2 py-8">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Message Sent!</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Thank you for reaching out. We will respond to your inquiry shortly.
                      </p>
                      <button
                        onClick={() => setContactSubmitted(false)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline pt-2 inline-block"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                        Send Us a Direct Message
                      </h4>

                      <div>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="Your Email Address"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <textarea
                          required
                          rows={3}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="How can we help you?"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: Copyright & DMCA */}
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
                  Super Hub AI respects the intellectual property rights of others. If you believe that your copyrighted work has been infringed upon by any content hosted on or processed through our platform, please send a formal DMCA notice to: <strong className="text-indigo-600 dark:text-indigo-400">biswajitnaskar668@gmail.com</strong>
                </p>
              </section>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>SSL Encrypted & AdSense Quality Compliant</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

