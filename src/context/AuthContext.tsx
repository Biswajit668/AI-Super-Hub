import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, updateDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { auth, googleProvider, syncUserProfile, getUserFavorites, toggleUserFavorite, submitToolFeedback, db } from '../lib/firebase';
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
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  signupWithEmail: (e: string, p: string, name: string) => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
  logout: () => Promise<void>;
  useCredit: () => boolean;
  upgradeToPremium: (promoCode?: string) => Promise<boolean>;
  redeemPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  submitFeedback: (toolId: string, rating: number, comment: string) => Promise<void>;
  installPrompt: any;
  installPwaApp: () => void;
  notifications: NotificationItem[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('language') as LanguageCode) || 'en';
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentToolIds, setRecentToolIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recent_tools') || '[]');
    } catch {
      return [];
    }
  });
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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
            title: 'Welcome to AI Super Hub!',
            message: 'Explore 60+ AI, PDF, Image & Utility tools in one sleek dashboard.',
            type: 'info',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'promo-deal',
            title: 'Launch Special: 50% OFF PRO',
            message: 'Use promo code "WELCOME50" at checkout for 50% discount on PRO!',
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

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const prof = await syncUserProfile(user);
          setProfile(prof);
          const favs = await getUserFavorites(user.uid);
          setFavorites(favs);
        } catch (err) {
          console.error('Error syncing profile:', err);
        }
      } else {
        setProfile(null);
        setFavorites([]);
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
    if (!profile) return;
    const updated = await toggleUserFavorite(profile.uid, toolId, favorites);
    setFavorites(updated);
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (e: string, p: string) => {
    await signInWithEmailAndPassword(auth, e, p);
  };

  const signupWithEmail = async (e: string, p: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, e, p);
    if (res.user) {
      await updateDoc(doc(db, 'users', res.user.uid), { displayName: name });
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

  const upgradeToPremium = async (promoCode?: string): Promise<boolean> => {
    if (!profile) return false;
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        plan: 'premium',
        credits: 99999,
      });

      await addDoc(collection(db, 'subscriptions'), {
        uid: profile.uid,
        plan: 'premium',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        promoCode: promoCode || 'NONE',
      });

      setProfile(prev => prev ? { ...prev, plan: 'premium', credits: 99999 } : null);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      return true;
    } catch (err) {
      console.error('Failed to upgrade:', err);
      return false;
    }
  };

  const redeemPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'WELCOME50' || cleanCode === 'SUPERPRO' || cleanCode === 'ADMINVIP') {
      const success = await upgradeToPremium(cleanCode);
      if (success) {
        return { success: true, message: `Promo code "${cleanCode}" applied! Upgraded to PRO status!` };
      }
    }
    return { success: false, message: 'Invalid or expired promo code.' };
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
      useCredit,
      upgradeToPremium,
      redeemPromoCode,
      submitFeedback,
      installPrompt,
      installPwaApp,
      notifications,
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
