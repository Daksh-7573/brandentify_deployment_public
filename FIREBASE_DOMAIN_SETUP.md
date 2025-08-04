# Firebase Domain Authorization Setup - URGENT ACTION REQUIRED

## Current Issue: Blank Popup Problem
The Google authentication popup opens but shows a **blank white page** and closes after 6-7 seconds. This happens because the current Replit domain is **NOT AUTHORIZED** in Firebase Console.

## REQUIRED ACTION (You Must Do This):
You need to add the current Replit domain to Firebase Console authorized domains:

### Step-by-Step Instructions:
1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your project: `brandentifier-app`**
3. **Navigate to: Authentication → Settings → Authorized domains**
4. **Click "Add domain" and add these domains:**
   - `25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev`
   - `*.replit.dev` (for future Replit domains)
   - `*.replit.app` (for deployed apps)

### Current Status:
- **Project ID**: brandentifier-app
- **Current Domain**: 25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev
- **Popup Behavior**: Opens blank, closes after 6-7 seconds (UNAUTHORIZED DOMAIN)
- **Logs Confirm**: Auth flow is working but Google can't display in unauthorized domain

### What's Happening:
1. ✅ Firebase initialization: Working
2. ✅ Google OAuth request: Working
3. ❌ **Google authentication page: Can't load in unauthorized domain**
4. ❌ Popup closes automatically due to domain restriction

### After Adding Domain:
The popup will show Google's login page instead of a blank screen, and authentication will complete successfully.

**This is the ONLY way to fix the blank popup issue - you must authorize the domain in Firebase Console.**