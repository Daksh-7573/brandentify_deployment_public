# Brandentifier - AI-Powered Career Development Platform

## Overview
Brandentifier is an AI-driven career development platform focused on professional brand building, career tracking, and personalized guidance. It features an AI assistant, networking tools, and a personalized quest system for career and social media development. The platform utilizes local AI infrastructure for cost efficiency, operates on a freemium model, and aims to lead the career development market with advanced AI for personal branding.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Portfolio and Card Templates**: Multiple professional portfolio and visiting card templates (e.g., Holographic Neo, Creative Quantum, Artistic Portfolio).
- **Gamification**: AI-generated, impact-weighted Brand Quests, XP System, Badges, Progress Tracking.
- **Content Moderation**: Democratic flagging and AI-powered auto-deletion.
- **Deployment**: Docker, Kubernetes, Nginx, Redis, PostgreSQL (Neon serverless).
- **Subscription System**: Free and Premium tiers with feature access control and Razorpay integration.
- **Referral System (V2)**: Share-to-unlock mechanism for both portfolios AND quantum cards. Users get 2 free portfolios (Corporate Executive + Scholar) at signup. When they refer others who sign up, they unlock 2-3 additional random portfolios + 1-2 random quantum cards per referral. 20+ portfolios remain locked until unlocked via referrals.
- **Intelligent Hashtag Generator**: 6-layer system for context-aware, audience-targeted hashtag suggestions.
- **Trend Intelligence System**: Real-time market trend ingestion and AI-powered dynamic quest narrative generation.
- **Feed Ranking System**: Time-decay algorithm and AI-powered personalization for the Industry Pulse feed.
- **Profile URL Standardization**: `/@brandname` format with fallback to `/@username`.
- **Portfolio Generation Engine**: Centralized system to auto-populate all portfolio templates from user profile data with 100% field coverage.

## External Dependencies
- **Database**: PostgreSQL (Neon serverless)
- **Caching**: Redis
- **File Storage**: Replit App Storage (GCS-backed with CDN)
- **AI Services**: Ollama, OpenAI GPT-4, LM Studio, Hugging Face
- **Email**: SendGrid
- **Authentication**: JWT, bcrypt
- **Payment Gateway**: Razorpay
- **File Processing**: Advanced PDF parsing

## Latest Session Updates (2026-01-07)

### Profile System Cleanup - COMPLETED ✅
- **Removed aboutMe Field**: Completely removed from schema, types, profile views, and edit forms
- **Removed Edit Profile Page**: Redundant /edit-profile page deleted since users can edit sections inline from their profile
- **Added Redirect**: /edit-profile now redirects to /profile for backward compatibility with bookmarks
- **Updated Navigation**: Removed Settings link from dashboard sidebar that pointed to edit-profile

## Session Updates (2026-01-01)

### Brand Quest FK Linking Fix - COMPLETED ✅
- **Root Cause**: Drizzle ORM schema was missing `generatedQuestId` and `generatedCareerQuestId` columns in `userQuests` table
- **Fix Applied**: Added missing columns to `shared/schema.ts` for proper FK linking
- **Result**: Each user now receives unique AI-generated personalized quest content (titles, descriptions, Musk tips)
- **Verified**: User quests now properly link to `generated_career_quests` and `generated_social_quests` tables
- **Daily Scheduler**: Successfully generating quests with unique AI content per user, with OpenAI fallback when VPS Ollama times out

## Session Updates (2024-12-24)

### Musk Chat UI & FIL Integration - COMPLETED ✅
- **Duplicate Heading Removed**: MuskChatPanel header now hidden in messages page view (Chat component provides header)
- **FIL System Integrated**: Follow-Up Intelligence Layer now receives proper context with `conversationHistory` 
- **Smart Follow-ups**: System now generates purpose-driven follow-ups using FIL instead of static responses
- **Dual-mode Panel**: MuskChatPanel works as full-width tab in messages page OR floating popup elsewhere
- **Production Status**: Ready for testing - users should now see new AI-generated follow-ups instead of old questions

## Production Readiness Audit (2024-12-20)

### Referral-Based Portfolio & Quantum Card Unlock System - IMPLEMENTED ✅
- **Free Base**: Corporate Executive + Scholar portfolios always unlocked at signup
- **Locked Assets**: 20+ portfolios locked by default, unlock via referrals
- **Referral Rewards**: Each referral conversion grants referrer 2-3 random portfolio unlocks + 1-2 quantum card unlocks
- **Database**: userUnlocks table tracks all unlocks with userId, unlockType, unlockId, unlockSource, referralConversionId
- **Frontend**: Portfolio builder and quantum card selector check unlock status and show "Share to unlock" for locked items
- **Security**: Locked state defaults while fetching to prevent access bypass

### Database Health - VERIFIED ✅
- 119 tables operational with core data intact
- Users: 31 active users with complete profiles
- Quests: 80-130 quests per user, daily generation working
- Pulses/Feed: 521 pulses in system
- Messages, Notifications, Skills, Projects, Educations all functional
- User Unlocks: Tracking portfolio and quantum card unlocks per referral

### API Endpoints Verified ✅
- User data APIs (GET /api/users/:id, /api/users/:userId/skills, /experiences, etc.)
- Portfolio APIs (GET /api/users/:userId/portfolio, GET /api/portfolios?userId=X, POST, PUT, DELETE)
- Quest APIs (GET /api/users/:userId/quests)
- Messaging APIs (conversations, messages, unread count)
- Notification APIs
- Feed/Pulse APIs (521 pulses loaded)
- Media serving (/uploads/media/ returning 200 status)
- Referral Status API (GET /api/referral/status - returns unlock status)
- Referral Link Generation (POST /api/referral/generate-link)

### Authentication System ✅
- Google OAuth URL generation working
- Session management functional
- JWT tokens operational

### Quest Generation System ✅
- Daily automatic assignment for 31 users
- Both career and social quests generating
- Timezone-aware scheduling working

### XP and Subscription Systems ✅
- XP balance tracking
- Free/Premium tier enforcement working

### Fixes Applied
- Fixed media upload (files now save with proper content from file.tempFilePath)
- Added Express static file serving for /uploads/ directory
- Changed default portfolio to "corporate-executive" for all new users
- Implemented referral-based unlock system for portfolios and quantum cards
- Storage methods for managing user unlocks (createUserUnlock, getUserUnlocks, checkUserHasUnlock)

### Known TypeScript Warnings (non-blocking)
- 57 TypeScript warnings in routes.ts (session typing, error types)
- These are compile-time warnings only, not runtime errors
- Can be addressed post-deployment as maintenance items
