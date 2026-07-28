import React, { useState } from 'react';
import { Crown, X, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../lib/translations';

interface AdBannerProps {
  onOpenUpgrade: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ onOpenUpgrade }) => {
  const { profile, language } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const t = translations[language] || translations.en;

  if (profile?.plan === 'premium' || profile?.plan === 'adfree' || profile?.role === 'admin' || dismissed) {
    return null;
  }

  return (
    <div className="w-full my-6 p-4 rounded-2xl bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 border border-indigo-200 dark:border-indigo-500/30 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
      <button 
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        title="Dismiss ad"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 dark:border-amber-500/30 flex items-center justify-center shrink-0">
          <Megaphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Google AdSense / Sponsor
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{t.adTitle}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">{t.adDesc}</p>
        </div>
      </div>

      <button
        onClick={onOpenUpgrade}
        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
      >
        <Crown className="w-4 h-4" />
        <span>Remove Ads (PRO)</span>
      </button>
    </div>
  );
};
