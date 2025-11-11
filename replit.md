# Brandentifier - AI-Powered Career Development Platform

## Overview
Brandentifier is an AI-driven career development platform that helps users build their professional brand, track career progress, and receive personalized guidance. It features an AI assistant, professional networking tools, and a personalized quest system for career development, social media engagement, and brand building. The platform leverages local AI infrastructure to optimize costs while providing comprehensive insights and support for professional growth.

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
- **Core AI Features**: Musk AI Assistant, Resume Analysis, Career Insights, Hashtag Suggestions, Predictive Modeling, Cross-User Intelligence, Emotional Intelligence, Cohort-Based Recommendations.
- **AI Personalization**: Dynamic Persona Switching (Mentor, Strategist, Coach), Proactive Suggestion Engine, Learning Pattern Recognition, Conversation Memory with context-aware responses.
- **Enhanced Personalization**: AI chat responses and follow-up questions use actual user profile data (work experience, skills, education, projects, CV) with token-capping formatter utilities.
- **OpenAI to Ollama Migration**: All 8 critical AI services (pulse generation, hashtag suggestions, resume parsing, profile analysis, title suggestions, milestone generation, reference resolution, model switching) migrated to Ollama for cost savings, with graceful OpenAI fallback.
- **Personalized Musk Pulse System**: Automated, per-user personalized news pulse generation (3x daily in local timezone) based on user's profile, industry, domain, career goals, location, and interests using Ollama.

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