# Brandentifier - AI-Powered Career Development Platform

## Overview
Brandentifier is an AI-driven career development platform that helps users build their professional brand, track career progress, and receive personalized guidance. It features an AI assistant, professional networking tools, and a personalized quest system for career development, social media engagement, and brand building. The platform utilizes local AI infrastructure for cost optimization and offers a free and premium subscription model, aiming to capture significant market share in the career development sector through advanced AI capabilities for personal branding.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (2024-12-01)
### Approval System Removed for Better UX ✅
- **Client Endorsements**: Changed from "Pending" approval to "Approved" on creation
  - Auto-approved endorsements are immediately visible on project cards
  - Simplified user experience - no waiting for approval
  - All endorsements now display in profile project showcase
- **Team Members**: Similarly auto-approved when added to projects
  - Team member visibility improved for better collaboration display
  - Removed approval workflow complexity

## Previous Changes (2024-11-30)
### Testing/Production Parity - Phase 1 & Phase 2 COMPLETE & TESTED ✅
- **Phase 1.1 COMPLETED**: Resume contexts now use PostgreSQL (`resume_context_cache` table) instead of global variables
  - Created `server/services/resume-context-service.ts` for database-backed storage
  - Updated `server/routes-musk.ts` to use database for resume context with memory fallback
  - This ensures resume data persists across app restarts in production
- **Phase 1.2 COMPLETED**: User interaction memory migrated to PostgreSQL via `userMuskMemoryService`
  - Extended `server/services/user-musk-memory.ts` with communication style tracking (messageLength, formality, detailLevel, technicalLevel)
  - Added methods: `getCommunicationStyle()`, `updateCommunicationStyle()`, `recordInteraction()`, `recordTopicPreference()`, `getInteractionMemory()`
  - Updated `routes-musk.ts` to use async database-backed functions instead of `global.userInteractionMemory`
  - All user interaction preferences now persist across app restarts in production
- **Phase 1.3 COMPLETED**: Feed cache migrated to Redis-backed caching using existing cacheService
  - Fixed async/await issues for `feedCache.get()` and `feedCache.set()` calls in routes.ts
- **Phase 2.1 COMPLETED**: Conversation memory migrated from in-memory Map to PostgreSQL (`chat_messages` table)
  - Updated `server/services/conversation-memory.ts` with async database-backed storage using `chat_messages` table
  - Added sync fallback methods (`getRecentMessagesSync`, `getLastMuskResponseSync`, `getConversationMemorySync`) for services that can't await
  - **Cache warm-up strategy**: Added `triggerCacheWarmUp()` and `warmUpUserCache()` functions to load from database on cache miss, resolving cold-start issues
  - **Error propagation**: `addMessageToMemory()` now throws errors instead of silently swallowing them; `addMessageToMemorySync()` wrapper logs errors for monitoring
  - **Retention policy**: Added `enforceRetentionPolicy()` that deletes old messages beyond MAX_MESSAGES_PER_USER (10), preventing unbounded DB growth
  - Updated dependent services to use sync versions: `emotional-intelligence.ts`, `predictive-career-modeling.ts`, `proactive-suggestion-engine.ts`, `dynamic-persona-engine.ts`, `reference-resolution.ts`, `learning-pattern-recognition.ts`, `follow-up-handler.ts`
  - Fixed async/await issues in `enhanced-musk-intelligence.ts` for `analyzeUserPatterns`, `isFollowUpMessage`, `formatConversationForAI`
  - All conversation history now persists across app restarts in production
- **Phase 2.2 COMPLETED & TESTED**: Learning pattern recognition migrated to database (`user_learning_patterns` table)
  - Created `server/services/learning-patterns-service.ts` for database-backed learning patterns storage
  - Updated `server/services/learning-pattern-recognition.ts` to use database instead of in-memory Map
  - User preferences, behavior patterns, and learning insights now persist across restarts
  - Implemented async/sync pattern with database warm-up on cache miss
  - **Test Results**: All 4 tests PASSING - Create/Get Pattern, Database Insertion, Update Pattern, Data Persistence
- **Phase 2.3 COMPLETED & TESTED**: Cross-user intelligence (cohort analysis) migrated to database
  - Created `server/services/cohort-intelligence-service.ts` for database-backed cohort storage
  - Added new database tables: `user_cohorts` (cohort definitions) and `cohort_membership` (user-cohort relationships)
  - Updated `server/services/cross-user-intelligence.ts` to use database instead of in-memory Maps
  - All cohort patterns, insights, and membership data now persist across restarts
  - **Test Results**: All 5 tests PASSING - Create/Get Cohort, Database Insertion, Add User to Cohort, Get User Cohorts, Update Cohort
- **Integration Testing**: Created comprehensive test suite (`server/tests/phase-2-integration-tests.ts`)
  - Tests verify all Phase 2.2 and 2.3 functionality
  - All 3 integration tests PASSING
  - Performance metrics verified (<100ms per operation)
  - Zero TypeScript errors, full database integration working

### Phase 3 COMPLETED & TESTED ✅ (2024-11-30)
- **Phase 3.1 COMPLETED**: Fixed remaining global.resumeContexts reference in enhanced-musk-intelligence.ts
  - Now uses database-backed `resumeContextService` for resume context retrieval
  - Proper numeric userId conversion and error handling
  - Resume highlights persist across app restarts
- **Phase 3.2 EVALUATED**: AI Monitoring Dashboard metrics (operational data)
  - Kept in-memory Map (acceptable for operational metrics)
  - Metrics reset on restart is acceptable behavior
- **Phase 3.3 EVALUATED**: User Interest Indexer already production-ready
  - Already reads from database (users, brandGoals, userHashtagFollows tables)
  - Rebuilds indexes on startup via TrendSpikeScheduler
  - In-memory Maps are caches for O(1) lookups, not persistent storage
- **Phase 3.4 COMPLETED**: Hashtag suggestion cache migrated to Redis
  - Uses cacheService (Redis-backed with memory fallback)
  - SHA-256 hash-based cache keys to avoid collisions
  - 1-hour TTL for cached hashtag suggestions
- **Integration Testing**: Created comprehensive test suites
  - Phase 3 Integration Tests (`server/tests/phase-3-integration-tests.ts`): All 12 tests PASSING
  - Comprehensive All-Phases Test (`server/tests/all-phases-comprehensive-test.ts`): **17/17 TESTS PASSING (100% ✅)**
  - Resume context persistence verified
  - Conversation memory storage working
  - Redis cache operations verified with SHA-256 hash keys
  - Database health confirmed
  - **All UI and functionality working - ZERO BREAKING CHANGES**

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
- **File Upload & Object Storage**: Replit App Storage (GCS-backed, CDN-delivered) with public visibility and owner-based ACLs.

### AI Infrastructure
- **Primary AI Provider**: VPS Ollama (Llama 3.2:1b)
- **Fallback AI Provider**: Optional OpenAI
- **Caching**: Redis-based response caching
- **Security**: AI prompt injection protection, content moderation
- **Core AI Features**: Resume Analysis, Career Insights, Hashtag Suggestions, Predictive Modeling, Cross-User Intelligence, Emotional Intelligence, Cohort-Based Recommendations, Dynamic Persona Switching, Proactive Suggestion Engine, Learning Pattern Recognition, Conversation Memory.
- **Enhanced Musk Intelligence Framework**: 8-layer system for emotional awareness, goal-tracking, and adaptive personalization, including Intent + Emotion + Stage Detection, 360° User Memory Service, Hybrid Knowledge Engine, Structured Multi-Turn Conversation, Conversation Goal Tracking, Feedback-Based Ranking, Tone Calibration, and Explainable Musk UI Banner.

### Key Components
- **User Management**: Comprehensive profiles, secure authentication, gamified profile building, persistent onboarding for mandatory fields.
- **Content Management**: Pulses, Project Showcase, Nowboard, Career Goals.
- **Quest Generation System (V2)**: AI-powered personalized career and social media quests with structured metadata and automated daily assignment.
- **Career Intelligence Suite**: AI-powered Resume Scorer and Job Description Matcher.
- **Portfolio and Card Templates**: Multiple professional portfolio and visiting card templates.
- **Gamification**: AI-generated, impact-weighted Brand Quests, XP System, Badges, Progress Tracking.
- **Content Moderation**: Democratic flagging and AI-powered auto-deletion.
- **Deployment**: Docker, Kubernetes, Nginx, Redis, PostgreSQL (Neon serverless).
- **Subscription System**: Free and Premium tiers with feature access control and Razorpay integration.
- **Referral System**: Share-to-unlock mechanism with server-side processing for referral rewards during user creation.
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