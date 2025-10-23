# Brandentifier - AI-Powered Career Development Platform

## Overview
Brandentifier is an AI-driven career development platform designed to help users build their professional brand, track career progress, and receive personalized guidance. It integrates an AI assistant and professional networking features, leveraging local AI infrastructure to optimize costs while maintaining full functionality. The platform aims to provide comprehensive insights and support for professional growth, offering personalized quest systems for career development, social media engagement, and brand building. The system intelligently assigns quests based on user goals, audience demographics, and impact scoring, ensuring relevant and effective guidance.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **File Upload**: Replit App Storage with Uppy (GCS-backed, CDN-delivered)
- **Object Storage**: Public visibility with owner-based ACL policies for user content

### AI Infrastructure
- **Primary Provider**: Local AI using Ollama (Llama 3.2:3b models) - **100% FREE**
- **Fallback**: Optional OpenAI integration for critical operations
- **Caching**: Redis-based response caching
- **Security**: AI prompt injection protection and content moderation
- **Core AI Features**: Musk AI Assistant for career guidance, Resume Analysis (PDF processing), Career Insights, Hashtag Suggestions, Predictive Career Modeling, Cross-User Intelligence, Emotional Intelligence, and Cohort-Based Recommendations.
- **AI Personalization**: Dynamic Persona Switching (Career Mentor, Strategist, Executive Coach), Proactive Suggestion Engine, Learning Pattern Recognition, and Conversation Memory with context-aware responses.
- **Personalized Musk Pulse System**: Automated **per-user** personalized news pulse generation (3x daily at 9 AM, 2 PM, 7 PM). Each user receives unique, tailored content based on their industry, domain, career goals, location, and interests. Uses **FREE local Ollama (Llama 3.2:3b)** instead of paid OpenAI = **$0.00 cost per pulse**. Pulses are stored with `target_user_id` for true personalization. Privacy-aware feed filtering ensures users only see their own personalized pulses. Intelligent link matching adds reference sources only when highly relevant. Context-aware based on user profile data: industry, domain, career goals, location, trending hashtags, and skills. **Status**: Fully operational with verified database persistence.

### Key Components
- **User Management**: Comprehensive profiles, secure JWT auth, gamified profile building.
- **Content Management**: Pulses (professional posts), Projects Showcase, Nowboard (opportunity discovery), Career Goals (milestone tracking).
- **Career Intelligence Suite (Phase 1 - LIVE)**: AI-powered career tools providing brutal, actionable advice:
  - **Resume Scorer**: Analyzes resumes with 0-100 score breakdown (ATS compatibility, impact metrics, keywords, structure, clarity). Generates ranked fixes by impact with one-click application. Real-time score updates.
  - **Job Description Matcher**: Parses job descriptions, calculates match score (0-100%), identifies matched/missing skills, generates gap analysis (critical/important/optional) with time estimates and fix strategies, provides application recommendations and salary estimates.
  - Database schema: `resume_scores`, `resume_fixes`, `job_matches` tables with proper indexes.
  - API endpoints: `/api/career-tools/*` for analysis, fix application, and match retrieval.
  - Protected route: `/career-tools` with tabbed interface for all tools.
  - Phase 2 (Coming): Skill Benchmark Engine, Pitch Deck Analyzer, Market Intelligence integration.
- **Portfolio Templates**: Professional portfolio builder with 12+ templates including:
  - Corporate Executive: Premium, high-end design for executives and industry experts
  - Scholar: Clean, knowledge-centric for students and early-career professionals
  - Timeline Storyteller: Interactive timeline with comprehensive career history
  - Visual Expert: Image-first for designers, photographers, marketers
  - Dynamic Innovator: Futuristic for AI experts, engineers, startups
  - Freelancer Hub: Colorful, expressive for freelancers and creators
  - Animated & Animated Odyssey: Motion-driven for motion designers and VFX artists
  - Designer Showcase: Neo-glass, modern for creative professionals
  - Photographer Portfolio: Animation-rich with camera effects
  - Pastel Dreamscape: Animated with unique graphics for modern creatives
  - Nature Creative: Nature-inspired with 5-layer parallax and full animations for eco-conscious professionals
  - Fashion Runway: High-fashion editorial with 3-layer parallax for fashion models and brand ambassadors
- **Gamification**: Brand Quests (AI-generated, impact-weighted, audience-driven, and goal-aligned), XP System, Badges, Progress Tracking.
- **Content Moderation**: Democratic flagging and AI-powered auto-deletion.
- **Deployment Strategy**: Docker for containerization, Kubernetes for orchestration (production), Nginx for load balancing, Redis for caching, PostgreSQL (Neon serverless) for database.

### Feature Specifications
- **Quest Specificity System**: Quests include structured metadata for deliverable format, quantity, platform constraints, and guidance.
- **Engagement Quest System**: Integrates internal platform engagement activities (reactions, comments, voting, sharing) into the career quest system with impact scoring.
- **Audience-Based Platform Selection**: Social quest platform recommendations are driven by the user's primary and secondary target audience demographics using a weighted scoring system.
- **Brand Goal Filtering**: Users receive quests strictly aligned with their selected Brand Goals, with intelligent intersection filtering based on focus areas.
- **Impact-Weighted Quest Assignment**: Dynamically allocates 1-4 quests daily based on predefined impact values (high, medium, quick win) and respects a 60-minute daily time cap.
- **Intelligent Hashtag Generator**: A 6-layer system for context-aware, audience-targeted hashtag suggestions based on user, audience, goal, platform, content, and geographic context.
- **Automated Quest Generation**: Robust three-layer failsafe system for daily quest auto-assignment via cron job, boot-time trigger, and hourly backup.
- **Trend Intelligence System (Fully Operational)**: Real-time market trend ingestion with pluggable adapter architecture (RSS feeds, internal analytics), 1-hour hot cache with 24-hour fallback, industry/domain-specific trend tracking, AI-powered dynamic quest narrative generation using Musk AI, hourly refresh scheduler with automated cleanup, and full integration with quest personalization service. Complete end-to-end flow: trend ingestion → caching → dynamic quest generation → quest assignment.
- **Fresh Feed Ranking System**: Time-decay algorithm ensures constant fresh content rotation in Industry Pulse feed. Formula: `reach_score × time_decay_factor` where decay multipliers are: <24h (1.0x), 24-48h (0.5x), 48h-7d (0.2x), >7d (0.05x). Older high-engagement posts automatically make way for newer content, preventing stale feed cycles.

## External Dependencies
### Core Infrastructure
- **Database**: PostgreSQL (Neon serverless)
- **Caching**: Redis
- **File Storage**: Replit App Storage (GCS-backed with CDN delivery)

### AI Services
- **Primary**: Ollama
- **Fallback**: OpenAI GPT-4
- **Alternative Support**: LM Studio, Hugging Face

### Third-Party Integrations
- **Email**: SendGrid
- **Authentication**: JWT, bcrypt
- **File Processing**: Advanced PDF parsing