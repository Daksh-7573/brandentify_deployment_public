# Firebase Domain Setup Guide

## Issue
Google authentication redirects back to auth page instead of completing login because the Replit domain is not authorized in Firebase.

## Current Domain
Your current Replit domain is: `25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev`

## Step-by-Step Solution

### 1. Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **brandentifier-app**

### 2. Navigate to Authentication Settings
1. Click **"Authentication"** in the left sidebar
2. Click **"Settings"** tab
3. Click **"Authorized domains"** section

### 3. Add Required Domains
Add these exact domains to the authorized domains list:

**Required Domains:**
```
25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev
*.replit.dev
*.replit.app
```

**Optional (for future deployments):**
```
25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev.replit.app
```

### 4. Save Changes
1. Click **"Save"** or **"Add domain"** for each entry
2. Wait 1-2 minutes for changes to propagate

### 5. Test Authentication
1. Return to your app
2. Click "Continue with Google"
3. Complete the Google login process
4. Should redirect to Industry Pulse page

## Troubleshooting

### If login still fails:
1. Check Firebase console shows all domains are added
2. Wait 5 minutes for DNS propagation
3. Try in incognito/private browser window
4. Clear browser cache and cookies

### Common Mistakes:
- Missing the exact domain format
- Not adding wildcard domains (*.replit.dev)
- Not waiting for propagation time

## Success Indicators
After completing setup, you should see:
- Successful redirect to Google login
- Google authentication completes
- Redirect to `/industry-pulse` page
- Debug overlay shows "Auth Success: true"