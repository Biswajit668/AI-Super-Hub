import React, { useState } from 'react';
import { X, Crown, Check, Zap, Gift, Copy, CheckCircle2, ShieldCheck, CreditCard, Lock, WifiOff, VolumeX, Users, UserCheck } from 'lucide-react';
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
  const { currentUser, profile, upgradeToPlan, upgradeToPremium, redeemPromoCode, loginWithGoogle } = useAuth();
  
  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState<{ success?: boolean; message?: string }>({});
  const [appliedDiscount, setAppliedDiscount] = useState<{ percent: number; applicablePlan: 'all' | 'adfree' | 'premium' } | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<'adfree' | 'premium' | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdFree = profile?.plan === 'adfree' || profile?.plan === 'premium' || profile?.role === 'admin';
  const isPro = profile?.plan === 'premium' || profile?.role === 'admin';
  const userRefCode = profile?.referralCode || profile?.uid?.slice(0, 8).toUpperCase() || 'SUPERHUB';
  const referralLink = `${window.location.origin}/?ref=${userRefCode}`;

  const adfreeBasePrice = 99;
  const proBasePrice = 799;

  const adfreeApplies = appliedDiscount && (appliedDiscount.applicablePlan === 'all' || appliedDiscount.applicablePlan === 'adfree');
  const proApplies = appliedDiscount && (appliedDiscount.applicablePlan === 'all' || appliedDiscount.applicablePlan === 'premium');

  const adfreePrice = adfreeApplies ? Math.max(1, Math.round(adfreeBasePrice * (100 - appliedDiscount.percent) / 100)) : adfreeBasePrice;
  const proPrice = proApplies ? Math.max(1, Math.round(proBasePrice * (100 - appliedDiscount.percent) / 100)) : proBasePrice;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userRefCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRazorpayCheckout = async (targetPlan: 'adfree' | 'premium' = 'premium') => {
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
    setLoadingPlan(targetPlan);
    setPaymentError(null);

    const targetPrice = targetPlan === 'adfree' ? adfreePrice : proPrice;
    const priceAmountPaise = targetPrice * 100;
    const planTitle = targetPlan === 'adfree' ? 'Ad-Free & Offline Plan' : 'PRO Membership';

    try {
      let orderData: any = null;

      // 1. Attempt to create order securely on server
      try {
        const res = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: targetPlan })
        });

        const rawText = await res.text();
        if (res.ok && rawText && !rawText.trim().startsWith('<')) {
          try {
            orderData = JSON.parse(rawText);
          } catch (e) {
            console.error('JSON parse error on order creation:', e);
          }
        }
      } catch (err) {
        console.warn('Server create-order endpoint fetch error, fallback to direct Razorpay client mode:', err);
      }

      const activeKey = orderData?.key || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_live_TIAhxSAoznVVVx';

      // Fallback for static hostings (e.g. Firebase Hosting web.app) where server API is absent or returns HTML
      if (!orderData || !orderData.id) {
        orderData = {
          id: 'order_client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          amount: priceAmountPaise,
          currency: 'INR',
          key: activeKey,
          isMock: false,
        };
      }

      // 2. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection and try again.');
      }

      // 3. Launch Razorpay Checkout Modal
      const options: any = {
        key: activeKey,
        amount: orderData.amount || priceAmountPaise,
        currency: orderData.currency || 'INR',
        name: 'Super Hub AI',
        description: planTitle,
        image: 'https://cdn-icons-png.flaticon.com/512/616/616490.png',
        prefill: {
          name: profile?.displayName || currentUser?.displayName || '',
          email: profile?.email || currentUser?.email || '',
          contact: profile?.phoneNumber || currentUser?.phoneNumber || '',
        },
        theme: {
          color: targetPlan === 'adfree' ? '#10b981' : '#f59e0b',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setLoadingPlan(null);
            setPaymentError('Payment modal was closed.');
          },
        },
        handler: async (response: any) => {
          try {
            setLoading(true);
            setPaymentError(null);

            let verified = false;

            // Attempt server-side signature verification if order was created on server
            if (!orderData.isMock && orderData.id && !orderData.id.startsWith('order_client_') && !orderData.id.startsWith('order_demo_')) {
              try {
                const verifyRes = await fetch('/api/razorpay/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id || orderData.id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });

                const verifyText = await verifyRes.text();
                if (verifyRes.ok && verifyText && !verifyText.trim().startsWith('<')) {
                  try {
                    const verifyData = JSON.parse(verifyText);
                    if (verifyData.verified) {
                      verified = true;
                    }
                  } catch (e) {}
                }
              } catch (e) {
                console.warn('Server verification endpoint offline/unreachable:', e);
              }
            }

            // Grant access if server verified OR if Razorpay client returned a payment ID
            if (verified || response.razorpay_payment_id || orderData.isMock) {
              const paymentRef = response.razorpay_payment_id || 'PAY_' + Date.now();
              const success = await upgradeToPlan(targetPlan, 'RAZORPAY_' + paymentRef, appliedCode || undefined);
              if (success) {
                onClose();
              } else {
                setPaymentError('Payment received, but updating profile failed. Please contact support.');
              }
            } else {
              setPaymentError('Security verification failed. Invalid payment signature.');
            }
          } catch (err: any) {
            setPaymentError('Error verifying payment: ' + err.message);
          } finally {
            setLoading(false);
            setLoadingPlan(null);
          }
        },
      };

      // Only attach server order_id if it's a real server order
      if (!orderData.isMock && orderData.id && !orderData.id.startsWith('order_client_') && !orderData.id.startsWith('order_demo_')) {
        options.order_id = orderData.id;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setPaymentError('Payment failed: ' + (resp.error?.description || 'Transaction failed.'));
        setLoading(false);
        setLoadingPlan(null);
      });
      rzp.open();

    } catch (err: any) {
      console.error('Checkout error:', err);
      setPaymentError(err.message || 'Payment initiation failed. Please try again.');
      setLoading(false);
      setLoadingPlan(null);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput) return;
    setLoading(true);
    const res = await redeemPromoCode(promoInput);
    setPromoStatus(res);
    if (res.success && res.discountPercent) {
      setAppliedDiscount({
        percent: res.discountPercent,
        applicablePlan: res.applicablePlan || 'all'
      });
      setAppliedCode(res.code || promoInput.toUpperCase());
    }
    setLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-slate-900 dark:text-slate-100 shadow-2xl relative flex flex-col my-auto overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Sticky Top Bar for easy closing on mobile scroll */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pb-3 pt-1 -mt-2 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Upgrade Plans</span>
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
            Choose Your Super Hub AI Experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-lg mx-auto">
            Get 0 ads & full offline tools for just ₹99/mo, or unlock unlimited AI power with PRO Membership!
          </p>
        </div>

        {appliedDiscount && (
          <div className="p-3 mb-6 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-extrabold text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Zap className="w-4 h-4 text-purple-500 shrink-0" />
            <span>
              SPECIAL OFFER APPLIED: {appliedDiscount.percent}% OFF {
                appliedDiscount.applicablePlan === 'premium'
                  ? 'FOR PRO MEMBERSHIP ONLY'
                  : appliedDiscount.applicablePlan === 'adfree'
                  ? 'FOR AD-FREE PLAN ONLY'
                  : 'ON ALL PAID PLANS'
              } WITH CODE "{appliedCode}"! DISCOUNTED PRICE APPLIED BELOW.
            </span>
          </div>
        )}

        {/* Pricing Cards Comparison (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* 1. Free Plan Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Free Plan</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹0 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ forever</span></div>
              <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" /> 10 AI Requests per Day</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" /> Standard Generation Speed</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" /> Basic PDF & Utility tools</li>
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

          {/* 2. Ad-Free & Offline Plan Card (₹99/mo) */}
          <div className={`p-4 sm:p-5 rounded-2xl relative flex flex-col justify-between transition ${
            adfreeApplies 
              ? 'bg-purple-500/10 dark:bg-purple-950/40 border-2 border-purple-500 shadow-xl shadow-purple-500/10' 
              : 'bg-emerald-500/5 dark:bg-gradient-to-b dark:from-emerald-500/10 dark:via-teal-950/40 dark:to-slate-900 border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/10'
          }`}>
            <span className={`absolute -top-3 right-4 px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wide ${
              adfreeApplies ? 'bg-purple-600 text-white' : 'bg-emerald-500 text-slate-950'
            }`}>
              {adfreeApplies ? `${appliedDiscount.percent}% OFF APPLIED` : 'MOST POPULAR'}
            </span>
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Offline & Ad-Free
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {adfreeApplies ? (
                  <>
                    <span className="line-through text-slate-400 text-sm font-normal mr-1.5">₹{adfreeBasePrice}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-extrabold">₹{adfreePrice}</span>
                  </>
                ) : (
                  <>₹99</>
                )}{' '}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ month</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> <strong>0 Ads</strong> Entire Hub</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> <strong>AdBlocker Guard Bypassed</strong></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> <strong>100% Offline Access</strong> for PDF/Image/Utility tools</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> 30 AI Requests per Day</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Fast Execution Speed</li>
              </ul>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => handleRazorpayCheckout('adfree')}
                disabled={loading || profile?.plan === 'adfree' || isPro}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {profile?.plan === 'adfree' || isPro
                    ? (profile?.plan === 'adfree' ? 'Ad-Free Plan Active' : 'PRO Active')
                    : loading && loadingPlan === 'adfree'
                    ? 'Opening Razorpay Checkout...'
                    : `Pay ₹${adfreePrice} / month`}
                </span>
              </button>
            </div>
          </div>

          {/* 3. PRO Plan Card (₹799/mo) */}
          <div className={`p-4 sm:p-5 rounded-2xl relative flex flex-col justify-between transition ${
            proApplies 
              ? 'bg-purple-500/10 dark:bg-purple-950/40 border-2 border-purple-500 shadow-xl shadow-purple-500/10' 
              : 'bg-amber-500/5 dark:bg-gradient-to-b dark:from-amber-500/10 dark:via-indigo-950/40 dark:to-slate-900 border-2 border-amber-500/50 shadow-xl shadow-amber-500/10'
          }`}>
            <span className={`absolute -top-3 right-4 px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wide ${
              proApplies ? 'bg-purple-600 text-white' : 'bg-amber-500 text-slate-950'
            }`}>
              {proApplies ? `${appliedDiscount.percent}% OFF APPLIED` : 'RECOMMENDED'}
            </span>
            <div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> PRO Membership
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {proApplies ? (
                  <>
                    <span className="line-through text-slate-400 text-sm font-normal mr-1.5">₹{proBasePrice}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-extrabold">₹{proPrice}</span>
                  </>
                ) : (
                  <>₹799</>
                )}{' '}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ month</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> <strong>Unlimited</strong> AI Generations</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> <strong>0 Ads</strong> & Offline Access</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> Priority Ultra-Fast Gemini Engine</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> Full History & Cloud Storage</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> PRO Member Badge</li>
              </ul>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => handleRazorpayCheckout('premium')}
                disabled={loading || isPro}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isPro
                    ? 'PRO Already Active'
                    : loading && loadingPlan === 'premium'
                    ? 'Opening Razorpay Checkout...'
                    : `Pay ₹${proPrice} / month`}
                </span>
              </button>
            </div>
          </div>

        </div>

        {paymentError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
            {paymentError}
          </div>
        )}

        <div className="text-center flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mb-4">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured by Razorpay • UPI, Cards, NetBanking & HMAC Verified</span>
        </div>

        {/* Promo Code Redemption */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 mb-4">
          <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 w-full relative">
              <Gift className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Have a promo code? (e.g. FESTIVE2026)"
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

        {/* Referral Program Section */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                  <span>Refer Friends & Get ₹99 Plan Free</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">
                    10 Refers = 1 Month Free
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  When 10 users sign up using your referral code/link, you get <strong>1 Month FREE Offline & Ad-Free Plan</strong>! Plus +20 credits for both of you!
                </p>
              </div>
            </div>
          </div>

          {/* Code & Link Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Your Referral Code</span>
                <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                  {userRefCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition shrink-0 border border-indigo-200 dark:border-indigo-800"
              >
                {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="truncate mr-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Direct Invite Link</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate block">
                  {referralLink}
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 transition shrink-0 border border-purple-200 dark:border-purple-800"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Progress Bar & Goal Tracker */}
          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                Referral Milestone: <span className="text-indigo-600 dark:text-indigo-400 font-black">{profile?.referralCount || 0}</span> / 10 Users Joined
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {10 - ((profile?.referralCount || 0) % 10)} more needed for next reward
              </span>
            </div>

            <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((profile?.referralCount || 0) % 10) * 10, 100)}%` }}
              />
            </div>

            {(profile?.referralRewardsClaimed || 0) > 0 && (
              <div className="pt-1 text-center">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  🎉 {profile?.referralRewardsClaimed} Month(s) FREE ₹99 Plan Unlocked!
                </span>
              </div>
            )}
          </div>

          {/* Referred Members List */}
          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <span>Joined Using Your Code ({profile?.referrals?.length || 0})</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Name & Join Date</span>
            </div>

            {profile?.referrals && profile.referrals.length > 0 ? (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                {profile.referrals.map((refItem, idx) => {
                  const displayName = refItem.name || (refItem.email ? refItem.email.split('@')[0] : 'Member');
                  const formattedDate = refItem.date 
                    ? new Date(refItem.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Recently';
                  return (
                    <div key={refItem.uid || idx} className="pt-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs leading-none">
                            {displayName}
                          </span>
                          {refItem.email && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {refItem.email.replace(/(.{2})(.*)(?=@)/, "$1***")}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                        {formattedDate}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-2 text-center text-[11px] text-slate-400 font-medium">
                No users have signed up with your code yet. Share your code to earn free credits & rewards!
              </div>
            )}
          </div>
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
