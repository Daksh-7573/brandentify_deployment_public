# Brandentifier Technical & Team Reference
## Comprehensive Platform Documentation

---

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [System Architecture](#system-architecture)
3. [Feature Modules](#feature-modules)
4. [Data Models](#data-models)
5. [AI Infrastructure](#ai-infrastructure)
6. [Authentication & Security](#authentication--security)
7. [Subscription System](#subscription-system)
8. [Portfolio System](#portfolio-system)
9. [Quest System](#quest-system)
10. [Operational Guide](#operational-guide)
11. [Development Guidelines](#development-guidelines)

---

## Platform Overview

### Mission
Brandentifier is an AI-driven career development platform helping users build professional brands, track career progress, and receive personalized guidance through advanced AI capabilities.

### Business Model
- **Freemium**: Core features free, premium features gated
- **Premium Pricing**: ₹799/month or ₹7,999/year
- **Payment Gateway**: Razorpay integration

### Target Market
- Career professionals seeking brand visibility
- Freelancers/consultants needing portfolio presence
- Job seekers requiring resume optimization
- Fresh graduates building first professional identity

---

## System Architecture

### Technology Stack

#### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool & Dev Server |
| Tailwind CSS | Styling |
| Radix UI | Component Primitives |
| TanStack Query v5 | Data Fetching & Caching |
| React Hook Form | Form Management |
| Wouter | Client-side Routing |
| Framer Motion | Animations |

#### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | HTTP Server |
| TypeScript | Type Safety |
| Drizzle ORM | Database Access |
| PostgreSQL (Neon) | Primary Database |
| Redis (ioredis) | Caching & Sessions |
| JWT | Authentication Tokens |
| bcrypt | Password Hashing |

#### AI Infrastructure
| Technology | Purpose |
|------------|---------|
| Ollama (Llama 3.2:1b) | Primary AI (Cost-efficient) |
| OpenAI GPT-4 | Fallback AI Provider |
| LM Studio | Alternative Local AI |
| Hugging Face | Model Integration |
| LangChain | AI Orchestration |

#### Storage & CDN
| Technology | Purpose |
|------------|---------|
| Replit App Storage | Object Storage (GCS-backed) |
| CDN Delivery | Asset Distribution |

### Directory Structure

```
brandentifier/
├── client/                    # Frontend Application
│   ├── src/
│   │   ├── components/        # React Components
│   │   │   ├── portfolio/     # Portfolio Templates
│   │   │   ├── ui/            # Shadcn UI Components
│   │   │   └── ...
│   │   ├── pages/             # Route Pages
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── lib/               # Utilities & Helpers
│   │   │   ├── feature-access.ts    # Premium Gating
│   │   │   └── queryClient.ts       # API Client
│   │   └── App.tsx            # Route Definitions
│   └── index.html
├── server/                    # Backend Application
│   ├── routes.ts              # API Endpoints
│   ├── storage.ts             # Database Interface
│   ├── vite.ts                # Vite Integration
│   ├── ai/                    # AI Services
│   ├── schedulers/            # Cron Jobs
│   └── index.ts               # Server Entry
├── shared/                    # Shared Code
│   └── schema.ts              # Drizzle Models & Zod Schemas
├── docs/                      # Documentation
└── replit.md                  # Project Summary
```

---

## Feature Modules

### 1. User Management
- **Registration/Login**: Email + password with bcrypt
- **Profile Building**: Comprehensive user profiles
- **Gamified Onboarding**: Persistent onboarding flow
- **Avatar/Media Upload**: Object storage integration

### 2. Musk AI Assistant
- **8-Layer Intelligence Framework**:
  1. Intent + Emotion + Stage Detection
  2. 360° User Memory Service
  3. Hybrid Knowledge Engine
  4. Structured Multi-Turn Conversation
  5. Conversation Goal Tracking
  6. Feedback-Based Ranking
  7. Tone Calibration
  8. Explainable Musk UI Banner

### 3. Quest System
- **Daily Quest Generation**: Automated at user's local midnight
- **Smart Quest Allocator**: 1-4 quests based on engagement
- **Quest Types**: Career and Social media quests
- **Gamification**: XP, badges, progress tracking

### 4. Portfolio System
- **Templates**: Holographic Neo, Creative Quantum, Artistic Portfolio
- **7 Sections**: Hero, About, Skills, Experience, Education, Projects, Services
- **Public URLs**: `/@brandname` or `/@username`
- **Premium Gating**: Services section premium-only

### 5. Career Intelligence
- **Resume Scorer**: AI-powered analysis
- **Job Description Matcher**: Opportunity alignment
- **Skill Gap Analysis**: Improvement recommendations

### 6. Content Features
- **Pulses**: Industry updates and posts
- **Project Showcase**: Work portfolio
- **Nowboard**: Current activities
- **Career Goals**: Goal tracking

### 7. Social Tools
- **Intelligent Hashtag Generator**: 6-layer context-aware system
- **Trend Intelligence**: Real-time market trends
- **Feed Ranking**: Time-decay + AI personalization

---

## Data Models

### Core Tables (shared/schema.ts)

#### Users
```typescript
{
  id: serial PRIMARY KEY,
  email: varchar UNIQUE NOT NULL,
  passwordHash: varchar,
  username: varchar UNIQUE,
  brandName: varchar,
  fullName: varchar,
  avatarUrl: varchar,
  tier: enum('free', 'premium'),
  timezone: varchar,
  // ... extensive profile fields
}
```

#### Skills
```typescript
{
  id: serial PRIMARY KEY,
  userId: integer REFERENCES users,
  name: varchar NOT NULL,
  category: varchar,
  proficiencyLevel: integer, // 1-5
  yearsOfExperience: integer,
}
```

#### Work Experience
```typescript
{
  id: serial PRIMARY KEY,
  userId: integer REFERENCES users,
  company: varchar NOT NULL,
  role: varchar NOT NULL,
  startDate: date,
  endDate: date,
  isCurrent: boolean,
  description: text,
  achievements: text[],
}
```

#### Education
```typescript
{
  id: serial PRIMARY KEY,
  userId: integer REFERENCES users,
  institution: varchar NOT NULL,
  degree: varchar,
  fieldOfStudy: varchar,
  startYear: integer,
  endYear: integer,
  skills: text[],
}
```

#### Projects
```typescript
{
  id: serial PRIMARY KEY,
  userId: integer REFERENCES users,
  title: varchar NOT NULL,
  description: text,
  category: varchar,
  industry: varchar,
  thumbnailUrl: varchar,
  mediaUrls: text[],
  projectUrl: varchar,
}
```

#### Services (Premium)
```typescript
{
  id: serial PRIMARY KEY,
  userId: integer REFERENCES users,
  title: varchar NOT NULL,
  description: text,
  category: varchar,
  priceInr: integer,
  priceUsd: integer,
  isHourly: boolean,
  features: text[],
  isActive: boolean,
}
```

#### Quests
```typescript
{
  id: serial PRIMARY KEY,
  userId: integer REFERENCES users,
  questId: varchar NOT NULL,
  title: varchar NOT NULL,
  description: text,
  type: enum('career', 'social'),
  xpReward: integer,
  isCompleted: boolean,
  assignedDate: date,
  expiresAt: timestamp,
}
```

#### Subscriptions
```typescript
{
  id: serial PRIMARY KEY,
  userId: integer REFERENCES users,
  plan: enum('monthly', 'yearly'),
  status: enum('active', 'cancelled', 'expired'),
  startDate: timestamp,
  endDate: timestamp,
  razorpaySubscriptionId: varchar,
}
```

---

## AI Infrastructure

### Primary AI: VPS Ollama
- **Model**: Llama 3.2:1b (lightweight, fast)
- **Use Case**: Majority of AI interactions
- **Cost**: Self-hosted, minimal per-request cost

### Fallback: OpenAI
- **Model**: GPT-4 (optional)
- **Use Case**: Complex queries, fallback
- **Trigger**: When Ollama unavailable or for premium features

### AI Services

#### Musk AI Assistant (`server/ai/`)
- Emotional intelligence layer
- Conversation memory
- Goal tracking
- Dynamic persona switching

#### Quest Generation (`server/schedulers/`)
- `comprehensive-quest-generator-v2.ts`: Career quests
- `social-quest-generator-v2.ts`: Social media quests
- Context-aware quest creation based on user profile

#### Resume Analysis
- PDF parsing (pdf-parse, pdfjs-dist)
- Keyword extraction
- Industry-specific scoring

#### Hashtag Generator
- 6-layer processing:
  1. Content analysis
  2. Industry context
  3. Audience targeting
  4. Trend alignment
  5. Platform optimization
  6. Engagement prediction

### Caching Strategy
- Redis-based response caching
- Reduces AI API calls
- Improves response time

---

## Authentication & Security

### Authentication Flow
1. User registers with email/password
2. Password hashed with bcrypt
3. JWT token issued on login
4. Token stored in HTTP-only cookie
5. Session validated on each request

### Security Measures
- **Password**: bcrypt with salt rounds
- **Sessions**: JWT with expiration
- **CORS**: Configured for allowed origins
- **Helmet**: HTTP security headers
- **Rate Limiting**: express-rate-limit
- **Input Validation**: Zod schemas
- **XSS Protection**: xss-clean middleware
- **AI Prompt Injection**: Content moderation

### Protected Routes
```typescript
// Middleware for authenticated routes
const requireAuth = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization;
  // Verify JWT and attach user to request
};
```

---

## Subscription System

### Tiers

#### Free Tier
- Basic Musk AI (limited daily interactions)
- 1-2 daily quests
- Basic portfolio template
- Basic resume score
- Limited social quests

#### Premium Tier (₹799/month or ₹7,999/year)
- Unlimited Musk AI
- 1-4 daily quests
- All portfolio templates
- Services section in portfolio
- Detailed resume analysis
- Full social quests
- Priority support

### Feature Gating (`client/src/lib/feature-access.ts`)
```typescript
export const featureAccess = {
  unlimitedAI: (tier) => tier === 'premium',
  allTemplates: (tier) => tier === 'premium',
  servicesSection: (tier) => tier === 'premium',
  advancedResume: (tier) => tier === 'premium',
  socialQuests: (tier) => tier === 'premium',
};
```

### Razorpay Integration
- Subscription creation
- Webhook handling for payment events
- Automatic tier updates on payment success

---

## Portfolio System

### Template Architecture

Each template is a React component in `client/src/components/portfolio/templates/`

#### Available Templates

| Template | Aesthetic | Key Features |
|----------|-----------|--------------|
| Holographic Neo | Neon/Quantum | Glassmorphism, floating particles, cyan/purple |
| Creative Quantum | Tech/Circuit | Grid overlay, SVG patterns, dark theme |
| Artistic Portfolio | Warm/Organic | Torn-paper edges, pastel colors, scrapbook |

### Template Registry (`templateRegistry.tsx`)
```typescript
export const portfolioTemplates = {
  'holographic-neo': {
    id: 'holographic-neo',
    name: 'Holographic Neo',
    component: HolographicNeo,
    isPremium: false,
  },
  'creative-quantum': {
    id: 'creative-quantum',
    name: 'Creative Quantum',
    component: CreativeQuantum,
    isPremium: true,
  },
  'artistic-portfolio': {
    id: 'artistic-portfolio',
    name: 'Artistic Portfolio',
    component: ArtisticPortfolio,
    isPremium: true,
  },
};
```

### 7 Portfolio Sections
1. **Hero Header**: Name, title, avatar, tagline, CTA buttons
2. **About/Snapshot**: Bio, vision, mission, core values
3. **Skills Grid**: Skills with proficiency levels
4. **Work Experience**: Timeline with achievements
5. **Education**: Degrees and skills acquired
6. **Projects Gallery**: Work samples with modal details
7. **Services** (Premium): Offerings with pricing

### Public URL Format
- Primary: `/@brandname`
- Fallback: `/@username`
- Resolution logic in router

---

## Quest System

### How It Works

1. **Scheduler** (`timezone-aware-quest-scheduler.ts`): Runs every 15 minutes
2. **Checks**: Users whose `nextQuestAssignmentTime` has passed
3. **Generates**: 1-4 quests based on Smart Quest Allocator
4. **Assigns**: Quests with 24-hour expiration
5. **Updates**: `nextQuestAssignmentTime` to next midnight

### Smart Quest Allocator
```typescript
function getAllocatedQuestCount(user) {
  // Based on:
  // - User engagement level
  // - Streak history
  // - Profile completeness
  // Returns: 1-4 quests
}
```

### Quest Types

#### Career Quests
- Profile optimization
- Resume improvements
- Skill development
- Networking actions
- Content creation

#### Social Quests
- LinkedIn engagement
- Content sharing
- Hashtag usage
- Community interaction

### Timing
- **Expiry**: 12:00:00 AM local time
- **Assignment**: 12:00:01 AM local time (1-second gap)
- **Backup**: Daily scheduler at 12:01 AM UTC

---

## Operational Guide

### Starting the Application
```bash
npm run dev
# Starts Express + Vite on port 5000
```

### Database Operations
```bash
# Push schema changes (never manual migrations)
npm run db:push

# Force push (with data-loss warning)
npm run db:push --force
```

### Environment Variables

#### Required Secrets
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key (optional fallback)
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`: Storage bucket
- `PRIVATE_OBJECT_DIR`: Private file storage path
- `PUBLIC_OBJECT_SEARCH_PATHS`: Public asset paths

#### Payment (Required for Subscriptions)
- `RAZORPAY_KEY_ID`: Razorpay public key
- `RAZORPAY_KEY_SECRET`: Razorpay secret key

### Schedulers

| Scheduler | Frequency | Purpose |
|-----------|-----------|---------|
| Quest Scheduler | Every 15 min | Timezone-aware quest assignment |
| Daily Backup | 12:01 AM UTC | Ensure all users get quests |

### Monitoring Considerations
- AI response times
- Quest assignment success rate
- Subscription conversion rates
- API error rates

---

## Development Guidelines

### Code Conventions
1. TypeScript strict mode
2. Zod for runtime validation
3. Drizzle for database access
4. React Query for data fetching
5. Shadcn UI for components

### File Naming
- Components: PascalCase (`ProfileCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Styles: Tailwind classes inline

### API Pattern
```typescript
// Route handler
app.post('/api/resource', requireAuth, async (req, res) => {
  const validated = insertResourceSchema.parse(req.body);
  const result = await storage.createResource(validated);
  res.json(result);
});
```

### Frontend Data Fetching
```typescript
// Using TanStack Query v5
const { data, isLoading } = useQuery({
  queryKey: ['/api/resource', id],
});

// Mutations
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/resource', { method: 'POST', body: data }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/resource'] }),
});
```

### Testing Checklist
- [ ] Feature works on free tier
- [ ] Feature properly gated for premium
- [ ] Mobile responsive
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Data validation passes

---

## Troubleshooting

### Common Issues

#### Quests Not Generating
1. Check user has `timezone` set (defaults to UTC)
2. Verify `nextQuestAssignmentTime` is initialized
3. Check scheduler logs for errors

#### Portfolio Not Loading
1. Verify user data exists
2. Check template is registered
3. Confirm premium gating for premium templates

#### AI Not Responding
1. Check Ollama connection
2. Verify OpenAI fallback configured
3. Review Redis cache status

### Log Locations
- Server logs: Console output
- Database: Neon dashboard
- Storage: Replit Object Storage panel

---

## Roadmap Considerations

### Potential Enhancements
- Additional portfolio templates
- Video content in portfolios
- AI-generated cover letters
- Job board integration
- Community features
- Mobile app

### Technical Debt
- Comprehensive test coverage
- Performance monitoring
- Error tracking integration
- Documentation updates

---

*Document Version: 1.0*
*Last Updated: December 2024*
*For: Development Team Reference*
