export type ToolCategory = 'all' | 'ai' | 'pdf' | 'image' | 'text' | 'calculator' | 'utility';

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  tags: string[];
  isAi?: boolean;
  isPremium?: boolean;
  rating: number;
  usageCount: number;
  popular?: boolean;
}

export interface UserProfile {
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
  referrals?: Array<{ uid: string; email?: string; name?: string; date?: string }>;
  hasRedeemedFirstTimeCode?: boolean;
  phoneNumber?: string;
}

export interface HistoryItem {
  id?: string;
  uid: string;
  toolId: string;
  toolName: string;
  input: string;
  output: string;
  timestamp: string;
}

export interface FeedbackItem {
  id?: string;
  uid?: string;
  userName?: string;
  userEmail?: string;
  toolId?: string;
  rating?: number;
  comment?: string;
  message?: string;
  createdAt?: string;
  type?: 'toolReview' | 'feedback';
}

export interface NotificationItem {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'promo';
  category?: 'system' | 'promo' | 'update' | 'alert' | 'tool';
  createdAt: string;
  read?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  actionView?: string;
  actionToolId?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  grantPremiumDays?: number;
  grantCredits?: number;
  active: boolean;
}

export interface ToolRequestItem {
  id?: string;
  uid: string;
  userEmail: string;
  userName: string;
  title: string;
  category: string;
  description: string;
  upvotes: number;
  upvotedBy: string[];
  status: 'under_review' | 'planned' | 'in_progress' | 'completed';
  adminNotes?: string;
  createdAt: string;
}

export interface ToolReviewItem {
  id?: string;
  toolId: string;
  uid: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type LanguageCode = 'en' | 'bn' | 'hi';
