# Quantum Card Share Tracking Implementation

## ✅ Implementation Complete

Backend-driven unlock system for shared Quantum Cards has been fully implemented.

---

## 🎯 How It Works

### Flow:
1. **User A shares Quantum Card** → Link contains `?ref={userAId}`
2. **User B opens the link** → Backend tracks the view
3. **Backend records event** → Prevents self-referral and duplicates
4. **Backend updates User A** → Unlocks premium Quantum Card automatically
5. **User A sees unlocked card** → Ready to use immediately

---

## 📦 Files Modified/Created

### 1. Database Schema
**File**: [shared/schema.ts](shared/schema.ts)
- Added `shareEvents` table to track link opens
- Fields: `ref_user`, `viewer_id`, `card_id`, `viewed_at`, `reward_granted`
- Includes proper foreign key relationships

### 2. Backend API Endpoint
**File**: [server/routes-share-tracking.ts](server/routes-share-tracking.ts) (NEW)
- **POST `/api/share/quantum-open`** - Main tracking endpoint
  - ✅ Prevents self-referral
  - ✅ Prevents duplicate rewards
  - ✅ Records share event
  - ✅ Unlocks cards based on share count
  - ✅ Returns unlock confirmation
- **GET `/api/share/stats`** - Get user's share statistics
- Uses `optionalAuth` middleware (works for logged-in + anonymous users)

**Unlock Logic**:
```
Share 1 → Unlock: 3d-animated
Share 2 → Unlock: holographic
Share 3 → Unlock: neoglow
Share 4 → Unlock: creative
...up to 10 premium cards
```

### 3. Route Registration
**File**: [server/routes.ts](server/routes.ts)
- Imported `registerShareTrackingRoutes`
- Registered share tracking routes after referral routes

### 4. Frontend Tracking
**File**: [client/src/pages/random-profile.tsx](client/src/pages/random-profile.tsx)
- Added `useEffect` to detect `?ref={userId}` parameter
- Automatically POSTs to `/api/share/quantum-open` on page load
- Console logs for debugging
- Works for both logged-in and anonymous viewers

### 5. Share Modal Component
**File**: [client/src/components/share/quantum-share-modal.tsx](client/src/components/share/quantum-share-modal.tsx) (NEW)
- Beautiful gradient modal UI
- Generates share link: `/r/{randomProfileLink}?ref={userId}`
- Copy-to-clipboard functionality
- Social media share buttons (Twitter, LinkedIn, WhatsApp, Facebook)
- Shows "How it works" guide
- Displays unlock incentive message

### 6. Quantum Card Component
**File**: [client/src/components/profile/cards/quantum-card.tsx](client/src/components/profile/cards/quantum-card.tsx)
- Added "Share Quantum Card" button click handler
- Opens `QuantumShareModal` on click
- Passes `randomProfileLink` to modal
- Only works if user has a `randomProfileLink` set

### 7. Database Migration
**File**: [server/db-migration-share-events.ts](server/db-migration-share-events.ts) (NEW)
- Creates `share_events` table
- Adds indexes for performance:
  - `idx_share_events_ref_user` for fast lookups
  - `idx_share_events_viewer` for duplicate detection

---

## 🚀 Deployment Steps

### 1. Run Database Migration
```bash
# Option 1: Run migration directly
ts-node server/db-migration-share-events.ts

# Option 2: Import and run in your main migration runner
import { runMigration } from './server/db-migration-share-events';
await runMigration();
```

### 2. Verify Table Creation
```sql
-- Check if table exists
SELECT * FROM share_events LIMIT 1;

-- Check indexes
\d share_events
```

### 3. Restart Server
The routes are already registered, just restart your Node.js server:
```bash
npm run dev
# or
npm start
```

---

## 🧪 Testing Guide

### Manual Testing Flow

#### Step 1: Get Share Link
1. Log in as User A
2. Go to `/quantum-card` page
3. Click "Share Quantum Card" button
4. Copy the link (should look like: `https://yoursite.com/r/{randomLink}?ref={userAId}`)

#### Step 2: Open in New Browser/Incognito
1. Open the copied link in incognito window
2. Open DevTools → Network tab
3. Look for `POST /api/share/quantum-open`
4. Check Response:
```json
{
  "success": true,
  "message": "Share tracked and reward granted",
  "shareCount": 1,
  "unlockedCard": "3d-animated"
}
```

#### Step 3: Verify Unlock for Sharer
1. Return to User A's browser
2. Go to `/quantum-card` page
3. You should now see "3d-animated" card unlocked
4. Or check database:
```sql
SELECT * FROM user_unlocks 
WHERE user_id = {userAId} 
  AND unlock_type = 'quantum_card' 
  AND unlock_source = 'share';
```

### Console Debugging

**Frontend (Browser Console)**:
```
[Share Tracking] Detected shared link { refUser, cardOwner, randomLink }
[Share Tracking] Backend response: { success, unlockedCard, shareCount }
[Share Tracking] ✅ User X unlocked: holographic
```

**Backend (Server Console)**:
```
[Share Tracking] POST /api/share/quantum-open { refUser, cardId, viewerId }
[Share Tracking] Share event recorded { shareEventId, refUser, viewerId, cardId }
[Share Tracking] Share count for user { refUser, shareCount }
[Share Tracking] ✅ Quantum Card unlocked { refUser, unlockedCard, shareCount }
```

---

## 🛡️ Security Features

### ✅ Self-Referral Prevention
- Blocks if `viewerId === refUser`
- Returns success but doesn't grant reward

### ✅ Duplicate Reward Prevention
- Checks existing `share_events` for same `(ref_user, viewer_id, card_id)` combo
- Returns "Already counted" if duplicate detected

### ✅ Anonymous Viewer Support
- Works even if viewer is not logged in (`viewer_id = null`)
- Still grants reward to sharer

### ✅ Database Transaction Safety
- Uses `BEGIN/COMMIT/ROLLBACK` for atomic operations
- Prevents partial updates on error

---

## 📊 Share Statistics API

Get user's share stats:
```javascript
GET /api/share/stats

Response:
{
  "success": true,
  "totalShares": 5,
  "rewardedShares": 5,
  "unlockedCards": [
    "3d-animated",
    "holographic", 
    "neoglow",
    "creative",
    "glassmorphism"
  ]
}
```

---

## 🎨 UI Features

### Share Modal Highlights
- 💎 **Incentive Banner**: "Each person who views your card unlocks a new premium Quantum Card template"
- 📋 **Copy Link**: One-click clipboard copy
- 🌐 **Social Share**: Direct share to Twitter, LinkedIn, WhatsApp, Facebook
- 📖 **How It Works**: Step-by-step guide for users
- 🎨 **Gradient Design**: Matches Quantum Card theme (purple/cyan)

### Share Button Behavior
- Shows "Share Quantum Card" on desktop, "Share" on mobile
- Disabled if `randomProfileLink` is null
- Opens modal on click
- Hover effects with glow animation

---

## 🔧 Advanced Customization

### Change Unlock Logic
Edit [server/routes-share-tracking.ts](server/routes-share-tracking.ts):
```typescript
// Current: 1 share = 1 card unlock
// Change to: 1 share = 2 cards
const cardsToUnlock = PREMIUM_QUANTUM_CARDS.slice(0, shareCount * 2);
```

### Add Reward Notifications
After unlock in [server/routes-share-tracking.ts](server/routes-share-tracking.ts):
```typescript
// Send push notification
await sendNotification(refUser, {
  title: "🎉 New Quantum Card Unlocked!",
  body: `${cardToUnlock} template is now available`
});
```

### Track More Events
Add tracking to other pages (portfolio, profile):
```typescript
// In any public profile page
useEffect(() => {
  const refUser = new URLSearchParams(window.location.search).get('ref');
  if (refUser) {
    fetch('/api/share/quantum-open', {
      method: 'POST',
      body: JSON.stringify({ refUser, cardId: 'portfolio' })
    });
  }
}, []);
```

---

## ✅ Checklist

- [x] Database schema updated with `shareEvents` table
- [x] Backend API endpoint created (`/api/share/quantum-open`)
- [x] Route registered in server
- [x] Frontend tracking added to random-profile page
- [x] Share modal component created
- [x] Quantum card share button wired up
- [x] Database migration script created
- [x] Self-referral prevention implemented
- [x] Duplicate reward prevention implemented
- [x] TypeScript types validated (no errors)

---

## 🎯 Next Steps

1. **Run migration**: `ts-node server/db-migration-share-events.ts`
2. **Restart server**: Test the share flow
3. **Monitor logs**: Check console for tracking events
4. **Test incognito**: Verify rewards work for sharer
5. **Check database**: Query `share_events` and `user_unlocks` tables

---

## 🐛 Troubleshooting

### Link doesn't have ?ref parameter
- Check `QuantumShareModal` generates link correctly
- Verify `user.id` is available in hook
- Check `randomProfileLink` exists in userData

### POST request not firing
- Check DevTools → Network tab for the request
- Verify URL is `/api/share/quantum-open` (not `/api/share/open`)
- Check useEffect dependencies in random-profile.tsx

### Reward not granted
- Check backend logs for errors
- Verify `ref_user` exists in users table
- Check if self-referral is triggering
- Query `share_events` table to see if event was recorded

### Card still locked after share
- Check `user_unlocks` table for new entry
- Verify `unlock_source = 'share'`
- Check referral system's `getAvailabilityStatus` to ensure it reads share unlocks

---

**Implementation Status**: ✅ **COMPLETE** - Ready for testing and deployment!
