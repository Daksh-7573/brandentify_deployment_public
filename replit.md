# Brandentifier - AI-Powered Career Development Platform

## Overview
Brandentifier is an AI-driven career development platform that helps users build their professional brand, track career progress, and receive personalized guidance. It features an AI assistant, professional networking tools, and a personalized quest system for career development, social media engagement, and brand building. The platform utilizes local AI infrastructure for cost optimization and offers a free and premium subscription model, aiming to capture significant market share in the career development sector through advanced AI capabilities for personal branding.

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