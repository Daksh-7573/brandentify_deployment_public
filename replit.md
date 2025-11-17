# Brandentifier - AI-Powered Career Development Platform

## Overview
Brandentifier is an AI-driven career development platform that helps users build their professional brand, track career progress, and receive personalized guidance. It features an AI assistant, professional networking tools, and a personalized quest system for career development, social media engagement, and brand building. The platform leverages local AI infrastructure to optimize costs while providing comprehensive insights and support for professional growth.

## Recent Changes (Nov 17, 2024)
- **Premium Subscription System - In Progress**: Implementing free vs premium tier subscription system with Stripe integration.
  - **Database Schema**: Added subscription fields to users table (subscriptionTier, subscriptionStatus, stripeCustomerId, subscriptionStartDate, subscriptionEndDate, premiumFeaturesUsage). Created subscriptionTransactions table for payment tracking.
  - **Pulse Reactions System**: Discovered existing pulse reactions infrastructure (pulseReactions, userReactionQuotas tables already implemented). Free users: 10 Insightful + 10 Misinformed daily. Premium users: 20 each daily.
  - **Free Tier Features**: Full profile, 2 portfolio templates (Corporate Executive, Scholar), 2 visiting card templates (Professional, Quantum Tech), 5 AI chat messages/month, 1 resume analysis/month, career quests only (no social quests), 1 career capsule, basic hashtag suggestions (3).
  - **Premium Tier Features**: All portfolio templates, all visiting card templates, unlimited AI chat, unlimited resume analysis, all quest types (career + social), unlimited career capsules, advanced hashtag suggestions (10+), priority support, early access to features.
  - **Premium Badge**: Luxury "B" monogram with gold gradient for premium users on profiles, search results, and pulse author names.

## Previous Changes (Nov 14, 2024)
- **Profile URL Standardization**: Standardized all profile URLs to use `/@brandname` format (e.g., `brandentifier.com/@nishantchopra`). Updated Quantum Card and Personal Info Section to display and link to `/@brandname` URLs. Made Quantum Card profile URL clickable. Profile URLs fall back to `/@username` if brand name is not set. This provides clean, memorable, brandable URLs that match user identity.
- **Profile URL Routing Fix**: Created ProfileResolver component that uses `/api/users/brand/:identifier` endpoint (queries both brand_name and username with priority for brand_name), renders BrandProfile when identifier matches brand_name, otherwise renders PublicProfile. Removed duplicate routes, keeping single `/@:identifier` route at line 375.
- **Services Endpoint 500 Error Fix**: Fixed 500 error on `/api/users/:userId/services` endpoint in portfolio-builder page. Root cause: SQL query in `storage.ts` was trying to SELECT non-existent columns `week_number` and `year` from services table. Solution: Removed these columns from both `getServicesByUserId()` and `getServiceById()` methods. Services table schema only includes: id, userId, title, description, category, priceInr, priceUsd, isHourly, features, imageUrl, order, isActive, createdAt, updatedAt. Fix tested and verified working.
- **Geolocation Permissions Policy Fix**: Fixed permissions policy violation on radar page. Changed `Permissions-Policy` header from `geolocation=()` (blocking all geolocation) to `geolocation=(self)` (allowing same-origin access). Radar page can now request user location for nearby professionals feature. Page gracefully falls back to San Francisco coordinates when user denies permission or hasn't been prompted.
- **Messaging Conversations 400 Error Fix**: Fixed frontend 400 "Invalid user ID" errors when fetching conversations. Backend endpoint `/api/messaging/conversations` requires `userId` query parameter, but frontend wasn't sending it. Solution: Updated queryKey to include userId in URL string (`/api/messaging/conversations?userId=${userId}`) and migrated all 3 cache invalidation calls to use predicate-based matching (`predicate: (query) => query.queryKey[0].startsWith('/api/messaging/conversations')`) to properly invalidate both conversations list and individual message queries. Eliminates console errors and ensures cache updates propagate correctly. Architect-approved.
- **Badge Ref Forwarding Fix**: Fixed React warning on Brand Quest page: "Function components cannot be given refs". Updated Badge component (client/src/components/ui/badge.tsx) to use `React.forwardRef()` with displayName to support Radix UI's TooltipTrigger asChild prop. This is required for shadcn/ui components used with Radix UI primitives that need ref forwarding. Warning eliminated. Architect-approved.
- **Poll Vote 404 Fix**: Fixed poll vote endpoint to return 200 with null instead of 404 when no vote exists. Changed `/api/poll-votes/user/:userId/pulse/:pulseId` to use `res.status(200).json(null)` instead of `res.status(404).json({ message: 'No vote found' })`. Removed frontend special 404 handler for poll votes in queryClient.ts. This follows REST best practices (query succeeded, result is null) and eliminates console error noise. Architect-approved.
- **Routing Fix: Brand Profile URLs**: Changed catch-all route from `/:brandName` to `/@:brandName` pattern to prevent conflicts with internal routes like `/brand/profile`. Updated all profile links to use `/@${brandName || username}` with fallback to username. Backend now queries by both brand_name and username with priority for brand_name. Architect-approved.
- **Auto-Generated Brand Names**: Migrated 22 users with NULL/empty brand_name to use their username as brand_name. Updated both DatabaseStorage and MemStorage `createUser` functions to automatically set `brandName = username` if brandName is not provided during user registration. Ensures all users have a valid brand_name for profile URLs. Architect-approved.

## Previous Changes (Nov 12, 2024)
- **Critical Bug Fix: Daily Quest Bucket**: Fixed daily quest bucket logic in both career and social quests to return ALL active quests regardless of assignment date (removed strict `assigned_date = currentDate` filter). This ensures users see all their active quests, not just today's newly assigned ones. Architect-approved and verified working.
- **Critical Bug Fix: Scheduler Initialization**: Fixed timezone-aware quest scheduler to only initialize users without `nextQuestAssignmentTime` (added `isNull` check). Previously, scheduler reset ALL users on every server restart, causing duplicate quest assignments. Now scheduler respects existing schedules. Architect-approved.
- **Critical Bug Fix: Timezone Calculation**: Fixed `calculateNextMidnight` function to properly convert each user's local midnight to UTC using `date-fns-tz`'s `fromZonedTime` instead of broken `toLocaleString` approach. Previously, ALL users were getting midnight NY time (05:01 UTC) regardless of their timezone. Now each user gets quests at midnight in THEIR timezone (e.g., Pacific users at 08:01 UTC, Eastern users at 05:01 UTC). Architect-approved and verified working with test users in multiple timezones.

## Earlier Changes (Nov 11, 2024)
- **Musk Pulse Feature Disabled**: Completely removed Musk AI news pulse automation and UI tab from Industry Pulse page per user request
- **Code Cleanup**: Removed 3 duplicate/unused Industry Pulse page files (industry-pulse.tsx, industry-pulse-BACKUP.tsx, industry-pulse-optimized.tsx)
- **Active File**: `client/src/pages/industry-pulse-new.tsx` is the single source of truth for Industry Pulse feature

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend
- **Framework**: React with TypeScript, Vite
- **UI/Styling**: Radix UI, Tailwind CSS with glassmorphic design
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod
- **Design**: Consistent glass UI, unified spacing, skeleton loading, dark theme, global background image.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based with bcrypt
- **File Upload**: Replit App Storage (GCS-backed, CDN-delivered)
- **Object Storage**: Public visibility with owner-based ACLs.

### AI Infrastructure
- **Primary AI Provider**: VPS Ollama (Llama 3.2:1b) for 100% free operation.
- **Fallback AI Provider**: Optional OpenAI for critical operations.
- **Caching**: Redis-based response caching.
- **Security**: AI prompt injection protection, content moderation.
- **Core AI Features**: Resume Analysis, Career Insights, Hashtag Suggestions, Predictive Modeling, Cross-User Intelligence, Emotional Intelligence, Cohort-Based Recommendations.
- **AI Personalization**: Dynamic Persona Switching (Mentor, Strategist, Coach), Proactive Suggestion Engine, Learning Pattern Recognition, Conversation Memory with context-aware responses.
- **Enhanced Personalization**: AI chat responses and follow-up questions use actual user profile data (work experience, skills, education, projects, CV) with token-capping formatter utilities.
- **OpenAI to Ollama Migration**: All 8 critical AI services (pulse generation, hashtag suggestions, resume parsing, profile analysis, title suggestions, milestone generation, reference resolution, model switching) migrated to Ollama for cost savings, with graceful OpenAI fallback.
- **Musk Pulse System**: DISABLED per user request - Backend automation stopped, UI tab removed, all Musk pulses filtered from feed.

### Key Components
- **User Management**: Comprehensive profiles, secure JWT auth, gamified profile building.
- **Content Management**: Pulses, Project Showcase, Nowboard (opportunity discovery), Career Goals.
- **Quest Generation System (V2)**: AI-powered system (using Ollama) generates achievable career and social media quests.
    - **Career Quests**: In-platform activities with platform activity mapper, profile completeness checker, and smart deliverable generator.
    - **Social Quests**: Platform-specific quests for LinkedIn, Twitter, Instagram, etc., with platform guidelines engine, audience-based platform selection, and goal-aligned content.
    - **Personalization**: Quests are tailored to user's name, industry, domain, location, audience, and brand goals.
- **Career Intelligence Suite (Phase 1)**: AI-powered tools for actionable advice.
    - **Resume Scorer**: Analyzes resumes (0-100 score), provides impact-ranked fixes.
    - **Job Description Matcher**: Parses job descriptions, calculates match score, identifies skill gaps, provides fix strategies and salary estimates.
- **Portfolio Templates**: 12+ professional portfolio templates covering diverse needs (Corporate Executive, Scholar, Visual Expert, Animated, etc.).
- **Gamification**: AI-generated, impact-weighted, audience-driven Brand Quests, XP System, Badges, Progress Tracking.
- **Content Moderation**: Democratic flagging and AI-powered auto-deletion.
- **Deployment**: Docker, Kubernetes, Nginx, Redis, PostgreSQL (Neon serverless).

### Feature Specifications
- **Quest Specificity**: Quests include structured metadata for deliverables, quantity, platform, and guidance.
- **Engagement Quest System**: Integrates internal platform engagement into career quests with impact scoring.
- **Audience-Based Platform Selection**: Social quest platform recommendations driven by user's target audience demographics.
- **Brand Goal Filtering**: Quests align strictly with user's selected Brand Goals.
- **Impact-Weighted Quest Assignment**: Dynamically assigns 1-4 daily quests based on impact values, respecting a 60-minute daily time cap.
- **Intelligent Hashtag Generator**: 6-layer system for context-aware, audience-targeted hashtag suggestions.
- **Automated Quest Generation**: Robust three-layer failsafe system for daily quest auto-assignment.
- **Trend Intelligence System**: Real-time market trend ingestion with caching, industry/domain-specific tracking, AI-powered dynamic quest narrative generation, hourly refresh, and full integration with quest personalization.
- **Fresh Feed Ranking System**: Time-decay algorithm ensures fresh content rotation in the Industry Pulse feed.
- **AI-Powered Feed Personalization**: Intelligent feed ranking system using Ollama to personalize each user's Industry Pulse feed based on their profile, interests, and engagement history, with diversity filters, caching, and graceful fallback.

## External Dependencies
### Core Infrastructure
- **Database**: PostgreSQL (Neon serverless)
- **Caching**: Redis
- **File Storage**: Replit App Storage (GCS-backed with CDN)

### AI Services
- **Primary**: Ollama
- **Fallback**: OpenAI GPT-4
- **Alternative Support**: LM Studio, Hugging Face

### Third-Party Integrations
- **Email**: SendGrid
- **Authentication**: JWT, bcrypt
- **File Processing**: Advanced PDF parsing