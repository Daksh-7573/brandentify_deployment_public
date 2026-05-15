# ✅ FIXED: Windows Environment Variable Issue

## What Was the Problem?

The `npm run dev` command was failing with:
```
'NODE_ENV' is not recognized as an internal or external command
```

This happened because the package.json was using Unix/Linux syntax for environment variables, which doesn't work on Windows PowerShell.

## ✅ Solution Applied

I've installed `cross-env` and updated the package.json scripts to work on Windows, Mac, and Linux.

**Changes made:**
- Installed `cross-env` package
- Updated `dev` script: `cross-env NODE_ENV=development tsx server/index.ts`
- Updated `start` script: `cross-env NODE_ENV=production node dist/index.js`

---

## ⚠️ Next Issue: Database Configuration Required

Before you can run `npm run dev`, you need to configure your database connection.

### Option 1: Use Local PostgreSQL (Recommended for Development)

**Step 1: Create the database**
```powershell
# You'll be prompted for your PostgreSQL password
psql -U postgres -c "CREATE DATABASE brandentifier;"
```

**Step 2: Update .env file (line 7)**
Replace:
```env
DATABASE_URL=
```

With (replace `YOUR_PASSWORD` with your actual PostgreSQL password):
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/brandentifier
```

**Example:**
```env
DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/brandentifier
```

**Step 3: Initialize database schema**
```powershell
npm run db:push
```

**Step 4: Start the server**
```powershell
npm run dev
```

---

### Option 2: Use Neon Serverless (Cloud Database - Free Tier)

If you don't want to set up local PostgreSQL or don't remember your password:

**Step 1: Create Neon account**
1. Go to https://neon.tech
2. Sign up for free
3. Create a new project called "Brandentifier"

**Step 2: Get connection string**
1. In Neon dashboard, click "Connection Details"
2. Copy the connection string (starts with `postgresql://`)

**Step 3: Update .env file**
```env
DATABASE_URL=postgresql://your-neon-connection-string-here
```

**Step 4: Initialize database schema**
```powershell
npm run db:push
```

**Step 5: Start the server**
```powershell
npm run dev
```

---

## 🚀 Quick Start Commands

Once DATABASE_URL is configured:

```powershell
# Create database (if using local PostgreSQL)
psql -U postgres -c "CREATE DATABASE brandentifier;"

# Push database schema
npm run db:push

# Start development server
npm run dev
```

---

## 📍 Current Status

✅ Project downloaded from Replit
✅ Dependencies installed
✅ Environment file created
✅ **Windows compatibility fixed** (cross-env installed)
⚠️ **DATABASE_URL needs to be configured** (see options above)
⚠️ Database schema needs to be pushed
⚠️ Server ready to start

---

## 💡 Don't Know Your PostgreSQL Password?

### Check if you can connect without password:
```powershell
psql -U postgres -d postgres
```

If it connects without asking for a password, your PostgreSQL might be configured for trusted local connections.

### If you need to reset your password:
1. Find `pg_hba.conf` file (usually in `C:\Program Files\PostgreSQL\18\data\`)
2. Change authentication method to `trust` temporarily
3. Restart PostgreSQL service
4. Set new password:
   ```sql
   ALTER USER postgres PASSWORD 'new_password';
   ```
5. Change `pg_hba.conf` back to `md5` or `scram-sha-256`
6. Restart PostgreSQL service

---

## 🆘 Need Help?

If you're stuck:
1. **Don't remember PostgreSQL password?** → Use Neon (Option 2)
2. **PostgreSQL not working?** → Use Neon (Option 2)
3. **Want simplest setup?** → Use Neon (Option 2)

Neon is free, cloud-based, and requires no local setup!

---

**Next Step:** Choose Option 1 or Option 2 above and configure your DATABASE_URL! 🚀
