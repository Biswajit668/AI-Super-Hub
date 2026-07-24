import React, { useState } from 'react';
import { X, Crown, Check, Zap, Gift, Copy, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, profile, upgradeToPremium, redeemPromoCode, loginWithGoogle } = useAuth();
  
  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState<{ success?: boolean; message?: string }>({});
  const [loading, setLoading] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPro = profile?.plan === 'premium' || profile?.role === 'admin';
  const referralLink = `${window.location.origin}/?ref=${profile?.uid || 'guest'}`;

  const handleRazorpayCheckout = async () => {
    if (!currentUser) {
      setPaymentError('User login is required to make a payment. Please log in first.');
      try {
        await loginWithGoogle();
      } catch (err) {
        console.error('Login error during checkout:', err);
      }
      return;
    }

    setLoading(true);
    setPaymentError(null);

    try {
      // 1. Create order on server
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 799, currency: 'INR', plan: 'pro' }),
      });

      const orderData = await res.json();

      if (!res.ok || orderData.error) {
        throw new Error(orderData.error || 'Failed to initialize payment order');
      }

      // 2. Load Razorpay SDK script
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error('Razorpay payment gateway script failed to load. Please check your internet connection and try again.');
      }

      const activeKey = orderData.key || 'rzp_live_SITLHOxouCxu1h';

      // 3. Open Razorpay Checkout modal
      const options: any = {
        key: activeKey,
        amount: orderData.amount || 79900,
        currency: orderData.currency || 'INR',
        name: 'AI Super Hub',
        description: 'PRO Membership - Unlimited AI & Tools',
        image: 'https://cdn-icons-png.flaticon.com/512/616/616490.png',
        prefill: {
          name: profile?.displayName || currentUser?.displayName || 'User',
          email: profile?.email || currentUser?.email || 'user@example.com',
        },
        theme: {
          color: '#f59e0b',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setPaymentError('Payment window was closed before completing transaction.');
          },
        },
        handler: async (response: any) => {
          try {
            setLoading(true);
            setPaymentError(null);

            // 4. Secure server-side signature verification
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderData.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.verified) {
              const success = await upgradeToPremium('RAZORPAY_' + (response.razorpay_payment_id || 'SUCCESS'));
              if (success) {
                onClose();
              } else {
                setPaymentError('Payment verified, but activating subscription failed. Please contact support.');
              }
            } else {
              setPaymentError(verifyData.error || 'Payment verification failed. Security mismatch.');
            }
          } catch (err: any) {
            setPaymentError('Payment verification error: ' + err.message);
          } finally {
            setLoading(false);
          }
        },
      };

      if (!orderData.isMock && orderData.id) {
        options.order_id = orderData.id;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setPaymentError('Payment failed: ' + (response.error?.description || 'Transaction declined.'));
        setLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error('Checkout error:', err);
      setPaymentError(err.message || 'Payment initiation failed. Please try again.');
      setLoading(false);
    }
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-slate-900 dark:text-slate-100 shadow-2xl relative flex flex-col my-auto overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Sticky Top Bar for easy closing on mobile scroll */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pb-3 pt-1 -mt-2 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">PRO Membership</span>
          </div>
          <button 
            onClick={onClose} 
            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition flex items-center gap-1 shadow-sm"
            aria-label="Close modal"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Unlock Unlimited Power & Zero Ads
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto">
            Get unlimited AI generations, 60+ PDF, Image & Utility tools, priority execution speed & 24/7 VIP support.
          </p>
        </div>

        {/* Pricing Cards Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          
          {/* Free Plan Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Free Plan</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">$0 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ forever</span></div>
              <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" /> 10 AI Requests per Day</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" /> Standard Generation Speed</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" /> Access to basic PDF & Utility tools</li>
                <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500"><X className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" /> Ad-supported experience</li>
              </ul>
            </div>
            <button
              disabled
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold"
            >
              Current Base Plan
            </button>
          </div>

          {/* PRO Plan Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-gradient-to-b dark:from-amber-500/10 dark:via-indigo-950/40 dark:to-slate-900 border-2 border-amber-500/50 shadow-xl shadow-amber-500/10 relative flex flex-col justify-between">
            <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
              RECOMMENDED
            </span>
            <div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> PRO Membership
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ₹799 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">($9.99) / month</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> <strong>Unlimited</strong> AI Generations</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> <strong>0 Ads</strong> Entire Platform</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> Priority Ultra-Fast Gemini Engine</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> Full History & Export Storage</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> PRO Member Badge</li>
              </ul>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={handleRazorpayCheckout}
                disabled={loading || isPro}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isPro
                    ? 'Already Activated'
                    : loading
                    ? 'Opening Razorpay...'
                    : !currentUser
                    ? 'Login & Pay with Razorpay (₹799)'
                    : 'Pay with Razorpay (₹799)'}
                </span>
              </button>

              <div className="text-center">
                <span className="text-[10px] text-slate-400">Secured by Razorpay • UPI, Cards, NetBanking, Wallets</span>
              </div>
            </div>
          </div>

        </div>

        {paymentError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
            {paymentError}
          </div>
        )}

        {/* Promo Code Redemption */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 mb-4">
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
        <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mb-4">
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

        {/* Bottom Explicit Dismiss Button */}
        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800/60">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition shadow-sm"
          >
            Continue with Free Plan
          </button>
        </div>

      </div>
    </div>
  );
};
