# Brandentifier - AI-Powered Career Development Platform

## Overview
Brandentifier is an AI-driven career development platform designed to help users build their professional brand, track career progress, and receive personalized guidance. It integrates an AI assistant and professional networking features, leveraging local AI infrastructure to optimize costs while maintaining full functionality. The platform aims to provide comprehensive insights and support for professional growth.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
Latest modifications with dates

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