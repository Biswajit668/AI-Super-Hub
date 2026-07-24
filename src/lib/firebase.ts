import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  increment,
  deleteDoc
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const VAPID_KEY = 'BPPoHcOjAhPSr0S7P7i50ydBP0GOSDAOfp8HNoej24LCXt7WaYxudJ9NiMovVMiIksajdXO1GKXUBQ05wR_Axm8';

// Request Push Notification permission & token
export async function requestNotificationPermission(uid?: string) {
  try {
    const messagingSupported = await isSupported();
    if (!messagingSupported || typeof window === 'undefined' || !('Notification' in window)) {
      console.log('Firebase Messaging not supported on this device/browser');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = getMessaging(app);
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token && uid) {
        // Save FCM token under user document
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { fcmToken: token, notificationsEnabled: true });
      }
      return token;
    }
  } catch (err) {
    console.error('Error enabling push notifications:', err);
  }
  return null;
}

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin';
  plan: 'free' | 'premium';
  credits: number;
  dailyUsage: number;
  lastResetDate: string;
  createdAt: string;
  emailVerified: boolean;
  referredBy?: string;
}

// Sync or fetch user profile from Firestore
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfileData> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const todayStr = new Date().toISOString().split('T')[0];
  const isAdminEmail = user.email === 'biswajitnaskar668@gmail.com';

  if (!userSnap.exists()) {
    const defaultProfile: UserProfileData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Member',
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
      role: isAdminEmail ? 'admin' : 'user',
      plan: isAdminEmail ? 'premium' : 'free',
      credits: isAdminEmail ? 99999 : 10,
      dailyUsage: 0,
      lastResetDate: todayStr,
      createdAt: new Date().toISOString(),
      emailVerified: user.emailVerified,
    };

    await setDoc(userRef, defaultProfile);
    return defaultProfile;
  } else {
    let profile = userSnap.data() as UserProfileData;

    // Daily reset check for free usage counter
    if (profile.lastResetDate !== todayStr) {
      const updatedCredits = profile.plan === 'premium' ? 99999 : 10;
      const updates = {
        dailyUsage: 0,
        credits: profile.plan === 'premium' ? profile.credits : updatedCredits,
        lastResetDate: todayStr,
      };
      await updateDoc(userRef, updates);
      profile = { ...profile, ...updates };
    }

    // Auto promote admin email
    if (isAdminEmail && profile.role !== 'admin') {
      await updateDoc(userRef, { role: 'admin', plan: 'premium', credits: 99999 });
      profile.role = 'admin';
      profile.plan = 'premium';
      profile.credits = 99999;
    }

    return profile;
  }
}

// Record tool usage history
export async function recordToolUsage(uid: string, toolId: string, toolName: string, input: string, output: string) {
  try {
    await addDoc(collection(db, 'history'), {
      uid,
      toolId,
      toolName,
      input: input.substring(0, 1000), // truncate for space
      output: output.substring(0, 2000),
      timestamp: new Date().toISOString(),
    });

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      dailyUsage: increment(1),
      credits: increment(-1),
    });
  } catch (err) {
    console.error('Failed to record history:', err);
  }
}

// Manage user favorites
export async function getUserFavorites(uid: string): Promise<string[]> {
  try {
    const q = query(collection(db, 'favorites'), where('uid', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data().toolId as string);
  } catch (err) {
    console.error('Failed to fetch favorites:', err);
    return [];
  }
}

export async function toggleUserFavorite(uid: string, toolId: string, currentFavs: string[]): Promise<string[]> {
  const isFav = currentFavs.includes(toolId);
  try {
    const q = query(collection(db, 'favorites'), where('uid', '==', uid), where('toolId', '==', toolId));
    const snap = await getDocs(q);

    if (isFav) {
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      return currentFavs.filter(id => id !== toolId);
    } else {
      if (snap.empty) {
        await addDoc(collection(db, 'favorites'), { uid, toolId, addedAt: new Date().toISOString() });
      }
      return currentFavs.includes(toolId) ? currentFavs : [...currentFavs, toolId];
    }
  } catch (err) {
    console.error('Error toggling favorite in Firestore:', err);
    return currentFavs;
  }
}

// Submit tool feedback
export async function submitToolFeedback(uid: string, userEmail: string, toolId: string, rating: number, comment: string) {
  await addDoc(collection(db, 'feedback'), {
    uid,
    userEmail,
    toolId,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  });
}
