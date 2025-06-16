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

### Enhanced Musk AI Intelligence System (Complete with Advanced Model Switching)
- **Date**: June 16, 2025
- **Status**: Full Implementation Complete with Enhanced Model Switching
- **Goal**: Transform Musk from basic chatbot to sophisticated career coaching system with intelligent model selection and advanced reasoning
- **Completed Features**:
  - **Advanced Model Switching Logic**: Intelligent analysis of query complexity with automatic routing to OpenAI GPT-4 for complex strategic questions
  - **Reference Resolution Engine**: Resolves pronouns and contextual terms using conversation history (e.g., "that approach" → specific strategy mentioned earlier)
  - **Response Quality Assessment**: Real-time evaluation of coherence, relevance, and completeness with quality scoring
  - **Enhanced Context Processing**: Processes user messages through reference resolution before analysis
  - Intent classification with 14 distinct intent types including clarification and active guidance
  - Three specialized advisor personas with complexity-based selection
  - Conversation memory system with 3-5 exchange history tracking
  - **Brandentifier-first prioritization**: All suggestions prioritize platform features
  - **Question-specific response engine**: Tailored advice for all career-related queries
  - Industry-specific mentoring with enhanced contextual understanding
  - Backward compatibility maintained with graceful fallback systems
- **Technical Implementation**: 
  - Model switching service with complexity analysis and quality assessment
  - Reference resolution service with semantic analysis
  - Enhanced prompt generation with conversation context
  - Fallback mechanisms for API limitations
- **Performance**: Successfully detects complex queries, applies reference resolution, and maintains conversation context while ensuring Brandentifier recommendations appear first

## Changelog
- June 16, 2025: **OpenAI-Powered Networking Responses COMPLETED** - Successfully restored corrupted enhanced-musk-intelligence.ts file and fixed all networking question responses to use OpenAI GPT-4 for dynamic, personalized advice. System now generates comprehensive networking guidance specific to user's industry, role, and location while prioritizing Brandentifier platform features first. All compilation errors resolved and application running successfully.
- June 16, 2025: **Static Response Issue RESOLVED** - Fixed critical issue where Musk AI was providing static answers instead of dynamic responses. System now uses direct OpenAI integration for all career guidance, generating personalized 2,000+ character responses with industry-specific insights. Enhanced intelligence system fully operational with AI model switching, reference resolution, and conversation memory.
- June 16, 2025: **Conversation Memory System completed** - Implemented comprehensive conversation context retention with follow-up detection, clarification loops, and active guidance for complex tasks. System now maintains 3-5 exchange history per user, detects vague references like "both" or "that", provides structured guidance for resume/portfolio tasks, and ensures context-aware responses while maintaining Brandentifier-first prioritization
- June 16, 2025: **Follow-up question individual response system completed** - Fixed platform comparison question detection by moving it to highest priority in question classification logic, all follow-up questions now receive specific, tailored responses instead of falling back to generic profile enhancement advice
- June 16, 2025: **LinkedIn-specific networking detection enhanced** - Added comprehensive typo detection for "netowrk" and similar variations, LinkedIn networking questions now provide detailed platform-specific strategies for director-level professionals
- June 16, 2025: **Platform comparison prioritization implemented** - Questions like "what is the best platform from all these?" now correctly prioritize Brandentifier first with comprehensive platform ranking and strategic recommendations
- June 16, 2025: Brandentifier networking question issue resolved - added "netowrk" typo detection and Brandentifier-specific networking guidance, questions about networking on Brandentifier now provide comprehensive platform-specific advice instead of generic profile enhancement responses
- June 16, 2025: Networking question detection fixed - enhanced detection for "nework" typos and platform-specific queries, separated profile questions from networking questions, all follow-up questions including networking platforms now provide dynamic, specific responses instead of static generic advice
- June 16, 2025: Static answer issue resolved - fixed career question detection logic, separated profile enhancement from career-specific questions, all 8 question types (portfolio, skills, experience, networking, resume, job application, career change, job search goals) now provide dynamic, personalized responses instead of static generic advice
- June 16, 2025: Job application question system completed - fixed syntax error in conditional logic, all 6 question types (portfolio, skills, experience, networking, resume, job application) now provide detailed, personalized advice based on user profile
- June 16, 2025: Question-specific response system completed - resume creation, portfolio layout, skills improvement, experience showcase, and networking questions now provide tailored advice instead of generic responses
- June 16, 2025: Brandentifier-first prioritization system completed - all proactive suggestions now lead with Brandentifier features as requested
- June 16, 2025: Enhanced Musk AI persona system Phase 1 completed - intent classification, three advisor personas, context enrichment, and proactive suggestions operational
- June 16, 2025: Enhanced Musk AI persona system implementation started
- June 16, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.