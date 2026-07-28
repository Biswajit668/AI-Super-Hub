import React, { useState } from 'react';
import { Smartphone, Check, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import confetti from 'canvas-confetti';

export const MobileNumberModal: React.FC = () => {
  const { profile, setProfile } = useAuth() as any;
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Show if user is logged in but profile does not have a phone number yet
  if (!profile || profile.phoneNumber) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    const fullPhone = `${countryCode} ${cleanPhone}`;
    setError('');
    setLoading(true);

    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, { phoneNumber: fullPhone });
      if (setProfile) {
        setProfile((prev: any) => prev ? { ...prev, phoneNumber: fullPhone } : null);
      }
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error('Error saving mobile number:', err);
      setError('Failed to save mobile number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/10">
            <Smartphone className="w-7 h-7 text-indigo-400" />
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-2">
            Mobile Verification Required
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
            Enter Your Mobile Number
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Welcome to Super Hub AI! To complete your Google signup and secure your account, please enter your mobile number.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Mobile Number</label>
            <div className="flex items-center">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="px-3 py-3 bg-slate-800 border border-slate-700 border-r-0 rounded-l-xl text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="+91">+91 (India)</option>
                <option value="+1">+1 (USA/CA)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+880">+880 (Bangladesh)</option>
                <option value="+971">+971 (UAE)</option>
              </select>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="9876543210"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-r-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Complete Signup</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Your number is kept secure and confidential.</span>
        </div>

      </div>
    </div>
  );
};
