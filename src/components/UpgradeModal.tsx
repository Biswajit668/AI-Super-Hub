import React, { useState } from 'react';
import { X, Crown, Check, Zap, Gift, Copy, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { profile, upgradeToPremium, redeemPromoCode } = useAuth();
  
  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState<{ success?: boolean; message?: string }>({});
  const [loading, setLoading] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!isOpen) return null;

  const isPro = profile?.plan === 'premium' || profile?.role === 'admin';
  const referralLink = `${window.location.origin}/?ref=${profile?.uid || 'guest'}`;

  const handleCheckout = async () => {
    setLoading(true);
    await upgradeToPremium();
    setLoading(false);
    onClose();
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput) return;
    setLoading(true);
    const res = await redeemPromoCode(promoInput);
    setPromoStatus(res);
    setLoading(false);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-slate-100 shadow-2xl relative animate-in fade-in zoom-in duration-200 my-8">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>AI Super Hub PRO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Unlock Unlimited Power & Zero Ads
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Get unlimited AI generations, 60+ PDF, Image & Utility tools, priority execution speed & 24/7 VIP support.
          </p>
        </div>

        {/* Pricing Cards Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          
          {/* Free Plan Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Free Plan</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">$0 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ forever</span></div>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" /> 10 AI Requests per Day</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" /> Standard Generation Speed</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" /> Access to basic PDF & Utility tools</li>
                <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500"><X className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" /> Ad-supported experience</li>
              </ul>
            </div>
            <button
              disabled
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold"
            >
              Current Base Plan
            </button>
          </div>

          {/* PRO Plan Card */}
          <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-gradient-to-b dark:from-amber-500/10 dark:via-indigo-950/40 dark:to-slate-900 border-2 border-amber-500/50 shadow-xl shadow-amber-500/10 relative flex flex-col justify-between">
            <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
              RECOMMENDED
            </span>
            <div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> PRO Membership
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">$9.99 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ month</span></div>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> <strong>Unlimited</strong> AI Generations</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> <strong>0 Ads</strong> Entire Platform</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> Priority Ultra-Fast Gemini Engine</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> Full History & Export Storage</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> PRO Member Badge</li>
              </ul>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || isPro}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition disabled:opacity-50"
            >
              {isPro ? 'Already Activated' : loading ? 'Activating...' : 'Upgrade Now $9.99'}
            </button>
          </div>

        </div>

        {/* Promo Code Redemption */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 mb-4">
          <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 w-full relative">
              <Gift className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Have a promo code? (e.g. WELCOME50)"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs shrink-0 transition"
            >
              Redeem Code
            </button>
          </form>
          {promoStatus.message && (
            <p className={`text-xs mt-2 ${promoStatus.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {promoStatus.message}
            </p>
          )}
        </div>

        {/* Referral System Link */}
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-indigo-700 dark:text-indigo-300">Earn Free Credits via Referral</span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Share your link to get +10 bonus AI credits when friends join!</p>
          </div>
          <button
            onClick={handleCopyRef}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-600/30 hover:bg-indigo-200 dark:hover:bg-indigo-600/50 text-indigo-700 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-500/40 font-semibold flex items-center justify-center gap-2 transition"
          >
            {copiedRef ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRef ? 'Link Copied!' : 'Copy Referral Link'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
