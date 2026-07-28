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
  plan: 'free' | 'adfree' | 'premium';
  credits: number;
  dailyUsage: number;
  lastResetDate: string;
  createdAt: string;
  emailVerified: boolean;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  referralRewardsClaimed?: number;
  referrals?: Array<{ uid: string; email?: string; date?: string }>;
  phoneNumber?: string;
}

export function generate8CharReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function processReferralOnSignup(newUserUid: string, newUserEmail: string, refCodeEntered: string): Promise<{ success: boolean; referrerName?: string }> {
  const cleanCode = refCodeEntered.trim().toUpperCase();
  if (!cleanCode || cleanCode.length < 4) return { success: false };

  try {
    // Check if new user already has a referredBy field set
    const newUserRef = doc(db, 'users', newUserUid);
    const newUserSnap = await getDoc(newUserRef);
    if (newUserSnap.exists()) {
      const userData = newUserSnap.data() as UserProfileData;
      if (userData?.referredBy) {
        return { success: false }; // User has already used a referral code
      }
    }

    let referrerDocSnap: any = null;
    
    // First try querying by referralCode
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', cleanCode));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      referrerDocSnap = querySnap.docs[0];
    } else {
      // Fallback: try direct UID match
      const directRef = doc(db, 'users', cleanCode);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        referrerDocSnap = directSnap;
      }
    }

    if (!referrerDocSnap || !referrerDocSnap.exists()) {
      return { success: false };
    }

    const referrerData = referrerDocSnap.data() as UserProfileData;
    const referrerUid = referrerData.uid;

    if (referrerUid === newUserUid) {
      return { success: false }; // Cannot refer self
    }

    const currentReferrals = Array.isArray(referrerData.referrals) ? referrerData.referrals : [];
    if (currentReferrals.some((r: any) => r.uid === newUserUid)) {
      return { success: false }; // User already referred previously
    }

    const currentCount = Number(referrerData.referralCount || 0);
    const newCount = currentCount + 1;
    const currentRewardsClaimed = Number(referrerData.referralRewardsClaimed || 0);
    const targetRewardThreshold = (currentRewardsClaimed + 1) * 10;

    let newUserName = newUserEmail ? newUserEmail.split('@')[0] : 'New Member';
    if (newUserSnap.exists()) {
      const nuData = newUserSnap.data() as UserProfileData;
      if (nuData?.displayName) {
        newUserName = nuData.displayName;
      }
    }

    let referrerUpdates: any = {
      referralCount: newCount,
      referrals: [
        ...currentReferrals,
        { uid: newUserUid, email: newUserEmail || 'newuser', name: newUserName, date: new Date().toISOString() }
      ],
      credits: Number(referrerData.credits || 0) + 20
    };

    // Check if referrer reached 10 referrals milestone
    if (newCount >= targetRewardThreshold) {
      referrerUpdates.referralRewardsClaimed = currentRewardsClaimed + 1;
      // Grant 1 month free AdFree Plan if currently on free
      if (referrerData.plan === 'free') {
        referrerUpdates.plan = 'adfree';
      }
      referrerUpdates.credits = Number(referrerUpdates.credits || 0) + 50;

      try {
        await addDoc(collection(db, 'notifications'), {
          title: '🎉 1 Month Free Ad-Free Plan Unlocked!',
          message: `Congratulations! ${newCount} users signed up with your referral code. You unlocked 1 Month FREE Offline & Ad-Free Plan (₹99 Value)!`,
          type: 'success',
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.error('Failed to post referral notification:', e);
      }
    }

    // Update referrer doc
    await updateDoc(doc(db, 'users', referrerUid), referrerUpdates);

    // Update new user doc (+20 bonus credits)
    await setDoc(newUserRef, {
      referredBy: referrerUid,
      credits: increment(20)
    }, { merge: true });

    return { success: true, referrerName: referrerData.displayName || 'a member' };
  } catch (err) {
    console.error('Error processing referral:', err);
    return { success: false };
  }
}

export async function verifyReferralCode(code: string): Promise<{ valid: boolean; referrerName?: string; message: string }> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, message: 'Please enter a referral code.' };
  }
  if (cleanCode.length < 4) {
    return { valid: false, message: 'Code must be at least 4 characters long.' };
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', cleanCode));
    const querySnap = await getDocs(q);

    let referrerDocSnap: any = null;
    if (!querySnap.empty) {
      referrerDocSnap = querySnap.docs[0];
    } else {
      const directRef = doc(db, 'users', cleanCode);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        referrerDocSnap = directSnap;
      }
    }

    if (!referrerDocSnap || !referrerDocSnap.exists()) {
      return { valid: false, message: 'Invalid referral code.' };
    }

    const data = referrerDocSnap.data() as UserProfileData;
    const name = data.displayName || (data.email ? data.email.split('@')[0] : 'Member');
    return {
      valid: true,
      referrerName: name,
      message: `Valid code! Referred by ${name}`
    };
  } catch (err) {
    console.error('Error verifying referral code:', err);
    return { valid: false, message: 'Error checking code. Please try again.' };
  }
}

// Sync or fetch user profile from Firestore
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfileData> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const todayStr = new Date().toISOString().split('T')[0];
  const isAdminEmail = user.email === 'biswajitnaskar668@gmail.com';

  if (!userSnap.exists()) {
    const userRefCode = generate8CharReferralCode();
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
      referralCode: userRefCode,
      referralCount: 0,
      referralRewardsClaimed: 0,
      referrals: []
    };

    await setDoc(userRef, defaultProfile);
    if (defaultProfile.role === 'admin') {
      await syncAdminProfile(defaultProfile);
    }
    return defaultProfile;
  } else {
    let profile = userSnap.data() as UserProfileData;

    // Ensure user has an 8-character referral code
    if (!profile.referralCode || profile.referralCode.length !== 8) {
      const newRefCode = generate8CharReferralCode();
      await updateDoc(userRef, { referralCode: newRefCode });
      profile.referralCode = newRefCode;
    }

    // Daily reset check for free usage counter
    if (profile.lastResetDate !== todayStr) {
      const updatedCredits = profile.plan === 'premium' ? 99999 : profile.plan === 'adfree' ? 30 : 10;
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

    if (profile.role === 'admin') {
      await syncAdminProfile(profile);
    }

    return profile;
  }
}

// Sync admin profile to separate 'admins' collection in Firestore
export async function syncAdminProfile(profile: Partial<UserProfileData> & { uid: string }) {
  try {
    const adminRef = doc(db, 'admins', profile.uid);
    await setDoc(adminRef, {
      uid: profile.uid,
      email: profile.email || '',
      displayName: profile.displayName || '',
      photoURL: profile.photoURL || '',
      role: 'admin',
      plan: profile.plan || 'premium',
      permissions: ['all_permissions', 'manage_users', 'manage_tools', 'broadcasts', 'promocodes'],
      lastActive: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error syncing admin profile to admins collection:', err);
  }
}

export async function fetchAdminsFromDb() {
  try {
    const snap = await getDocs(collection(db, 'admins'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching admins collection:', err);
    return [];
  }
}

export async function removeAdminFromDb(uid: string) {
  try {
    await deleteDoc(doc(db, 'admins', uid));
  } catch (err) {
    console.error('Error removing admin doc:', err);
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

// Tool Requests & Community Voting
export async function submitNewToolRequest(
  uid: string,
  userEmail: string,
  userName: string,
  title: string,
  category: string,
  description: string
) {
  return await addDoc(collection(db, 'toolRequests'), {
    uid,
    userEmail,
    userName: userName || 'Anonymous User',
    title,
    category: category || 'General',
    description,
    upvotes: 1,
    upvotedBy: [uid],
    status: 'under_review',
    createdAt: new Date().toISOString(),
  });
}

export async function fetchToolRequests() {
  try {
    const q = query(collection(db, 'toolRequests'));
    const snap = await getDocs(q);
    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    // Sort locally by upvotes descending
    return docs.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  } catch (err) {
    console.error('Error fetching tool requests:', err);
    return [];
  }
}

export async function toggleUpvoteToolRequest(requestId: string, uid: string) {
  try {
    const reqRef = doc(db, 'toolRequests', requestId);
    const snap = await getDoc(reqRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const upvotedBy: string[] = data.upvotedBy || [];
    const isUpvoted = upvotedBy.includes(uid);

    if (isUpvoted) {
      const updatedList = upvotedBy.filter(id => id !== uid);
      await updateDoc(reqRef, {
        upvotedBy: updatedList,
        upvotes: increment(-1)
      });
    } else {
      await updateDoc(reqRef, {
        upvotedBy: [...upvotedBy, uid],
        upvotes: increment(1)
      });
    }
  } catch (err) {
    console.error('Error toggling upvote:', err);
  }
}

export async function updateToolRequestStatusInDb(requestId: string, status: string, adminNotes?: string) {
  const reqRef = doc(db, 'toolRequests', requestId);
  const updates: any = { status };
  if (adminNotes !== undefined) updates.adminNotes = adminNotes;
  await updateDoc(reqRef, updates);
}

export async function deleteToolRequestFromDb(requestId: string) {
  const reqRef = doc(db, 'toolRequests', requestId);
  await deleteDoc(reqRef);
}

// Tool Ratings & Reviews System
export async function submitToolReview(
  toolId: string,
  uid: string,
  userName: string,
  userEmail: string,
  rating: number,
  comment: string
) {
  return await addDoc(collection(db, 'toolReviews'), {
    toolId,
    uid,
    userName: userName || 'User',
    userEmail: userEmail || '',
    rating,
    comment,
    createdAt: new Date().toISOString(),
  });
}

export async function fetchToolReviews(toolId: string) {
  try {
    const q = query(
      collection(db, 'toolReviews'),
      where('toolId', '==', toolId)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching tool reviews:', err);
    return [];
  }
}

export async function deleteToolReviewFromDb(reviewId: string) {
  const ref = doc(db, 'toolReviews', reviewId);
  await deleteDoc(ref);
}

