import React, { useEffect } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NotificationToastProps {
  onSelectView?: (view: string) => void;
  onSelectTool?: (toolId: string) => void;
  onOpenUpgrade?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  onSelectView,
  onSelectTool,
  onOpenUpgrade
}) => {
  const { toastNotif, dismissToastNotif, markNotificationAsRead } = useAuth();

  useEffect(() => {
    if (toastNotif) {
      const timer = setTimeout(() => {
        dismissToastNotif();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toastNotif, dismissToastNotif]);

  if (!toastNotif) return null;

  const handleAction = () => {
    if (toastNotif.id) markNotificationAsRead(toastNotif.id);

    if (toastNotif.actionView && onSelectView) {
      onSelectView(toastNotif.actionView);
    } else if (toastNotif.actionToolId && onSelectTool) {
      onSelectTool(toastNotif.actionToolId);
    } else if (toastNotif.actionUrl === 'upgrade' && onOpenUpgrade) {
      onOpenUpgrade();
    } else if (toastNotif.actionUrl) {
      window.open(toastNotif.actionUrl, '_blank');
    }

    dismissToastNotif();
  };

  return (
    <div className="fixed top-16 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
      <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/40 text-white shadow-2xl flex items-start gap-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />

        <div className="shrink-0 mt-0.5">
          {toastNotif.type === 'promo' ? (
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          ) : toastNotif.type === 'warning' ? (
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : toastNotif.type === 'success' ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-xs font-extrabold text-white">{toastNotif.title}</h4>
          <p className="text-xs text-slate-300 mt-1 leading-snug line-clamp-2">{toastNotif.message}</p>

          {(toastNotif.actionLabel || toastNotif.actionView || toastNotif.actionToolId || toastNotif.actionUrl) && (
            <button
              onClick={handleAction}
              className="mt-2.5 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 transition"
            >
              <span>{toastNotif.actionLabel || 'View'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          onClick={dismissToastNotif}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
