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
- **Referral System**: Share-to-unlock mechanism with server-side processing for referral rewards.
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

## Production Readiness Audit (2024-12-19)

### Database Health - VERIFIED ✅
- 119 tables operational with core data intact
- Users: 31 active users with complete profiles
- Quests: 80-130 quests per user, daily generation working
- Pulses/Feed: 521 pulses in system
- Messages, Notifications, Skills, Projects, Educations all functional

### API Endpoints Verified ✅
- User data APIs (GET /api/users/:id, /api/users/:userId/skills, /experiences, etc.)
- Portfolio APIs (GET /api/users/:userId/portfolio, GET /api/portfolios?userId=X, POST, PUT, DELETE)
- Quest APIs (GET /api/users/:userId/quests)
- Messaging APIs (conversations, messages, unread count)
- Notification APIs
- Feed/Pulse APIs (521 pulses loaded)
- Media serving (/uploads/media/ returning 200 status)

### Authentication System ✅
- Google OAuth URL generation working
- Session management functional
- JWT tokens operational

### Quest Generation System ✅
- Daily automatic assignment for 31 users
- Both career and social quests generating
- Timezone-aware scheduling working

### XP and Subscription Systems ✅
- XP balance tracking (695 XP for test user)
- Free/Premium tier enforcement working

### Fixes Applied
- Added GET /api/portfolios endpoint for API consistency

### Known TypeScript Warnings (non-blocking)
- 57 TypeScript warnings in routes.ts (session typing, error types)
- These are compile-time warnings only, not runtime errors
- Can be addressed post-deployment as maintenance items