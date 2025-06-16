# Brandentifier - AI-Powered Career Development Platform

## Overview

Brandentifier is a comprehensive career development platform that combines AI-driven insights with professional networking features. The platform helps users build their professional brand, track career progress, and receive personalized guidance through an integrated Musk AI assistant. The system has been migrated from OpenAI to local AI infrastructure to eliminate API costs while maintaining full functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI components with custom styling
- **Styling**: Tailwind CSS with glassmorphic design system
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle for type-safe database operations
- **Authentication**: JWT-based with bcrypt password hashing
- **File Upload**: Express-fileupload with local storage

### AI Infrastructure
- **Primary Provider**: Local AI using Ollama (replacing OpenAI)
- **Models**: Llama 3.2:3b for cost-effective inference
- **Fallback**: Optional OpenAI integration for critical operations
- **Caching**: Redis-based response caching
- **Security**: AI prompt injection protection and content moderation

## Key Components

### User Management System
- **Profile System**: Comprehensive user profiles with work experience, education, skills, and services
- **Authentication**: Secure JWT-based auth with email verification
- **Profile Completion**: Gamified profile building with progress tracking

### AI-Powered Features
- **Musk AI Assistant**: Career guidance and professional development advice
- **Resume Analysis**: Advanced PDF processing with design-aware content extraction
- **Career Insights**: Data-driven recommendations based on industry trends
- **Hashtag Suggestions**: Personalized hashtag recommendations for professional content

### Content Management
- **Pulses**: Professional posts with industry categorization
- **Projects Showcase**: Portfolio management with media uploads
- **Nowboard**: Opportunity discovery and career planning
- **Career Goals**: Milestone tracking with AI-generated recommendations

### Gamification System
- **Brand Quests**: Weekly challenges to encourage platform engagement
- **XP System**: Experience points for completed activities
- **Badges**: Achievement system for career milestones
- **Progress Tracking**: Visual progress indicators throughout the platform

### Content Moderation
- **Democratic Flagging**: Community-based content moderation
- **Auto-deletion**: Automated removal based on flag-to-view ratios
- **AI Security**: Prompt injection protection and content filtering

## Data Flow

### User Registration and Onboarding
1. User creates account with email verification
2. Profile completion wizard guides through essential information
3. AI generates initial career recommendations based on profile data
4. Quest system assigns weekly challenges to encourage engagement

### AI-Powered Career Guidance
1. User submits career-related questions or uploads resume
2. Local AI service processes request using Llama models
3. Enhanced prompts incorporate industry data and user context
4. Responses cached in Redis for improved performance
5. Fallback to OpenAI if local processing fails

### Content Creation and Moderation
1. Users create pulses, projects, or other content
2. AI security middleware screens for inappropriate content
3. Community flagging system tracks problematic content
4. Auto-deletion algorithm removes content based on democratic voting
5. Content feeds personalized based on user interests and connections

## External Dependencies

### Core Infrastructure
- **Database**: PostgreSQL (Neon serverless)
- **Caching**: Redis for session management and AI response caching
- **File Storage**: Local filesystem with organized directory structure

### AI Services
- **Primary**: Ollama with local Llama models
- **Fallback**: OpenAI GPT-4 for critical operations
- **Alternative**: Support for LM Studio and Hugging Face

### Third-Party Integrations
- **Email**: SendGrid for transactional emails
- **Authentication**: JWT with bcrypt for secure password handling
- **File Processing**: Advanced PDF parsing for resume analysis

### Development Tools
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes configurations for scaling
- **Load Balancing**: Nginx with rate limiting and compression
- **Monitoring**: Health check endpoints and performance tracking

## Deployment Strategy

### Local Development
- Single Node.js process with hot reloading
- Local PostgreSQL and Redis instances
- Ollama service for AI inference
- File uploads stored in local public directory

### Production Deployment
- **Containerization**: Multi-stage Docker builds for optimization
- **Orchestration**: Kubernetes with horizontal pod autoscaling (3-20 replicas)
- **Load Balancing**: Nginx with rate limiting and security headers
- **Database**: Connection pooling with 5-20 concurrent connections
- **Caching**: Redis cluster for session management and AI response caching
- **Health Monitoring**: Automated health checks and performance metrics

### Enterprise Scaling
- Auto-scaling based on CPU/memory usage
- Persistent volume claims for file uploads
- Redis deployment with password protection
- Comprehensive monitoring and alerting system

## Recent Changes

### Enhanced Musk AI Intelligence System (In Progress)
- **Date**: June 16, 2025
- **Status**: Phase 1 Implementation Started
- **Goal**: Transform Musk from basic chatbot to sophisticated career coaching system with multiple specialized personas
- **Key Features**:
  - Intent classification for role-specific responses
  - Multiple advisor personas (The Strategist, The Coach, The Expert)
  - Mood-adaptive responses based on user confidence levels
  - Industry-specific mentoring overlays
  - Proactive engagement and suggestion engine
- **Implementation Strategy**: Parallel development to avoid disrupting existing functionality

## Changelog
- June 16, 2025: Enhanced Musk AI persona system implementation started
- June 16, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.