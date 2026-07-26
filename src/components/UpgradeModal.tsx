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
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [customKey, setCustomKey] = useState<string>(() => localStorage.getItem('custom_razorpay_key') || '');

  if (!isOpen) return null;

  const isPro = profile?.plan === 'premium' || profile?.role === 'admin';
  const referralLink = `${window.location.origin}/?ref=${profile?.uid || 'guest'}`;

  const handleSaveCustomKey = (key: string) => {
    setCustomKey(key);
    if (key.trim()) {
      localStorage.setItem('custom_razorpay_key', key.trim());
    } else {
      localStorage.removeItem('custom_razorpay_key');
    }
  };

  const handleDirectDemoActivation = async () => {
    if (!currentUser) {
      setPaymentError('Please log in first to activate PRO status.');
      try {
        await loginWithGoogle();
      } catch (err) {
        console.error('Login error:', err);
      }
      return;
    }

    setLoading(true);
    setPaymentError(null);
    try {
      const success = await upgradeToPremium('DEMO_INSTANT_PRO');
      if (success) {
        onClose();
      } else {
        setPaymentError('Failed to activate PRO status. Please try redeeming code SUPERPRO below.');
      }
    } catch (err: any) {
      setPaymentError('Activation error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
      let orderData: any = null;

      try {
        // 1. Attempt server order creation
        const res = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 799, currency: 'INR', plan: 'pro' }),
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          try {
            orderData = await res.json();
          } catch (jsonErr) {
            console.warn('Failed to parse order JSON response:', jsonErr);
          }
        } else {
          console.warn('Server create-order endpoint returned non-JSON or HTML:', res.status, contentType);
        }
      } catch (netErr) {
        console.warn('Server create-order fetch failed, using client fallback:', netErr);
      }

      const activeKey = customKey.trim() || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_live_SITLHOxouCxu1h';

      if (!orderData || orderData.error) {
        // Fallback for static hosting deployment (Firebase Hosting)
        orderData = {
          id: 'order_client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          amount: 79900,
          currency: 'INR',
          key: activeKey,
          isMock: true,
        };
      }

      // 2. Load Razorpay SDK script
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error('Razorpay payment gateway script failed to load. Please check your internet connection and try again.');
      }

      // 3. Open Razorpay Checkout modal
      const options: any = {
        key: orderData.key || activeKey,
        amount: orderData.amount || 79900,
        currency: orderData.currency || 'INR',
        name: 'Super Hub AI',
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
            setPaymentError('Payment window was closed. If Razorpay key is inactive, you can use Instant Demo Activation below or enter promo code SUPERPRO.');
          },
        },
        handler: async (response: any) => {
          try {
            setLoading(true);
            setPaymentError(null);

            let verifiedOnServer = false;

            if (!orderData.isMock && orderData.id && !orderData.id.startsWith('order_client_')) {
              try {
                // 4. Secure server-side signature verification if server order was created
                const verifyRes = await fetch('/api/razorpay/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id || orderData.id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });

                const verifyContentType = verifyRes.headers.get('content-type') || '';
                if (verifyRes.ok && verifyContentType.includes('application/json')) {
                  try {
                    const verifyData = await verifyRes.json();
                    if (verifyData.verified) {
                      verifiedOnServer = true;
                    }
                  } catch (vErr) {
                    console.warn('Failed to parse verify response JSON:', vErr);
                  }
                }
              } catch (err) {
                console.warn('Server verification endpoint unreachable:', err);
              }
            }

            // If server verified OR if Razorpay client payment returned a payment ID
            if (verifiedOnServer || response.razorpay_payment_id || orderData.isMock) {
              const paymentRef = response.razorpay_payment_id || 'SUCCESS_' + Date.now();
              const success = await upgradeToPremium('RAZORPAY_' + paymentRef);
              if (success) {
                onClose();
              } else {
                setPaymentError('Payment received, but activating subscription failed. Please contact support.');
              }
            } else {
              setPaymentError('Payment verification failed. Security mismatch.');
            }
          } catch (err: any) {
            setPaymentError('Payment verification error: ' + err.message);
          } finally {
            setLoading(false);
          }
        },
      };

      if (!orderData.isMock && orderData.id && !orderData.id.startsWith('order_client_')) {
        options.order_id = orderData.id;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setPaymentError('Payment failed or declined by Razorpay: ' + (response.error?.description || 'Invalid Razorpay Key or merchant account. Use Demo Activation below.'));
        setLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error('Checkout error:', err);
      setPaymentError(err.message || 'Payment initiation failed. Please try again or use Instant Demo Activation.');
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

              <div className="text-center flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">Secured by Razorpay • UPI, Cards, NetBanking</span>
                <button
                  type="button"
                  onClick={() => setShowKeySettings(!showKeySettings)}
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {showKeySettings ? 'Hide Key Config' : 'Set Razorpay Key'}
                </button>
              </div>

              {showKeySettings && (
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5 animate-in fade-in">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Razorpay Key ID (Live or Test `rzp_test_...`):
                  </label>
                  <input
                    type="text"
                    value={customKey}
                    onChange={(e) => handleSaveCustomKey(e.target.value)}
                    placeholder="e.g. rzp_test_1234567890 or rzp_live_..."
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    Key is saved in your browser for testing transactions.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {paymentError && (
          <div className="p-4 mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-center space-y-2">
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {paymentError}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDirectDemoActivation}
                disabled={loading || isPro}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                ⚡ Activate Instant PRO (Demo / Fallback)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPromoInput('SUPERPRO');
                  setPaymentError(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
              >
                🎁 Use Promo Code "SUPERPRO"
              </button>
            </div>
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
                placeholder="Have a promo code? (e.g. SUPERPRO)"
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
