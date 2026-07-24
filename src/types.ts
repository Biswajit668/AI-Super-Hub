export type ToolCategory = 'all' | 'ai' | 'pdf' | 'image' | 'text' | 'utility';

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
  plan: 'free' | 'premium';
  credits: number;
  dailyUsage: number;
  lastResetDate: string;
  createdAt: string;
  emailVerified: boolean;
  referredBy?: string;
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
  uid: string;
  userEmail: string;
  toolId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface NotificationItem {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'promo';
  createdAt: string;
  read?: boolean;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  grantPremiumDays?: number;
  grantCredits?: number;
  active: boolean;
}

export type LanguageCode = 'en' | 'bn' | 'hi';
