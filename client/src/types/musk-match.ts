export type MuskMatch = {
  id: number;
  userId: number;
  suggestedUserId: number;
  matchType: string;
  matchScore: number;
  matchReason: string;
  industry: string | null;
  domain: string | null;
  skills: string[];
  isRead: boolean;
  isDismissed: boolean;
  isConnected: boolean;
  shownAt: string;
  expiresAt: string | null;
  suggestedUser?: {
    id: number;
    name: string;
    photoURL: string | null;
    title: string | null;
    industry: string | null;
    location: string | null;
  };
};