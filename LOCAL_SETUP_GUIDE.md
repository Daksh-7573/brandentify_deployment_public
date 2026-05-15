# Brandentifier - Local Setup Guide

## 🎉 Project Successfully Downloaded from Replit!

This guide will help you get Brandentifier running on your local Windows PC.

---

## 📋 Prerequisites

### Required Software
- ✅ **Node.js** (v22.20.0 installed) 
- ✅ **npm** (v11.5.2 installed)
- ⚠️ **PostgreSQL** (Required - needs setup)
- 🔧 **Redis** (Optional - for caching)

### Optional AI Services
- **OpenAI API Key** (for AI features) OR
- **Ollama** (free local AI alternative)

---

## 🚀 Quick Start

### Step 1: Dependencies ✅ COMPLETED
Dependencies have already been installed with `npm install`.

### Step 2: Database Setup ⚠️ REQUIRED

You need a PostgreSQL database. Choose one option:

#### Option A: Local PostgreSQL
1. Download and install PostgreSQL from https://www.postgresql.org/download/windows/
2. During installation, set a password for the `postgres` user
3. Create a new database:
   ```bash
   # Open PostgreSQL command line (psql)
   psql -U postgres
   
   # Create database
   CREATE DATABASE brandentifier;
   
   # Exit
   \q
   ```
4. Update `.env` file with your connection string:
   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/brandentifier
   ```

#### Option B: Neon Serverless (Cloud - Free Tier)
1. Go to https://neon.tech and create a free account
2. Create a new project called "Brandentifier"
3. Copy the connection string
4. Update `.env` file with the connection string

### Step 3: Configure Environment Variables

Edit the `.env` file in the project root:

```env
# REQUIRED: Add your database connection string
DATABASE_URL=postgresql://username:password@localhost:5432/brandentifier

# REQUIRED: Keep this or generate a new random string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OPTIONAL: Add OpenAI API key for AI features
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Step 4: Initialize Database Schema

Run the database migration to create all tables:

```bash
npm run db:push
```

### Step 5: Start the Development Server

```bash
npm run dev
```

The application will start on:
- **Frontend**: http://localhost:5001
- **Backend API**: http://localhost:5000

---

## 🔧 Configuration Options

### AI Services

#### Option 1: OpenAI (Recommended for testing)
1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env`:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

#### Option 2: Local AI with Ollama (Free)
1. Install Ollama from https://ollama.ai
2. Pull the model: `ollama pull llama3.2:3b`
3. Update `.env`:
   ```env
   AI_PROVIDER=ollama
   AI_BASE_URL=http://localhost:11434
   AI_MODEL=llama3.2:3b
   AI_FALLBACK_OPENAI=false
   ```

### Redis (Optional - for caching)
1. Install Redis for Windows: https://github.com/microsoftarchive/redis/releases
2. Start Redis server
3. Add to `.env`:
   ```env
   REDIS_URL=redis://localhost:6379
   ```

### Google OAuth (Optional)
1. Create project at https://console.cloud.google.com
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

---

## 📁 Project Structure

```
Brandentifier/
├── client/           # React frontend (TypeScript + Vite)
├── server/           # Express backend (TypeScript)
├── shared/           # Shared types and schemas
├── public/           # Static assets
├── uploads/          # User uploaded files
├── .env              # Environment variables (DO NOT COMMIT)
├── package.json      # Dependencies and scripts
└── vite.config.ts    # Vite configuration
```

---

## 🎯 Available Scripts

```bash
# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database migration
npm run db:push
```

---

## 🐛 Troubleshooting

### Issue: "DATABASE_URL is not defined"
**Solution**: Make sure you've added `DATABASE_URL` to your `.env` file.

### Issue: "Cannot connect to database"
**Solution**: 
- Verify PostgreSQL is running
- Check your connection string is correct
- Test connection: `psql -U postgres -d brandentifier`

### Issue: "Port 5000 already in use"
**Solution**: 
- Find and kill the process using port 5000
- Or change the port in `.env`: `PORT=5001`

### Issue: "Module not found" errors
**Solution**: 
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: AI features not working
**Solution**: 
- Verify `OPENAI_API_KEY` is set in `.env`
- Check API key is valid at https://platform.openai.com
- Or install and configure Ollama for local AI

---

## 🔐 Security Notes

- **Never commit `.env` file** - it contains sensitive credentials
- Change `JWT_SECRET` to a random string for production
- Keep API keys secure and rotate them regularly
- Use environment-specific `.env` files for different environments

---

## 📚 Additional Resources

- **Project Documentation**: See `replit.md` for detailed feature list
- **AI Setup**: See `LOCAL_AI_SETUP.md` for local AI configuration
- **Database Schema**: See `shared/schema.ts` for database structure
- **API Routes**: See `server/routes.ts` for available endpoints

---

## ✅ Next Steps

1. ✅ Dependencies installed
2. ⚠️ Set up PostgreSQL database
3. ⚠️ Configure `.env` file with DATABASE_URL
4. ⚠️ Run `npm run db:push` to create database tables
5. ⚠️ Run `npm run dev` to start the application
6. 🎉 Open http://localhost:5001 in your browser

---

## 💡 Tips

- Use **VS Code** for the best development experience
- Install recommended extensions: ESLint, Prettier, TypeScript
- Check the browser console for frontend errors
- Check the terminal for backend errors
- The app uses **Tailwind CSS** for styling
- The app uses **Radix UI** for components

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review the error messages in the terminal
3. Check the browser console for frontend errors
4. Verify all environment variables are set correctly
5. Ensure PostgreSQL is running and accessible

---

**Happy Coding! 🚀**
