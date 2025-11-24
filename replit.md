# Brandentifier - AI-Powered Career Development Platform

## Overview
Brandentifier is an AI-driven career development platform designed to help users build their professional brand, track career progress, and receive personalized guidance. It incorporates an AI assistant, professional networking tools, and a personalized quest system for career development, social media engagement, and brand building. The platform utilizes local AI infrastructure to optimize costs while providing comprehensive insights and support for professional growth. Its business vision includes a free and premium subscription model to cater to a broad user base, aiming for significant market potential in the career development sector by offering advanced AI capabilities for personal branding.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend
- **Framework**: React with TypeScript, Vite
- **UI/Styling**: Radix UI, Tailwind CSS with glassmorphic design, consistent spacing, skeleton loading, dark theme, global background image.
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based with bcrypt
- **File Upload**: Replit App Storage (GCS-backed, CDN-delivered)
- **Object Storage**: Public visibility with owner-based ACLs.

### AI Infrastructure
- **Primary AI Provider**: VPS Ollama (Llama 3.2:1b) for cost-effective operation.
- **Fallback AI Provider**: Optional OpenAI for critical operations.
- **Caching**: Redis-based response caching.
- **Security**: AI prompt injection protection, content moderation.
- **Core AI Features**: Resume Analysis, Career Insights, Hashtag Suggestions, Predictive Modeling, Cross-User Intelligence, Emotional Intelligence, Cohort-Based Recommendations.
- **AI Personalization**: Dynamic Persona Switching (Mentor, Strategist, Coach), Proactive Suggestion Engine, Learning Pattern Recognition, Conversation Memory with context-aware responses, and utilization of user profile data for enhanced chat responses.

### Key Components
- **User Management**: Comprehensive profiles, secure JWT authentication, gamified profile building.
- **Content Management**: Pulses, Project Showcase, Nowboard (opportunity discovery), Career Goals.
- **Quest Generation System (V2)**: AI-powered system (using Ollama) generating personalized career and social media quests with structured metadata.
- **Career Intelligence Suite (Phase 1)**: AI-powered tools including Resume Scorer (analysis, fixes) and Job Description Matcher (match score, skill gaps, salary estimates).
- **Portfolio and Card Templates**: Multiple professional portfolio templates (e.g., Corporate Executive, Scholar) and visiting card templates (Professional, Quantum Tech).
- **Gamification**: AI-generated, impact-weighted, audience-driven Brand Quests, XP System, Badges, Progress Tracking.
- **Content Moderation**: Democratic flagging and AI-powered auto-deletion.
- **Deployment**: Docker, Kubernetes, Nginx, Redis, PostgreSQL (Neon serverless).
- **Subscription System**: Free and Premium tiers with tier-aware feature access control, Razorpay integration (for India), and dedicated subscription management pages.

### Feature Specifications
- **Quest System**: Quests include structured metadata for deliverables, quantity, platform, and guidance. Features internal platform engagement integration, audience-based platform selection, and brand goal alignment. Assigns 1-4 daily quests based on impact values, respecting a 60-minute daily time cap.
- **Intelligent Hashtag Generator**: 6-layer system for context-aware, audience-targeted hashtag suggestions.
- **Automated Quest Generation**: Robust three-layer failsafe system for daily quest auto-assignment.
- **Trend Intelligence System**: Real-time market trend ingestion with caching, industry/domain-specific tracking, AI-powered dynamic quest narrative generation, and full integration with quest personalization.
- **Feed Ranking System**: Time-decay algorithm and AI-powered personalization (using Ollama) for the Industry Pulse feed, incorporating user profile, interests, and engagement history with diversity filters.
- **Profile URL Standardization**: Uses `/@brandname` format for clean, memorable profile URLs with fallback to `/@username`.

## Subscription System (NEW ✨)
- **Free Tier**: ₹0 (10 reactions/day, 5 AI chats/month, 2 templates, social quests disabled)
- **Premium Tier**: ₹799/month or ₹7,999/year (20 reactions/day, unlimited AI, all features)
- **UI Pages Built**: Pricing (/pricing), Checkout (/checkout), Subscription Management (/subscription-manage)
- **Backend Endpoints**: Fully implemented subscription status, checkout, verify, and cancel endpoints
- **Payment Status**: Ready for Razorpay integration (final step)
- **Feature Gating**: All 14 premium features properly gated with feature-access system

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
- **Payment Gateway**: Razorpay (for subscription management) - READY FOR INTEGRATION
- **File Processing**: Advanced PDF parsing

## Automated Testing Suite (NEW ✨)
- **Quick Test**: `./scripts/quick-test.sh` - 24 essential endpoints (95% pass rate, ~30 seconds)
- **Comprehensive Suite**: `./scripts/test-suite.sh` - 40+ endpoints, 10 sections
- **Reaction Tests**: `./scripts/test-reactions.sh` - 10 dedicated reaction feature tests
- **Pre-Deployment Check**: `./scripts/pre-deployment-check.sh` - Full validation
- **Coverage**: User auth, Feed, Reactions (insightful/misinformed), Subscriptions, Career Tools, Services, Portfolio, Messaging, Notifications
- **Documentation**: See `AUTOMATED_TESTING_GUIDE.md` for complete guide

## Enhanced Musk Follow-up System (ENHANCED ✨)
- **Intent Classification**: 7-type intent classifier (clarify, probe, action, resource, confirm, alternative, close)
- **Template Database**: 22+ pre-written industry-specific templates (Technology, Finance, Healthcare, Marketing, Design, Education, Sales)
- **Structured Output**: JSON format with `{type, text, why, actionHint}` for better UX
- **Hybrid Generation**: Blends template-based and AI generation with Ollama fallback
- **Feedback Tracking**: `followup_feedback` table to track user reactions for model improvement
- **Database Tables**: 
  - `followup_templates`: Industry + Intent-specific templates (22 seeded)
  - `followup_feedback`: User feedback on suggested follow-ups
- **Service**: `server/services/intent-classifier.ts` with keyword-based rule matching
- **Updated Endpoint**: `/api/musk/contextual-suggestions` now returns structured JSON with intent classification