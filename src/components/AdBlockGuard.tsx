import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, CheckCircle2, Lock, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdBlockGuardProps {
  children: React.ReactNode;
}

export const AdBlockGuard: React.FC<AdBlockGuardProps> = ({ children }) => {
  const { profile, currentUser, loginWithGoogle } = useAuth();
  const [isAdBlockActive, setIsAdBlockActive] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [checkCount, setCheckCount] = useState<number>(0);

  // PRO or Admin users are exempt from ad blocker restrictions
  const isPro = profile?.plan === 'premium' || profile?.role === 'admin';

  const detectAdBlocker = async (): Promise<boolean> => {
    let adBlockDetected = false;

    // 1. DOM Decoy Test
    const bait = document.createElement('div');
    bait.className = 'adsbygoogle ad-unit ad-zone ad-placement sponsored-ad pub_300x250 textads banner-ad';
    bait.style.position = 'absolute';
    bait.style.left = '-9999px';
    bait.style.top = '-9999px';
    bait.style.height = '1px';
    bait.style.width = '1px';
    bait.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bait);

    // Give browser a frame to apply CSS rule filters from extensions
    await new Promise((res) => setTimeout(res, 50));

    const computedStyle = window.getComputedStyle(bait);
    if (
      bait.offsetHeight === 0 ||
      bait.clientWidth === 0 ||
      computedStyle.display === 'none' ||
      computedStyle.visibility === 'hidden'
    ) {
      adBlockDetected = true;
    }

    if (bait.parentNode) {
      bait.parentNode.removeChild(bait);
    }

    // 2. Network Resource Block Test (PageAd Script / Ad URL)
    if (!adBlockDetected) {
      try {
        const testUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        const request = new Request(testUrl, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
        });
        await fetch(request);
      } catch (err) {
        // Network block by uBlock, AdBlock, Brave Shields, Pi-hole, etc.
        adBlockDetected = true;
      }
    }

    // 3. Double Check with local bait script path simulation
    if (!adBlockDetected) {
      try {
        const scriptUrl = 'https://googleads.g.doubleclick.net/pagead/id';
        const res = await fetch(scriptUrl, { method: 'HEAD', mode: 'no-cors' });
      } catch (e) {
        adBlockDetected = true;
      }
    }

    return adBlockDetected;
  };

  const runDetection = async () => {
    setIsChecking(true);
    const detected = await detectAdBlocker();
    setIsAdBlockActive(detected);
    setIsChecking(false);
  };

  useEffect(() => {
    runDetection();

    // Re-check periodically every 3 seconds
    const interval = setInterval(() => {
      detectAdBlocker().then((detected) => {
        setIsAdBlockActive(detected);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRecheck = async () => {
    setIsChecking(true);
    setCheckCount((prev) => prev + 1);
    const detected = await detectAdBlocker();
    setIsAdBlockActive(detected);
    setIsChecking(false);

    if (!detected) {
      window.location.reload();
    }
  };

  // If PRO member or no ad blocker detected, render children app normally
  if (isPro || (!isAdBlockActive && !isChecking)) {
    return <>{children}</>;
  }

  // If initial checking, render children temporarily or loading overlay
  if (isChecking && !isAdBlockActive) {
    return <>{children}</>;
  }

  // Render full screen AdBlock warning barrier
  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto min-h-screen text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-500/20 to-amber-500/20 border border-red-500/30 flex items-center justify-center mb-4 shadow-lg shadow-red-500/10">
            <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
          </div>

          <span className="text-xs font-extrabold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full mb-3">
            Ad Blocker Detected
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-2">
            Please Disable Your Ad Blocker
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            To access our website, please pause or turn off your browser's <strong className="text-amber-400">Ad Blocker</strong> or <strong className="text-amber-400">Brave Shields</strong> for this site.
          </p>

          <p className="text-xs text-slate-400 leading-relaxed mb-6 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            Super Hub AI provides 100+ free online AI tools, PDF processors, and utilities supported by non-intrusive ads.
          </p>
        </div>

        {/* Step by step guide */}
        <div className="space-y-3 mb-6 bg-slate-950/40 p-4 rounded-2xl border border-slate-800 text-left">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>How to Disable Ad Blocker?</span>
          </h4>

          <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1">
            <li>
              Click on your browser extension icon (uBlock, AdBlock, Brave Shield, etc.) in the top toolbar.
            </li>
            <li>
              Select <strong className="text-amber-300">"Pause on this site"</strong> or <strong className="text-amber-300">"Don't run on pages on this domain"</strong>.
            </li>
            <li>
              Click the <strong className="text-emerald-400">"Check & Refresh Page"</strong> button below.
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRecheck}
            disabled={isChecking}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            <span>{isChecking ? 'Checking Ad Blocker...' : 'Check & Refresh Page'}</span>
          </button>

          {!currentUser && (
            <button
              onClick={async () => {
                try {
                  await loginWithGoogle();
                } catch (e) {
                  console.error(e);
                }
              }}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Are you a PRO member? Sign In to Bypass</span>
            </button>
          )}

          {isAdBlockActive && checkCount > 1 && (
            <p className="text-[11px] text-center text-red-400/90 animate-bounce">
              ⚠️ Ad Blocker is still active. Please disable it and try again.
            </p>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500 flex items-center justify-center gap-2">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span>Super Hub AI Safe & Secure Experience</span>
        </div>

      </div>
    </div>
  );
};
