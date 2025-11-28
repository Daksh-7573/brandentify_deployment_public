export type SocialLink = { platform: string; url: string; label?: string };
export type MediaItem = { url: string; alt?: string; thumbnailUrl?: string; type?: 'image' | 'video' | 'embed' };

export type CardLayer = {
  id: string;
  depth: number;
  contentType?: 'image' | 'text' | 'badge' | 'button' | 'icon';
  html?: string;
  className?: string;
};

export type ThreeDCardProfile = {
  id: string | number;
  name: string;
  title?: string;
  photoUrl?: string;
  location?: string;
  company?: string;
  industryTags?: string[];
  contact?: { email?: string; phone?: string; profileUrl?: string };
  stats?: { label: string; value: string }[];
  socialLinks?: SocialLink[];
};

export type ThreeDCardProps = {
  profile: ThreeDCardProfile;
  width?: number;
  height?: number;
  perspective?: number;
  maxRotation?: number;
  parallaxDepths?: number[];
  particles?: { count?: number; color?: string };
  showRings?: boolean;
  enableTilt?: boolean;
  onAction?: (action: 'copy' | 'download' | 'contact' | 'mentor', payload?: any) => void;
  className?: string;
  coreValues?: string[];
  lookingFor?: string;
};

export type ServiceItem = {
  id: string | number;
  title: string;
  description?: string;
  deliverables?: string[];
  priceRange?: string;
  iconId?: string;
  category?: string;
};

export type ProjectItem = {
  id: string | number;
  title: string;
  year?: number | string;
  coverUrl: string;
  thumbnails?: string[];
  description?: string;
  tags?: string[];
  client?: string;
  outcomes?: string[];
  link?: string;
};

export type Skill = {
  id: string | number;
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  proficiency?: number;
};

export type Tool = {
  id: string | number;
  name: string;
  iconId?: string;
};

export type TimelineEntry = {
  id: string | number;
  title: string;
  company?: string;
  institution?: string;
  startDate?: string;
  endDate?: string | null;
  location?: string;
  shortDesc?: string;
  highlights?: string[];
  type: 'experience' | 'education';
};

export const COLORS = {
  electricBlue: "#38bdf8",
  neonPurple: "#c084fc",
  mintGreen: "#10b981",
  charcoalBlack: "#1e293b",
  deepCharcoal: "#0f1724",
  silverGray: "#cbd5e1",
  offWhite: "#F8FAFC",
  coolGray: "#94A3B8",
  subtleGrid: "rgba(56,189,248,0.06)"
};

export const DEPTH_MAP = {
  layer5: 0.25,
  layer4: 0.5,
  layer3: 0.9,
  layer2: 1.4,
  layer1: 2.2
};
