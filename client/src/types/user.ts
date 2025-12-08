// UserData interface for consistent use across components
export interface UserData {
  id: number;
  username: string;
  name: string | null;
  brandName?: string | null;
  randomProfileLink?: string | null;
  email: string;
  photoURL: string | null;
  title: string | null;
  aboutMe: string | null;
  location: string | null;
  industry: string | null;
  lookingFor: string | null;
  phoneNumber: string | null;
  profileUrl?: string | null;
  whatIOffer?: string | null;
  company?: string | null;
  domain?: string | null;
  emailVerified?: boolean;
  profileCompleted?: boolean;
  visitingCardType?: string | null;
  createdAt?: Date | string | null;
  // Subscription
  subscription_tier?: 'free' | 'premium';
  // New branding fields
  tagline?: string | null;
  visionStatement?: string | null;
  missionStatement?: string | null;
  coreValues?: string[] | null;
  uniqueValueProposition?: string | null;
  primaryAudience?: string[] | null;
  secondaryAudience?: string[] | null;
}