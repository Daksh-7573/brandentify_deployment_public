# Brandentifier - AI-Powered Career Development Platform

## Overview
Brandentifier is an AI-driven career development platform designed to help users build their professional brand, track career progress, and receive personalized guidance. It offers an AI assistant, professional networking tools, and a personalized quest system for career development, social media engagement, and brand building. The platform leverages local AI infrastructure for cost efficiency and operates on a freemium model, aiming to capture a significant market share in the career development sector through advanced AI capabilities for personal branding.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- Both templates registered in templateRegistry.tsx and portfolio-builder.tsx
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