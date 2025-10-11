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
- **Trend Intelligence System (Implemented MVP)**: Real-time market trend ingestion with pluggable adapter architecture, 1-hour hot cache with 24-hour fallback, industry/domain-specific trend tracking, AI-powered dynamic quest narrative generation using Musk AI, and hourly refresh scheduler with automated cleanup. Core infrastructure complete, pending full integration with quest personalization service.

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