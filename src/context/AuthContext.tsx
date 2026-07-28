import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, updateDoc, setDoc, collection, addDoc, getDocs, getDoc, query, where, deleteDoc } from 'firebase/firestore';
import { auth, googleProvider, syncUserProfile, getUserFavorites, toggleUserFavorite, submitToolFeedback, recordToolUsage, db, processReferralOnSignup } from '../lib/firebase';
import { UserProfile, LanguageCode, HistoryItem, NotificationItem } from '../types';
import confetti from 'canvas-confetti';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  favorites: string[];
  recentToolIds: string[];
  addRecentTool: (toolId: string) => void;
  toggleFavorite: (toolId: string) => Promise<void>;
  loginWithGoogle: (referralCode?: string) => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  signupWithEmail: (e: string, p: string, name: string, phoneNumber: string, referralCode?: string) => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
  logout: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  useCredit: () => boolean;
  upgradeToPlan: (targetPlan: 'adfree' | 'premium', paymentRef?: string, appliedPromoCode?: string) => Promise<boolean>;
  upgradeToPremium: (promoCode?: string) => Promise<boolean>;
  redeemPromoCode: (code: string) => Promise<{ success: boolean; message: string; discountPercent?: number; applicablePlan?: 'all' | 'adfree' | 'premium'; code?: string }>;
  submitFeedback: (toolId: string, rating: number, comment: string) => Promise<void>;
  installPrompt: any;
  installPwaApp: () => void;
  notifications: NotificationItem[];
  unreadNotifCount: number;
  readNotifIds: string[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotificationItem: (id: string) => void;
  addInAppNotification: (notif: Omit<NotificationItem, 'createdAt'>) => void;
  toastNotif: NotificationItem | null;
  dismissToastNotif: () => void;
  recordHistory: (toolId: string, toolName: string, input: string, output: string) => Promise<void>;
  clearAllHistory: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'light';
  });
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('language') as LanguageCode) || 'en';
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('user_favorites') || '[]');
    } catch {
      return [];
    }
  });
  const [recentToolIds, setRecentToolIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recent_tools') || '[]');
    } catch {
      return [];
    }
  });
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('read_notif_ids') || '[]');
    } catch {
      return [];
    }
  });
  const [toastNotif, setToastNotif] = useState<NotificationItem | null>(null);

  useEffect(() => {
    localStorage.setItem('read_notif_ids', JSON.stringify(readNotifIds));
  }, [readNotifIds]);

  const markNotificationAsRead = (id: string) => {
    if (!readNotifIds.includes(id)) {
      setReadNotifIds(prev => [...prev, id]);
    }
  };

  const markAllNotificationsAsRead = () => {
    const allIds = notifications.map(n => n.id || '').filter(Boolean);
    setReadNotifIds(Array.from(new Set([...readNotifIds, ...allIds])));
  };

  const deleteNotificationItem = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addInAppNotification = (notif: Omit<NotificationItem, 'createdAt'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: notif.id || `notif_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    setToastNotif(newNotif);
  };

  const dismissToastNotif = () => setToastNotif(null);

  const unreadNotifCount = notifications.filter(n => n.id && !readNotifIds.includes(n.id)).length;

  // Listen for dark mode toggle
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Listen for PWA BeforeInstallPrompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Fetch broadcast notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const snap = await getDocs(collection(db, 'notifications'));
        const list: NotificationItem[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationItem));
        setNotifications(list.length > 0 ? list : [
          {
            id: 'welcome',
            title: 'Welcome to Super Hub AI!',
            message: 'Explore 60+ AI, PDF, Image & Utility tools in one sleek dashboard.',
            type: 'info',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'promo-deal',
            title: 'Launch Special: PRO Upgrade Available',
            message: 'Upgrade to PRO for unlimited AI access and 0 ads across all 60+ tools!',
            type: 'promo',
            createdAt: new Date().toISOString(),
          }
        ]);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifs();
  }, []);

  // Daily 8:00 AM Dynamic Morning Message Automation
  useEffect(() => {
    if (loading) return;

    const checkAndSendMorningGreeting = () => {
      const now = new Date();
      const currentHour = now.getHours();

      // Trigger if current time is at or after 8:00 AM
      if (currentHour >= 8) {
        const todayStr = now.toISOString().split('T')[0];
        const userId = profile?.uid || currentUser?.uid || 'guest';
        const storageKey = `morning_greeting_sent_${todayStr}_${userId}`;

        const alreadySent = localStorage.getItem(storageKey);
        if (!alreadySent) {
          const userName = profile?.displayName || currentUser?.displayName || 'Creator';

          // Calculate unique day index to cycle through unique daily greetings
          const startOfYear = new Date(now.getFullYear(), 0, 0);
          const diff = now.getTime() - startOfYear.getTime();
          const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

          const morningMessages = [
            {
              title: `Rise & Shine, ${userName}! ☀️`,
              message: `A brand new day filled with endless possibilities! Try our AI Article Writer to kickstart your morning ideas and boost productivity today.`
            },
            {
              title: `Good Morning, ${userName}! 🚀`,
              message: `Success starts with small daily wins. Convert, compress, or merge your documents effortlessly with our PDF tools today.`
            },
            {
              title: `Happy Morning, ${userName}! 💡`,
              message: `Need fresh inspiration? Ask our AI Chat & Code assistant to brainstorm ideas, write code, or draft emails for you.`
            },
            {
              title: `Great Morning, ${userName}! 🎨`,
              message: `Transform your photos effortlessly! Remove image backgrounds, resize graphics, or generate custom visuals in 1-click.`
            },
            {
              title: `Morning Energy, ${userName}! ⚡`,
              message: `Your daily credits are refilled and ready! Jump straight into your favorite tools and speed up your workflow.`
            },
            {
              title: `Good Morning, ${userName}! 📊`,
              message: `Stay on top of your goals today! Calculate EMI, SIP, or GST returns easily with our smart financial calculators.`
            },
            {
              title: `Rise and Thrive, ${userName}! ✨`,
              message: `Make today count! Turn long articles into quick, actionable summaries using our AI Text Summarizer.`
            },
            {
              title: `Morning Focus, ${userName}! 🎯`,
              message: `Focus on what matters most. Let AI generate your social media captions, blogs, and marketing messages today.`
            },
            {
              title: `Good Morning, ${userName}! 🌟`,
              message: `You are capable of great things today! All 60+ AI & utility tools are unlocked and waiting for you.`
            },
            {
              title: `Fresh Start, ${userName}! ☕`,
              message: `Grab a warm coffee and simplify your workload. Need to add page numbers or watermarks to a PDF? We've got you covered!`
            },
            {
              title: `Awesome Morning, ${userName}! 🔥`,
              message: `Ready to accomplish your tasks? Use our AI Grammar Checker & Rewriter for pristine document formatting today.`
            },
            {
              title: `Good Morning, ${userName}! 🌈`,
              message: `Wishing you a positive and productive day ahead! Check out your Preference Space on the homepage for fast 1-click launches.`
            },
            {
              title: `Productive Morning, ${userName}! 💻`,
              message: `Tackle your to-do list with ease! Convert images to text with OCR or extract data from PDFs in seconds.`
            },
            {
              title: `Morning Sunshine, ${userName}! ☀️`,
              message: `Start your day with clarity and focus. Explore our online notepad, unit converter, and developer tools anytime.`
            }
          ];

          const selectedGreeting = morningMessages[dayOfYear % morningMessages.length];

          addInAppNotification({
            id: `morning_8am_${todayStr}`,
            title: selectedGreeting.title,
            message: selectedGreeting.message,
            type: 'info',
            category: 'system'
          });

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(selectedGreeting.title, {
                body: selectedGreeting.message,
                icon: '/favicon.ico'
              });
            } catch (err) {
              console.error('Error firing morning push notification:', err);
            }
          }

          localStorage.setItem(storageKey, 'true');
        }
      }
    };

    checkAndSendMorningGreeting();
    const interval = setInterval(checkAndSendMorningGreeting, 30000);
    return () => clearInterval(interval);
  }, [loading, profile, currentUser]);

  // Auth State Listener
  useEffect(() => {
    // Capture URL referral param e.g. ?ref=A9X7B2K4
    try {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref') || params.get('referral');
      if (refParam) {
        const cleanRef = refParam.trim().toUpperCase();
        if (cleanRef) {
          localStorage.setItem('superhub_ref_code', cleanRef);
        }
      }
    } catch (e) {
      console.error('Error reading ref param:', e);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const prof = await syncUserProfile(user);
          setProfile(prof);
          const userId = user.uid;
          const remoteFavs = await getUserFavorites(userId);
          const localFavs = JSON.parse(localStorage.getItem(`user_favorites_${userId}`) || localStorage.getItem('user_favorites') || '[]');
          const merged = Array.from(new Set([...remoteFavs, ...localFavs]));
          setFavorites(merged);
          localStorage.setItem(`user_favorites_${userId}`, JSON.stringify(merged));
        } catch (err) {
          console.error('Error syncing profile:', err);
        }
      } else {
        setProfile(null);
        const localFavs = JSON.parse(localStorage.getItem('user_favorites_guest') || localStorage.getItem('user_favorites') || '[]');
        setFavorites(localFavs);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const addRecentTool = (toolId: string) => {
    setRecentToolIds(prev => {
      const filtered = prev.filter(id => id !== toolId);
      const updated = [toolId, ...filtered].slice(0, 10);
      localStorage.setItem('recent_tools', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavorite = async (toolId: string) => {
    const userId = profile?.uid || 'guest';
    const storageKey = `user_favorites_${userId}`;
    setFavorites(prev => {
      const isFav = prev.includes(toolId);
      const updated = isFav ? prev.filter(id => id !== toolId) : [...prev, toolId];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.error('LocalStorage save error:', e);
      }
      return updated;
    });

    if (profile?.uid) {
      try {
        await toggleUserFavorite(profile.uid, toolId, favorites);
      } catch (err) {
        console.error('Error updating favorite in Firestore:', err);
      }
    }
  };

  const loginWithGoogle = async (referralCode?: string) => {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      // Check if user document already existed in Firestore
      const userDocRef = doc(db, 'users', res.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const isNewUser = !userDocSnap.exists();

      const refToUse = referralCode?.trim() || localStorage.getItem('superhub_ref_code') || '';
      if (refToUse && isNewUser) {
        await processReferralOnSignup(res.user.uid, res.user.email || '', refToUse);
      }
      localStorage.removeItem('superhub_ref_code');

      const updatedProf = await syncUserProfile(res.user);
      setProfile(updatedProf);
    }
  };

  const loginWithEmail = async (e: string, p: string) => {
    await signInWithEmailAndPassword(auth, e, p);
  };

  const signupWithEmail = async (e: string, p: string, name: string, phoneNumber: string, referralCode?: string) => {
    const res = await createUserWithEmailAndPassword(auth, e, p);
    if (res.user) {
      if (name) {
        try {
          await updateProfile(res.user, { displayName: name });
        } catch (err) {
          console.error('Error updating Firebase auth profile name:', err);
        }
      }
      await setDoc(doc(db, 'users', res.user.uid), { displayName: name, phoneNumber: phoneNumber.trim() }, { merge: true });

      const refToUse = referralCode?.trim() || localStorage.getItem('superhub_ref_code') || '';
      if (refToUse) {
        await processReferralOnSignup(res.user.uid, res.user.email || '', refToUse);
        localStorage.removeItem('superhub_ref_code');
      }

      const updatedProf = await syncUserProfile(res.user);
      setProfile(updatedProf);
    }
  };

  const resetPassword = async (e: string) => {
    await sendPasswordResetEmail(auth, e);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const useCredit = (): boolean => {
    if (!profile) {
      // Guest mode allowed 3 demo uses per day via local storage check
      const demoCount = Number(localStorage.getItem('guest_usage') || '0');
      if (demoCount >= 5) {
        return false;
      }
      localStorage.setItem('guest_usage', String(demoCount + 1));
      return true;
    }

    if (profile.plan === 'premium' || profile.role === 'admin') {
      return true;
    }

    if (profile.credits <= 0) {
      return false;
    }

    setProfile(prev => prev ? { ...prev, credits: prev.credits - 1, dailyUsage: prev.dailyUsage + 1 } : null);
    return true;
  };

  const upgradeToPlan = async (targetPlan: 'adfree' | 'premium' = 'premium', paymentRef?: string, appliedPromoCode?: string): Promise<boolean> => {
    if (!profile) return false;
    try {
      const userRef = doc(db, 'users', profile.uid);
      const credits = targetPlan === 'premium' ? 99999 : 30;
      await updateDoc(userRef, {
        plan: targetPlan,
        credits: credits,
      });

      await addDoc(collection(db, 'subscriptions'), {
        uid: profile.uid,
        plan: targetPlan,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentRef: paymentRef || 'DIRECT',
        promoCode: appliedPromoCode || 'NONE',
      });

      // If a promo code was used for discount, record usage NOW after successful payment
      if (appliedPromoCode && appliedPromoCode.trim().length > 0) {
        const cleanCode = appliedPromoCode.trim().toUpperCase();
        try {
          const promoRef = collection(db, 'promocodes');
          const q = query(promoRef, where('code', '==', cleanCode));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const promoDoc = querySnap.docs[0];
            const promoData = promoDoc.data();
            const usedBy: string[] = Array.isArray(promoData.usedBy) ? promoData.usedBy : [];
            if (!usedBy.includes(profile.uid)) {
              await updateDoc(doc(db, 'promocodes', promoDoc.id), {
                usedCount: Number(promoData.usedCount || 0) + 1,
                usedBy: [...usedBy, profile.uid]
              });
            }
            if (promoData.firstTimeOnly) {
              await updateDoc(userRef, { hasRedeemedFirstTimeCode: true });
            }
          }
        } catch (e) {
          console.warn('Failed to update promo code usage stats on payment:', e);
        }
      }

      setProfile(prev => prev ? { ...prev, plan: targetPlan, credits: credits } : null);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      return true;
    } catch (err) {
      console.error('Failed to upgrade:', err);
      return false;
    }
  };

  const upgradeToPremium = async (promoCode?: string): Promise<boolean> => {
    return upgradeToPlan('premium', undefined, promoCode);
  };

  const redeemPromoCode = async (code: string): Promise<{ success: boolean; message: string; discountPercent?: number; applicablePlan?: 'all' | 'adfree' | 'premium'; code?: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a valid promo code.' };
    }

    if (!profile) {
      return { success: false, message: 'Please log in to redeem promo codes.' };
    }

    try {
      // Query promocodes collection in Firestore
      const promoRef = collection(db, 'promocodes');
      const q = query(promoRef, where('code', '==', cleanCode));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        return { success: false, message: 'Invalid or expired promo code.' };
      }

      const promoDoc = querySnap.docs[0];
      const promoData = promoDoc.data();
      const promoId = promoDoc.id;

      // Deactivated or active check
      if (promoData.active === false) {
        return { success: false, message: 'This promo code has been deactivated.' };
      }

      // Expiry check
      if (promoData.expiresAt && new Date(promoData.expiresAt).getTime() < Date.now()) {
        return { success: false, message: 'This promo code has expired.' };
      }

      // Max usages check
      const usedCount = Number(promoData.usedCount || 0);
      const maxUses = Number(promoData.maxUses || 100);
      if (usedCount >= maxUses) {
        return { success: false, message: 'This promo code has reached its maximum redemptions limit.' };
      }

      // Check if current user already redeemed
      const usedBy: string[] = Array.isArray(promoData.usedBy) ? promoData.usedBy : [];
      if (usedBy.includes(profile.uid)) {
        return { success: false, message: 'You have already redeemed this promo code.' };
      }

      // First-time signup check
      if (promoData.firstTimeOnly === true) {
        if (profile.hasRedeemedFirstTimeCode) {
          return { success: false, message: 'This promo code is strictly for first-time signups only, and you have already used a first-time code.' };
        }
      }

      // Determine reward plan, discount, or credits
      const targetPlan = promoData.grantPlan || (promoData.grantPro ? 'premium' : 'none');
      const discountPct = Number(promoData.discountPercent || 0);
      const applicablePlan = (promoData.applicablePlan || 'all') as 'all' | 'adfree' | 'premium';

      // Check if this is a percentage discount (e.g. 50% OFF)
      const isPartialDiscount = (targetPlan === 'discount' || discountPct > 0) && discountPct < 100;

      if (isPartialDiscount) {
        // DO NOT update promocodes or user profile yet!
        // The code is active and valid, discount applied to checkout price.
        // It will be marked as used ONLY when payment completes in upgradeToPlan.
        const planText = applicablePlan === 'premium' ? 'PRO Membership' : applicablePlan === 'adfree' ? 'Ad-Free Plan' : 'All Plans';
        return {
          success: true,
          message: `Activated ${discountPct}% OFF Discount for ${planText}! Discounted price applied below. Complete payment to finalize.`,
          discountPercent: discountPct,
          applicablePlan: applicablePlan,
          code: cleanCode
        };
      }

      // Non-discount instant reward (e.g., Free PRO membership, Free Ad-Free, Bonus AI credits, 100% OFF)
      let userUpdates: Partial<UserProfile> = {};
      let successMsg = `Promo code "${cleanCode}" applied! `;

      if (discountPct >= 100) {
        userUpdates = { plan: 'premium', credits: 99999 };
        successMsg += '100% OFF Applied - Upgraded to PRO Membership for FREE!';
      } else if (targetPlan === 'premium') {
        userUpdates = { plan: 'premium', credits: 99999 };
        successMsg += 'Upgraded to PRO Membership (Unlimited Access)!';
      } else if (targetPlan === 'adfree') {
        userUpdates = { plan: 'adfree', credits: Math.max(profile.credits || 0, 30) };
        successMsg += 'Upgraded to Ad-Free & Offline Plan!';
      } else if (promoData.credits && Number(promoData.credits) > 0) {
        const bonus = Number(promoData.credits);
        const newCredits = (profile.credits || 0) + bonus;
        userUpdates = { credits: newCredits };
        successMsg += `Added +${bonus} AI Credits to your account!`;
      } else {
        const newCredits = (profile.credits || 0) + 20;
        userUpdates = { credits: newCredits };
        successMsg += 'Bonus credits added to your account!';
      }

      if (promoData.firstTimeOnly) {
        userUpdates.hasRedeemedFirstTimeCode = true;
      }

      // 1. Update User Profile in Firestore
      if (Object.keys(userUpdates).length > 0) {
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, userUpdates);
        setProfile(prev => prev ? { ...prev, ...userUpdates } : null);
      }

      // 2. Update Promo Code document usage stats immediately ONLY for instant non-payment rewards
      const newUsedBy = [...usedBy, profile.uid];
      const newUsedCount = usedCount + 1;
      await updateDoc(doc(db, 'promocodes', promoId), {
        usedCount: newUsedCount,
        usedBy: newUsedBy
      });

      confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });

      return {
        success: true,
        message: successMsg,
        code: cleanCode
      };
    } catch (err: any) {
      console.error('Error redeeming promo code:', err);
      return { success: false, message: 'Failed to redeem promo code. Please try again.' };
    }
  };

  const submitFeedback = async (toolId: string, rating: number, comment: string) => {
    if (!profile) return;
    await submitToolFeedback(profile.uid, profile.email, toolId, rating, comment);
  };

  const installPwaApp = () => {
    if (installPrompt) {
      installPrompt.prompt();
      setInstallPrompt(null);
    }
  };

  const recordHistory = async (toolId: string, toolName: string, input: string, output: string) => {
    addRecentTool(toolId);
    const userId = profile?.uid || 'guest';
    const storageKey = `user_history_${userId}`;
    const newItem: HistoryItem = {
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      uid: userId,
      toolId,
      toolName,
      input: (input || '').substring(0, 1000),
      output: (output || '').substring(0, 2000),
      timestamp: new Date().toISOString(),
    };

    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem('user_history') || '[]');
      const updated = [newItem, ...stored].slice(0, 50);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save history to localStorage:', e);
    }

    if (profile?.uid) {
      try {
        await recordToolUsage(profile.uid, toolId, toolName, input, output);
      } catch (err) {
        console.error('Failed to sync history to Firestore:', err);
      }
    }
  };

  const clearAllHistory = async () => {
    const userId = profile?.uid || 'guest';
    const storageKey = `user_history_${userId}`;
    localStorage.removeItem(storageKey);
    localStorage.removeItem('user_history');
    if (profile?.uid) {
      try {
        const q = query(collection(db, 'history'), where('uid', '==', profile.uid));
        const snap = await getDocs(q);
        const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      } catch (err) {
        console.error('Failed to clear Firestore history:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      profile,
      loading,
      theme,
      toggleTheme,
      language,
      setLanguage,
      favorites,
      recentToolIds,
      addRecentTool,
      toggleFavorite,
      loginWithGoogle,
      loginWithEmail,
      signupWithEmail,
      resetPassword,
      logout,
      setProfile,
      useCredit,
      upgradeToPlan,
      upgradeToPremium,
      redeemPromoCode,
      submitFeedback,
      installPrompt,
      installPwaApp,
      notifications,
      unreadNotifCount,
      readNotifIds,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotificationItem,
      addInAppNotification,
      toastNotif,
      dismissToastNotif,
      recordHistory,
      clearAllHistory,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
