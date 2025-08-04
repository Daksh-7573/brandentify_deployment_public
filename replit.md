# Brandentifier - AI-Powered Career Development Platform

## Overview
Brandentifier is an AI-driven career development platform that integrates professional networking with personalized guidance. Its core purpose is to help users build their professional brand, track career progress, and receive tailored advice via an integrated AI assistant. The system leverages local AI infrastructure to ensure cost-effective, high-functionality operations. The vision is to provide a comprehensive, intelligent platform for career growth and professional connection.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI with custom styling
- **Styling**: Tailwind CSS, utilizing a glassmorphic design system
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle
- **Authentication**: JWT-based with bcrypt
- **File Upload**: Express-fileupload with local storage

### AI Infrastructure
- **Primary AI**: Local AI using Ollama (Llama 3.2:3b models)
- **Fallback**: Optional OpenAI integration
- **Caching**: Redis-based for AI responses
- **Security**: AI prompt injection protection and content moderation

### Key Features
- **User Management**: Comprehensive profiles, secure JWT authentication, gamified profile completion.
- **AI-Powered Features**: Musk AI Assistant for career guidance, advanced resume analysis (PDF processing), data-driven career insights, hashtag suggestions.
- **Content Management**: "Pulses" (professional posts), project showcases, "Nowboard" for opportunity discovery, AI-generated career goal recommendations.
- **Gamification**: Brand Quests (weekly challenges), XP system, badges for achievements, progress tracking.
- **Content Moderation**: Community-based flagging, automated removal based on flag ratios, AI-driven content filtering.
- **Unified Visuals**: Consistent glass UI styling applied across the entire platform, including authentication pages, landing page, and all major content areas, featuring a global background image.
- **Loading Strategy**: Exclusive use of skeleton loading components throughout the application for consistent user experience.
- **Platform Spacing**: Standardized 12px gap between header and main content cards across all major platform pages for visual consistency.
- **Dynamic Content Links**: AI-generated content links now use verified, contextually relevant URLs to prevent 404 errors.
- **Personalized Feed**: Comprehensive full-stack personalized Industry Pulse feed with six personalization features (e.g., followed hashtags, mentor pulses, engagement-based content).
- **Career Capsule System**: Robust career goal creation with direct storage layer integration.
- **Brand Quests System**: Fully operational quest assignment, progress tracking, and XP rewards.
- **Conversation Memory**: JSON-based storage of interactions, follow-up rewriter, clarification trigger system for context-aware AI responses.
- **Enhanced Musk AI Intelligence (Phases 1-3)**:
    - **Phase 1**: Advanced model switching (to GPT-4 for complex queries), reference resolution, response quality assessment, enhanced context processing.
    - **Phase 2**: Dynamic persona switching (Career Mentor, Strategist, Executive Coach), proactive suggestion engine prioritizing Brandentifier features, learning user patterns for personalization.
    - **Phase 3**: Predictive career modeling, cross-user intelligence (learning from aggregated patterns), emotional intelligence (sentiment analysis), cohort-based recommendations.

### Deployment Strategy
- **Local Development**: Single Node.js process, local PostgreSQL/Redis, Ollama service.
- **Production Deployment**: Docker containerization, Kubernetes for orchestration (horizontal pod autoscaling), Nginx for load balancing, Redis cluster for caching.

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
- **File Processing**: Advanced PDF parsing libraries (for resume analysis)