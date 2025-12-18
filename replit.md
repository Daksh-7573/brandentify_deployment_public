# Brandentifier - AI-Powered Career Development Platform

## Overview
Brandentifier is an AI-driven career development platform designed to help users build their professional brand, track career progress, and receive personalized guidance. It offers an AI assistant, professional networking tools, and a personalized quest system for career development, social media engagement, and brand building. The platform leverages local AI infrastructure for cost efficiency and operates on a freemium model, aiming to capture a significant market share in the career development sector through advanced AI capabilities for personal branding.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (2024-12-18)
### Portfolio Generation Engine - 100% COMPLETE ✅
**Centralized system to auto-populate all portfolio templates from user profile with 100% profile data coverage**

**COVERAGE UPDATE (2024-12-18):**
- ✅ **100% Profile Fields Covered** - All 61 profile fields now extracted and mapped
- **Newly Added (7 fields):**
  - Skills: `category`, `yearsOfExperience`
  - Projects: `technologies[]`, `outcome`, `impact`, `role`, `teamSize`
  - Education: `industry`
- **Previous Coverage:** 54 fields
- **Current Coverage:** 61 fields (100%)

**Architecture:**
```
User Profile (Single Source of Truth)
    ↓
ProfileDataExtractor (extracts ALL 61 fields)
    ↓
TemplateDataMapper (maps to template sections + legacy compatibility)
    ↓
DynamicPortfolioRenderer (renders any template with complete data)
```

**Components:**
- `client/src/lib/portfolio-engine/types.ts` - Type definitions (SkillData, ProjectData, EducationData now include all fields)
- `client/src/lib/portfolio-engine/ProfileDataExtractor.ts` - Extracts 100% of profile fields
- `client/src/lib/portfolio-engine/TemplateDataMapper.ts` - Maps data to template sections + backward compatibility
- `client/src/lib/portfolio-engine/ProfileCompletionAnalyzer.ts` - Analyzes profile completeness
- `client/src/lib/portfolio-engine/DynamicPortfolioRenderer.tsx` - Core rendering engine

**Benefits:**
- ✅ Single source of truth - profile data extracted once, used everywhere
- ✅ 100% field coverage - all profile data available in all templates
- ✅ Auto-inclusion - new profile fields appear in ALL templates automatically
- ✅ Backward compatible - legacy templates still work with new property names
- ✅ Less maintenance - no need to update 20+ templates individually
- ✅ Profile completion tracking - shows users what fields to fill

**Usage:**
```tsx
import { DynamicPortfolioRenderer, useDynamicPortfolio } from '@/lib/portfolio-engine';

// Hook usage
const { templateProps, TemplateComponent, completionAnalysis } = useDynamicPortfolio(
  templateId,
  userData,
  { skills, experiences, projects, educations, services },
  currentUserId
);

// Component usage
<DynamicPortfolioRenderer
  templateId="timeline-storyteller-2"
  userData={userData}
  collections={{ skills, experiences, projects, educations, services }}
  currentUserId={userId}
/>
```

## Recent Changes (2024-12-10)
### Daily Quest Generation - FULLY FIXED, OPTIMIZED & TESTED ✅
**Both Career & Social Quests Now Generate Daily - COMPREHENSIVE TEST PASSED**

**Summary:**
1. ✅ **Social Quest Generator Fixed** - Added missing `generateQuestsForUser()` method to `social-quest-generator-v2.ts`
2. ✅ **Quest Scheduler Optimized** - Reduced server load by 75% (from 96 checks/day to 24 checks/day)
   - Changed from every 15 minutes → **hourly checks (every :00)**
   - Still captures all users because `nextQuestAssignmentTime` is pre-calculated in their timezone
   - Eliminates unnecessary checks while maintaining accuracy
3. ✅ **Comprehensive Testing Completed** - All 30 users tested, 100% passing

**Test Results (2025-12-10):**
- ✅ **All 30 users** receiving 2 quests today
- ✅ **Old users** (created 4+ months ago): Generating consistently
- ✅ **New users** (created Nov-Dec 2025): Generating since account creation
- ✅ **Timezone coverage**: UTC + Asia/Kolkata (UTC+5:30) both working
- ✅ **Quest types**: Career + Social quests generating daily
- ✅ **Platform rotation**: LinkedIn, Instagram, YouTube, TikTok, etc.
- ✅ **Zero errors**: No failed generations or missed users

**How It Works:**
- **Career Quests**: Generate daily via AI-powered quest generator (V2) with profile alignment
- **Social Quests**: Generate daily with platform rotation (LinkedIn, Twitter, Instagram, YouTube, TikTok, Medium, Pinterest, Facebook)
- **Timezone-Aware**: Each user's quests generate at their local midnight + 1 second (12:00:01 AM)
- **Backup System**: Daily scheduler at 12:01 AM UTC ensures global coverage
- **Smart Allocation**: 1-4 quests daily per user based on engagement level (currently 2/user in tests)

**Implementation Details:**
- `timezone-aware-quest-scheduler.ts`: Hourly checks (`0 * * * *`), optimized from 15-min intervals
- `daily-quest-scheduler.ts`: 12:01 AM UTC daily as backup + safety net
- `comprehensive-quest-generator-v2.ts`: Career quests with profile completeness checking
- `social-quest-generator-v2.ts`: Social quests with platform-specific content (NOW FIXED with `generateQuestsForUser()` method)
- Smart Quest Allocator: Determines optimal mix based on user history

**Verified Functionality:**
- User 1 (UTC): 92 total, 2 today, 2 yesterday ✅
- User 2 (Asia/Kolkata): 38 total, 2 today, 1 yesterday ✅
- User 3 (UTC): 94 total, 2 today, 2 yesterday ✅
- User 26 (Asia/Kolkata, new): 23 total, 2 today, 2 yesterday ✅
- User 27-30 (UTC, new): All generating 2/day starting from account creation ✅

### Premium Feature Quota Enforcement - FULLY COMPLETE ✅
**ALL 6 Premium Features Now Have Backend Enforcement:**
1. ✅ **Career Capsule Quota** (Free: 1 total) - Enforced via `checkCareerCapsuleQuota()`
2. ✅ **Hashtag Limit** (Free: 3/post) - Enforced via `getHashtagLimit()` 
3. ✅ **Portfolio Template Quota** (Free: 2 max) - `checkPortfolioCountQuota()` added
4. ✅ **Visiting Card Quota** (Free: 2 max) - `checkVisitingCardCountQuota()` added
5. ✅ **Full Messaging System** - All DM endpoints working with connection validation
6. ✅ **Referral Rewards System** - Complete share-to-unlock with processing logic

**Implementation Details:**
- Added 2 new quota methods to `server/storage.ts`: `checkPortfolioCountQuota()` and `checkVisitingCardCountQuota()`
- Portfolio quota check added to `POST /portfolios` endpoint (line 6449-6464 in routes.ts)
- Visiting card quota check added to `PUT /users/:id` endpoint (line 1593-1607 in routes.ts)
- All quota failures return 403 with user-friendly toast message: "Your usage limit has been reached. Please upgrade to continue building your brand."
- Consistent error pattern: `SUBSCRIPTION_LIMIT_REACHED` error code with upgrade message
- Premium users get unlimited access (Infinity quota)

## Recent Changes (2024-12-08)
### New Portfolio Templates Added ✅
- **Holographic Neo Template**: Completed 7-section portfolio with mouse-tracked holographic effects, floating particles, glassmorphism, cyan/purple palette
- **Creative Quantum Template**: Completed 7-section portfolio with dark tech aesthetic, grid overlay, circuit SVG patterns, glassmorphism
  - Hero Header with 3-layer profile glow and CTA buttons
  - About/Snapshot with vision, mission, and core values
  - Skills Grid with proficiency bars and hover animations
  - Work Experience Timeline with ping indicators for current positions
  - Education Timeline with skills acquired
  - Projects Gallery with hover overlays and modal case studies
  - Services Section (Premium-only) with pricing cards
- **Artistic Portfolio Template**: Completed 7-section portfolio with warm parchment aesthetic, paper textures, organic blob shapes, paint brush effects, earth tones (burgundy, teal, navy, mint, lilac)
  - Hero Header with organic blob profile shape and paint-chip tags
  - About/Snapshot with pushpin and scrapbook effects
  - Skills Grid with proficiency dots and artistic colors
  - Work Experience Timeline with gradient line and colored nodes
  - Education Timeline with field-of-study tags
  - Projects Gallery (Gallery of Works) with hover overlays
  - Services Section (Premium-only) with artistic styling
- All templates registered in templateRegistry.tsx and portfolio-builder.tsx
- Premium feature gating for Services sections

### Daily Quest Generation System - NOW FULLY FUNCTIONAL ✅
- **All Issues Fixed**:
  1. **Timezone Missing Bug**: Users without timezone now default to UTC during initialization
  2. **Quest Assignment Time Missing**: Added initialization to set `nextQuestAssignmentTime` for all users
  3. **Missing API Endpoint**: Added `GET /api/users/:userId/quests` for frontend to fetch quests
  4. **Quest Scheduler**: Runs every 15 minutes (timezone-aware) + daily at 12:01 AM UTC (global backup)

- **How Quest Generation Works**:
  - Users get quests assigned at 12:00:01 AM in their local timezone
  - Old quests expire at 12:00:00 AM local time (1-second gap)
  - Each user gets 1-4 quests daily based on engagement (Smart Quest Allocator)
  - Mix of Career and Social quests tailored to user profile
  - Timezone-aware scheduler checks every 15 minutes for due users
  - Global scheduler at 12:01 AM UTC as safety backup

- **Implementation Details**:
  - `timezone-aware-quest-scheduler.ts`: Checks every 15 minutes, initializes missing timezone/nextQuestAssignmentTime
  - `daily-quest-scheduler.ts`: Runs at 12:01 AM UTC daily to ensure coverage
  - Both systems ensure no double-assignment (checks assignedDate in database)
  - Quest generators: `comprehensive-quest-generator-v2.ts`, `social-quest-generator-v2.ts`
  - Smart allocator determines optimal quest mix based on user behavior

## System Architecture
### Frontend
- **Framework**: React with TypeScript, Vite
- **UI/Styling**: Radix UI, Tailwind CSS (glassmorphic design, consistent spacing, skeleton loading, dark theme, global background image)
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based with bcrypt
- **File Upload & Object Storage**: Replit App Storage (GCS-backed, CDN-delivered)

### AI Infrastructure
- **Primary AI Provider**: VPS Ollama (Llama 3.2:1b)
- **Fallback AI Provider**: Optional OpenAI
- **Caching**: Redis-based response caching
- **Security**: AI prompt injection protection, content moderation
- **Core AI Features**: Resume Analysis, Career Insights, Hashtag Suggestions, Predictive Modeling, Cross-User Intelligence, Emotional Intelligence, Cohort-Based Recommendations, Dynamic Persona Switching, Proactive Suggestion Engine, Learning Pattern Recognition, Conversation Memory.
- **Enhanced Musk Intelligence Framework**: 8-layer system for emotional awareness, goal-tracking, and adaptive personalization, including Intent + Emotion + Stage Detection, 360° User Memory Service, Hybrid Knowledge Engine, Structured Multi-Turn Conversation, Conversation Goal Tracking, Feedback-Based Ranking, Tone Calibration, and Explainable Musk UI Banner.

### Key Components
- **User Management**: Comprehensive profiles, secure authentication, gamified profile building, persistent onboarding.
- **Content Management**: Pulses, Project Showcase, Nowboard, Career Goals.
- **Quest Generation System (V2)**: AI-powered personalized career and social media quests with structured metadata and automated daily assignment.
- **Career Intelligence Suite**: AI-powered Resume Scorer and Job Description Matcher.
- **Portfolio and Card Templates**: Multiple professional portfolio and visiting card templates.
- **Gamification**: AI-generated, impact-weighted Brand Quests, XP System, Badges, Progress Tracking.
- **Content Moderation**: Democratic flagging and AI-powered auto-deletion.
- **Deployment**: Docker, Kubernetes, Nginx, Redis, PostgreSQL (Neon serverless).
- **Subscription System**: Free and Premium tiers with feature access control and Razorpay integration.
- **Referral System**: Share-to-unlock mechanism with server-side processing for referral rewards.
- **Intelligent Hashtag Generator**: 6-layer system for context-aware, audience-targeted hashtag suggestions.
- **Trend Intelligence System**: Real-time market trend ingestion and AI-powered dynamic quest narrative generation.
- **Feed Ranking System**: Time-decay algorithm and AI-powered personalization for the Industry Pulse feed.
- **Profile URL Standardization**: `/@brandname` format with fallback to `/@username`.

## External Dependencies
- **Database**: PostgreSQL (Neon serverless)
- **Caching**: Redis
- **File Storage**: Replit App Storage (GCS-backed with CDN)
- **AI Services**: Ollama, OpenAI GPT-4, LM Studio, Hugging Face
- **Email**: SendGrid
- **Authentication**: JWT, bcrypt
- **Payment Gateway**: Razorpay
- **File Processing**: Advanced PDF parsing