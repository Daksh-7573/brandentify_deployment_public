# Firebase Domain Setup Instructions

## Current Issue
Google authentication is failing because the current Replit domain is not authorized in your Firebase project.

## Quick Fix - Add Domains to Firebase

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `brandentifier-app`
3. **Navigate to**: Authentication > Settings > Authorized domains
4. **Add these domains**:
   - `25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev`
   - `*.replit.dev` (for all Replit domains)
   - `*.replit.app` (for deployed versions)

## Steps:
1. Click "Add domain" button
2. Paste the domain name
3. Click "Add" to save
4. Repeat for each domain

## After Adding Domains:
- Refresh the Brandentifier app
- Try Google authentication again
- It should work immediately after domain authorization

## Current Domain Detected:
`25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev`

The authentication is working correctly - it just needs the domain to be authorized in Firebase!