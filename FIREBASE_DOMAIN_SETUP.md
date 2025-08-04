# Firebase Domain Authorization Setup

## Current Issue
Google authentication is failing with "popup-closed-by-user" error because the current Replit domain is not authorized in Firebase Console.

## Required Action
You need to add the current Replit domain to Firebase Console authorized domains:

### Steps:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `brandentifier-app`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:
   - `25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev`
   - `*.replit.dev`
   - `*.replit.app`

### Current Configuration:
- **Project ID**: brandentifier-app
- **Current Domain**: 25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev
- **Auth Domain**: Using current domain for Replit compatibility

### Current Issue - White Screen Popup:
The Google authentication popup shows a white screen instead of the account selection dialog. This happens because:

1. **Domain Authorization**: The current Replit domain is not authorized in Firebase Console
2. **Popup Blocking**: Google OAuth servers reject unauthorized domains with blank popups

### Immediate Solutions:

**Option 1: Domain Authorization (Recommended)**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `brandentifier-app`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add: `25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev`
5. Add: `*.replit.dev` and `*.replit.app`

**Option 2: Redirect Authentication (Alternative)**
- Use `/auth-popup-fix` page to test redirect-based authentication
- This bypasses popup issues entirely

### Test Status:
- ✅ Firebase initialization: Working
- ✅ Environment variables: Loaded  
- ✅ Auth state listener: Active
- ❌ Google OAuth popup: Shows white screen (domain authorization needed)

### Testing Pages:
- `/simple-auth-test` - Basic Firebase testing
- `/auth-popup-fix` - Popup issue diagnosis and redirect alternative