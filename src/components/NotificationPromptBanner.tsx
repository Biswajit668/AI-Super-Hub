import React, { useState, useEffect } from 'react';
import { Bell, BellRing, X, Sparkles, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotificationPromptBanner: React.FC = () => {
  const { addInAppNotification } = useAuth();
  const [permissionState, setPermissionState] = useState<string>('granted');
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
      const isDismissed = sessionStorage.getItem('notif_banner_dismissed') === 'true';
      setDismissed(isDismissed);
    } else {
      setPermissionState('unsupported');
    }
  }, []);

  if (permissionState !== 'default' || dismissed) {
    return null;
  }

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    try {
      const result = await Notification.requestPermission();
      setPermissionState(result);

      if (result === 'granted') {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);

        // Native browser test push
        new Notification('🎉 Super Hub AI Notifications Active!', {
          body: 'You will now get instant alerts for new tools, free credit giveaways, and system updates.',
          icon: '/favicon.ico'
        });

        // Add to in-app notification center
        addInAppNotification({
          title: 'Notifications Enabled Successfully!',
          message: 'You are now set to receive live notifications for new AI features, daily credit refills, and promo codes.',
          type: 'success',
          category: 'system'
        });
      } else if (result === 'denied') {
        alert('Notifications were blocked. If you change your mind later, you can enable them by clicking the lock icon next to the URL in your browser address bar.');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('notif_banner_dismissed', 'true');
  };

  return (
    <>
      {/* Floating Permission Alert Card */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 max-w-sm w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-5 duration-300">
        <div className="p-4 rounded-3xl bg-slate-900 border-2 border-indigo-500/80 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 shrink-0">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>

            <div className="space-y-1.5 pr-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wide text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Live Updates
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-white leading-tight">
                Turn On Live Notifications!
              </h4>

              <p className="text-xs text-indigo-100/80 leading-relaxed">
                Get instant alerts for new AI tools, free credit giveaways, and system updates.
              </p>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleRequestPermission}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/30 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Turn On Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner when Granted */}
      {showSuccessToast && (
        <div className="fixed top-16 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 rounded-2xl bg-emerald-900/90 border border-emerald-500/50 text-white shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h5 className="font-extrabold text-xs">Notifications Enabled! 🎉</h5>
              <p className="text-[11px] text-emerald-200">You will now get live alerts for tools & rewards.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
