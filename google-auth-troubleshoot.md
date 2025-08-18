# Google Authentication Troubleshooting Guide

## Current Issue: "Authorisation Error" on Direct OAuth

### Problem Analysis
The "Authorisation Error" occurs because:

1. **Missing Domain Authorization**: The current Replit domain `25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev` is not authorized in Firebase/Google Cloud Console
2. **Invalid Client ID**: The Direct OAuth was using a placeholder Client ID instead of the real Firebase Web Client ID

### Current Replit Domain
```
25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev
```

### Solution Steps

#### Step 1: Fix the Domain Authorization
You need to add this domain to Firebase Authentication:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click "Add domain" 
5. Add: `25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev`
6. Also add: `*.replit.dev` (wildcard for future Replit domains)

#### Step 2: Update Google Cloud Console OAuth Settings  
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID (Web application)
4. Under "Authorized JavaScript origins", add:
   - `https://25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev`
5. Under "Authorized redirect URIs", add:
   - `https://25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev/auth`
   - `https://25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev/__/auth/handler`

#### Step 3: Fixed Code Changes
✓ Already implemented: Fixed Direct OAuth to use proper Firebase redirect instead of placeholder Client ID
✓ Already implemented: Enhanced error handling and redirect authentication

### Test After Domain Configuration
Once you've added the domain to both Firebase and Google Cloud Console:
1. Clear browser cache/cookies for the auth domain
2. Try the "Direct OAuth" button again
3. Should redirect properly to Google authentication

### Alternative Solutions (Already Available)
If domain configuration isn't possible immediately:
- Use "Firebase Redirect" button (more reliable)
- Use "Advanced Authentication Options" → "Complex Firebase Auth"

### Environment Variables Status
✓ VITE_FIREBASE_API_KEY: Present
✓ VITE_FIREBASE_PROJECT_ID: Present  
✓ VITE_FIREBASE_APP_ID: Present