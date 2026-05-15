# Brandentifier

An AI-powered career development platform focused on professional brand building, career tracking, and personalized guidance.

## 🚀 Quick Start (Local Development)

### Prerequisites
- ✅ Node.js v22+ (Installed: v22.20.0)
- ✅ PostgreSQL 18+ (Installed: v18.1)
- ✅ npm (Installed: v11.5.2)

### Setup Instructions

1. **Configure Environment**
   ```bash
   # Edit .env file and add your PostgreSQL password
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/brandentifier
   ```

2. **Create Database**
   ```bash
   psql -U postgres -c "CREATE DATABASE brandentifier;"
   ```

3. **Initialize Database Schema**
   ```bash
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5001
   - Backend: http://localhost:5000

### Automated Setup

For easier setup, use the provided script:
```powershell
.\setup.ps1
```

## 📚 Documentation

- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Immediate action items
- **[LOCAL_SETUP_GUIDE.md](LOCAL_SETUP_GUIDE.md)** - Comprehensive setup guide
- **[SETUP_SUMMARY.md](SETUP_SUMMARY.md)** - Setup progress summary
- **[replit.md](replit.md)** - Full project documentation

## 🎯 Features

- 🤖 AI Career Assistant (Musk Chat)
- 📊 Resume Analysis & Scoring
- 🎮 Gamified Quest System
- 💼 Professional Portfolio Builder
- 📱 Social Networking (Industry Pulse)
- 🎨 Multiple Design Templates
- 🔐 Secure Authentication (JWT + OAuth)
- 💳 Subscription System (Razorpay)
- 🏆 XP & Badge System

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS + Radix UI
- TanStack React Query
- React Hook Form + Zod

### Backend
- Node.js + Express
- TypeScript (ESM)
- PostgreSQL + Drizzle ORM
- JWT Authentication

### AI Services
- OpenAI GPT-4 (Primary)
- Ollama (Local alternative)
- Redis (Caching)

## 📁 Project Structure

```
Brandentifier/
├── client/           # React frontend
├── server/           # Express backend
├── shared/           # Shared types & schemas
├── public/           # Static assets
├── uploads/          # User uploaded files
├── .env              # Environment variables
└── package.json      # Dependencies
```

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run check    # TypeScript type checking
npm run db:push  # Push database schema changes
```

## 🌐 Environment Variables

See `.env` file for all configuration options. Required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `OPENAI_API_KEY` - OpenAI API key (optional, for AI features)

## 🤝 Contributing

This is a personal project. For questions or issues, please refer to the documentation.

## 📄 License

MIT

---

**Status**: ✅ Ready for local development
**Last Updated**: 2026-01-26
