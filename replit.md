# Brandentifier - AI-Powered Career Development Platform

## Overview
Brandentifier is an AI-driven career development platform designed to help users build their professional brand, track career progress, and receive personalized guidance. It integrates an AI assistant and professional networking features, leveraging local AI infrastructure to optimize costs while maintaining full functionality. The platform aims to provide comprehensive insights and support for professional growth.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
Latest modifications with dates

### October 10, 2025 - Brandentifier Engagement Quests Added to Career Quests
- **COMPLETED: Engagement Quest System** - Added internal platform engagement activities to Career Quest system
- **Engagement Features**: 4 types of Brandentifier engagement activities integrated
  - Pulse Reactions (insightful/misinformed markers)
  - Pulse Comments (thoughtful discussions)
  - Poll Voting (community participation)
  - Pulse Sharing (content curation)
- **Quest Templates**: 15+ engagement quest templates with Musk-style tips covering:
  - Quick Win Quests (3-10 min): React to pulses, vote on polls, share content
  - Medium Impact Quests (10-20 min): Thoughtful comments, industry engagement, community participation
  - High-Value Quests (15 min): Deep engagement with single pulse (react + comment + share)
- **Impact Scoring**: 7 engagement quest types added to impact scoring system (15-60 points)
- **Brand Goal Integration**: Engagement quests added to 9 Brand Goals (all visibility, professional, engagement, monetization_1, monetization_2)
- **Quest Allocation**: Engagement quests included in both profile-building and pulse-focused quest types
- **Goal Multipliers**: Engagement quests receive 1.15x-1.35x impact boost for engagement_community goal

### October 10, 2025 - Audience-Based Platform Selection for Social Quests
- **COMPLETED: Audience-Driven Platform Algorithm** - Platform selection now based on where user's target audiences are most active
- **Primary & Secondary Audience Support**: Leverages user's `primaryAudience` and `secondaryAudience` fields from profile
- **Comprehensive Audience Mappings**: 40+ audience-to-platform mappings covering:
  - Professional audiences (C-Suite, Entrepreneurs, Tech Professionals, etc.) → LinkedIn, Twitter, Medium
  - Consumer demographics (Gen Z, Millennials, Gen X, etc.) → TikTok, Instagram, Facebook
  - Creative audiences (Influencers, Artists, Content Creators) → Instagram, YouTube, Pinterest
  - Student & Educator audiences → LinkedIn, YouTube, Twitter
  - Local & Community audiences → Google, Facebook, Instagram
  - B2B audiences → LinkedIn, Twitter, Medium
  - Niche audiences (Developers, Gamers, Fitness, etc.) → Platform-specific recommendations
- **Weighted Scoring System**: 
  - Primary audience: 5-point weight (highest priority)
  - Secondary audience: 3-point weight (supporting platforms)
  - LinkedIn baseline: +1 bonus (universally valuable for professionals)
- **Smart Selection**: Algorithm selects 2-3 optimal platforms based on audience demographics
- **Example**: User targeting "Gen Z Consumers" + "Content Creators" → Gets TikTok, Instagram, YouTube
- **Platform Strategy**: NO Brandentifier platform in social quests - only external platforms where audiences actively engage

### October 10, 2025 - Brand Goal Strict Filtering Implementation
- **COMPLETED: Strict Brand Goal Filtering** - Users ONLY receive quests matching their selected Brand Goals (Option B implementation)
- **Brand Goal Quest Mapper**: Comprehensive mapping service connecting all 12 Brand Goals to relevant quest types
  - Visibility Goals (5) → visibility, pulse_creation, networking, profile_update quests
  - Professional Goals (3) → pulse_creation, portfolio, resume, learning, networking quests
  - Engagement Goal (1) → networking, pulse_creation, visibility quests
  - Monetization Goals (3) → portfolio, visibility, pulse_creation, networking quests
- **Smart Quest Allocator Updates**: Enhanced with strict intersection filtering
  - Step 1: Determine focus area types (profile-building vs pulse-focused) based on profile completeness
  - Step 2: Get allowed quest types from user's selected Brand Goals
  - Step 3: Intersect both - quest must match BOTH focus area AND Brand Goals
  - Fallback: Users with no Brand Goals selected see all focus-area appropriate quests
- **Personalization**: Quest recommendations now perfectly aligned with user's career development objectives
- **Example Flow**: User with `engagement_1` + `professional_1` goals gets networking, pulse_creation, visibility, portfolio, resume, learning quests

### October 10, 2025 - Impact-Weighted Quest Assignment System
- **COMPLETED: Dynamic Quest Allocation System** - Replaced fixed "1 Career + 1 Social" format with intelligent impact-weighted assignment
- **Quest Impact Scoring**: Predefined impact values for 40+ quest types across 3 categories:
  - High Impact (80-100): Career-defining activities like updating LinkedIn headline, portfolio showcase
  - Medium Impact (40-79): Profile optimization, skill demonstrations, industry engagement  
  - Quick Win (10-39): Daily engagement activities, micro-learning tasks
- **Smart Quest Allocator**: Determines optimal daily quest quantity (1-4) based on total impact value
  - Single high-impact quest (85+): One career-defining task
  - 2 quests (120+ total): Balanced career/social mix
  - 3 quests (180+ total): Comprehensive daily strategy
  - 4 quests (250+ total): Maximum productivity push
  - 60-minute daily time cap respected
  - Fallback to 1+1 format if system can't determine optimal mix
- **Intelligent Hashtag Generator**: Context-aware, audience-targeted hashtag system (NO random tags)
  - 6-layer hashtag system: Primary (industry/domain), Audience-targeted, Goal-aligned, Platform-specific, Content-type, Geographic
  - Considers: user industry, domain expertise, Brand Goals, target audience, platform, content type
  - Comprehensive industry/domain mappings for all professional sectors
- **Database Schema**: Added `suggestedHashtags` (text array) and `hashtagContext` (text) to userQuests table
- **Architect Verdict**: PASS - System integrates coherently with consistent data contracts and proper failover logic

### October 7, 2025 - Brand Quest Auto-Generation System Fixed
- **FIXED: Daily Quest Auto-Assignment** - Fully operational automatic quest generation system
- **System Architecture**: Three-layer failsafe approach for reliable daily quest assignment
  1. **Primary**: Cron job at 12:01 AM UTC via `dailyQuestScheduler.startScheduler()` 
  2. **Boot-Time Failsafe**: Quest assignment runs immediately after server startup
  3. **Hourly Failsafe**: Backup check every 60 minutes to catch any missed assignments
- **Implementation Details**:
  - Quest healing runs after routes are registered in main async IIFE (line 825-845 in server/index.ts)
  - Uses proven `dailyQuestScheduler.triggerFullDailyProcess()` service
  - Manual test endpoint `/api/test-daily-quest-scheduler` available for testing
- **Current Status**: 32 quests assigned to 14 users today (verified 10/07/2025)
- **Google OAuth Fix**: Google profile sync now only occurs on first signup, preserving user customizations on subsequent logins

### September 6, 2025 - Major Feature Launch: Social Quests AI System
- **COMPLETED: Complete Social Quest AI System** - Fully operational AI-powered career development feature
- **Database Integration**: Comprehensive schema with platform-specific task types, AI generation metadata, and user progress tracking
- **AI Task Generator**: Advanced service analyzing user profiles (industry, domain, goals) to generate personalized social media strategies
- **API Infrastructure**: Full CRUD endpoints for task generation, assignment, completion, and platform analytics
- **UI Integration**: Social Quest tab seamlessly integrated into existing Brand Quest interface with platform-specific task cards
- **Platform Strategy**: Brandentifier-first approach (60% focus) with LinkedIn secondary (25%) and tertiary platforms (15%)
- **AI Features**: Musk-style tips, platform-specific recommendations, actionable task descriptions, and progress tracking
- **Technical Achievement**: End-to-end system from AI generation through UI completion, fully operational backend

## System Architecture
### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI with custom styling
- **Styling**: Tailwind CSS with glassmorphic design
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **Design Decisions**: Consistent glass UI across all pages, unified visual spacing, skeleton loading for perceived performance, and a dark theme. Global background image for brand consistency.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle for type-safe operations
- **Authentication**: JWT-based with bcrypt
- **File Upload**: Express-fileupload with local storage

### AI Infrastructure
- **Primary Provider**: Local AI using Ollama (Llama 3.2:3b models)
- **Fallback**: Optional OpenAI integration for critical operations
- **Caching**: Redis-based response caching
- **Security**: AI prompt injection protection and content moderation
- **Core AI Features**: Musk AI Assistant for career guidance, Resume Analysis (PDF processing), Career Insights, Hashtag Suggestions, Predictive Career Modeling, Cross-User Intelligence, Emotional Intelligence, and Cohort-Based Recommendations.
- **AI Personalization**: Dynamic Persona Switching (Career Mentor, Strategist, Executive Coach), Proactive Suggestion Engine, Learning Pattern Recognition, and Conversation Memory with context-aware responses.

### Key Components
- **User Management**: Comprehensive profiles, secure JWT auth, gamified profile building.
- **Content Management**: Pulses (professional posts), Projects Showcase, Nowboard (opportunity discovery), Career Goals (milestone tracking).
- **Gamification**: Brand Quests, XP System, Badges, Progress Tracking.
- **Content Moderation**: Democratic flagging and AI-powered auto-deletion.
- **Deployment Strategy**: Docker for containerization, Kubernetes for orchestration (production), Nginx for load balancing, Redis for caching, PostgreSQL (Neon serverless) for database.

## External Dependencies
### Core Infrastructure
- **Database**: PostgreSQL (Neon serverless)
- **Caching**: Redis
- **File Storage**: Local filesystem

### AI Services
- **Primary**: Ollama
- **Fallback**: OpenAI GPT-4
- **Alternative Support**: LM Studio, Hugging Face

### Third-Party Integrations
- **Email**: SendGrid
- **Authentication**: JWT, bcrypt
- **File Processing**: Advanced PDF parsing