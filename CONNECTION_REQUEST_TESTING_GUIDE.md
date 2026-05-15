# Connection Request Real-Time Notification Testing Guide

## 🎯 Overview
This guide helps you test the complete connection request flow with real-time WebSocket notifications.

## 🔧 What Changed

### Backend Changes
1. **routes-connection.ts**:
   - Converted to factory function `createConnectionRouter(wsClients?)`
   - Added WebSocket broadcasting when connection requests are created
   - Sends `connection_request` event to receiver in real-time

2. **routes.ts**:
   - Moved connection routes mounting to AFTER WebSocket server setup
   - Passes WebSocket `clients` map to connection router
   - Enables real-time notification delivery

3. **storage.ts**:
   - Added extensive logging in `getConnectionRequestsByReceiverId()`
   - Added logging in `createConnectionRequest()`
   - Helps trace data flow through database layer

### Frontend Changes
1. **ConnectionsPage.tsx**:
   - Added WebSocket connection with authentication
   - Listens for `connection_request` events
   - Automatically refreshes received requests when new request arrives
   - Shows toast notification for incoming requests

2. **portfolio-cta-buttons.tsx** (already done):
   - Enhanced logging in connection request mutation
   - Tracks send/success/error states

## 🧪 Testing Steps

### Prerequisites
1. Two user accounts (User A = Sender, User B = Receiver)
2. Access to browser console on both accounts
3. Server logs visible (terminal/console)

### Test Scenario 1: Real-Time Notification (Happy Path)

#### Step 1: Prepare User B (Receiver)
1. Log in as User B
2. Navigate to `/connections` page
3. Open browser console (F12)
4. Look for these logs:
   ```
   [ConnectionsPage] 🔌 Connecting to WebSocket: ws://...
   [ConnectionsPage] ✅ WebSocket connected
   [ConnectionsPage] ✅ WebSocket authenticated
   [ConnectionsPage] ✅ Received requests loaded: N requests
   ```

#### Step 2: Send Request from User A (Sender)
1. In a **different browser/incognito window**, log in as User A
2. Navigate to User B's portfolio page (e.g., `/portfolio/[userB_id]`)
3. Click "Let's Talk" button
4. Fill out the connection request form:
   - **Purpose**: e.g., "Mentorship"
   - **Message**: e.g., "I'd love to learn from your experience!"
5. Click "Send Request"
6. In console, verify:
   ```
   [PortfolioCTA] Sending connection request to: [userB_id]
   [PortfolioCTA] ✅ Connection request sent successfully!
   ```

#### Step 3: Check Server Logs
Look for this sequence in server console:
```
[Connection Routes] Creating request: [userA_id] -> [userB_id]
[Connection Routes] Request details: { senderId: ..., receiverId: ..., reason: ... }
[db.createConnectionRequest] Inserting connection request: { senderId: ..., receiverId: ... }
[db.createConnectionRequest] ✅ Connection request created with ID: [request_id]
[Connection Routes] ✅ Request created successfully with ID: [request_id]
[Connection Routes] Creating notification for receiver [userB_id]
[Connection Routes] ✅ Notification created for receiver [userB_id]
[Connection Routes] 🔔 WebSocket notification sent to receiver [userB_id]
```

#### Step 4: Verify User B Receives Notification
**In User B's browser** (should happen automatically):
1. Look for console logs:
   ```
   [ConnectionsPage] 📩 WebSocket message received: { type: 'connection_request', ... }
   [ConnectionsPage] 🔔 New connection request received! { senderName: '...', ... }
   [ConnectionsPage] ♻️  Invalidated received-connection-requests query
   [ConnectionsPage] ✅ Received requests loaded: N requests (incremented by 1)
   ```

2. **Visual confirmation**:
   - Toast notification appears: "New Connection Request - [User A Name] wants to connect!"
   - "Received" tab counter increases by 1
   - New request card appears in the list (if on Received tab)
   - Request shows User A's name, photo, purpose, and message

#### Step 5: Accept/Decline the Request
1. As User B, click "Accept" or "Decline"
2. Verify:
   - Button shows loading state
   - Success toast appears
   - Request disappears from pending list
   - Counter updates

### Test Scenario 2: User B Offline (WebSocket Disconnected)

#### Steps:
1. User B is NOT on `/connections` page OR has closed the browser
2. User A sends connection request (same as Scenario 1, Steps 2-3)
3. Server logs should show:
   ```
   [Connection Routes] ℹ️  Receiver [userB_id] not connected via WebSocket
   ```
4. **Later**: When User B logs in and navigates to `/connections`:
   - WebSocket connects → `[ConnectionsPage] ✅ WebSocket connected`
   - Query loads requests → `[ConnectionsPage] ✅ Received requests loaded: N requests`
   - Request appears in the list (not real-time, but on page load)

### Test Scenario 3: Database Verification (Manual Check)

Run the test script to verify data consistency:

```bash
npx tsx test-connection-request-flow.ts
```

This will:
- Query the database directly for connection requests
- Verify User B has the request in `connection_requests` table
- Check if notification was created
- Validate data integrity (sender exists, etc.)

Expected output:
```
🧪 Starting Connection Request Flow Test

📋 Step 1: Finding test users...
✅ User A (Sender): 1 - Alice Smith
✅ User B (Receiver): 2 - Bob Johnson

📋 Step 2: Checking for existing requests...
⚠️  Found 1 existing request(s):
   - ID: 42, Status: pending, Created: 2024-01-15...

📋 Step 3: Simulating User B's query...
✅ User B has 1 total received requests:
   1. ID: 42
      From: Alice Smith (ID: 1)
      Status: pending
      Created: 2024-01-15...
      Reason: Mentorship
      Message: I'd love to learn from your experience!

📋 Step 4: Checking pending requests count...
✅ User B has 1 PENDING requests

📋 Step 5: Checking notifications for User B...
✅ User B has 1 recent notifications:
   1. connection_request: New Connection Request
      Message: Alice Smith sent you a connection request
      Read: false, Created: 2024-01-15...

📋 Step 6: Data Integrity Checks...
✅ All connection requests have valid sender IDs

📊 SUMMARY:
═══════════════════════════════════════
User A (Sender): Alice Smith (ID: 1)
User B (Receiver): Bob Johnson (ID: 2)
Total Requests to User B: 1
Pending Requests: 1
Notifications for User B: 1
═══════════════════════════════════════
```

## 🔍 Troubleshooting

### Issue 1: "WebSocket connection failed"
**Symptoms**: Console shows `[ConnectionsPage] ❌ WebSocket error`

**Solutions**:
1. Verify WebSocket server is running:
   ```bash
   # Check server logs for:
   ✅ WebSocket server created successfully
   ```

2. Check port/protocol:
   - Development: `ws://localhost:5000/ws`
   - Production: `wss://your-domain.com/ws`

3. Verify firewall/proxy allows WebSocket connections

### Issue 2: "Request sent but User B doesn't see it"
**Symptoms**: User A gets success toast, but User B's list doesn't update

**Debug Steps**:
1. **Check server logs** for WebSocket broadcast:
   ```
   [Connection Routes] 🔔 WebSocket notification sent to receiver [userB_id]
   ```
   OR
   ```
   [Connection Routes] ℹ️  Receiver [userB_id] not connected via WebSocket
   ```

2. **Check User B's console** for WebSocket message:
   ```
   [ConnectionsPage] 📩 WebSocket message received: { type: 'connection_request', ... }
   ```

3. **Verify WebSocket authentication**:
   ```
   [ConnectionsPage] ✅ WebSocket authenticated
   ```
   
   If missing, check:
   - User B is logged in
   - JWT session cookie `brandentifier_session` exists
   - `user.id` is defined

4. **Check query invalidation**:
   ```
   [ConnectionsPage] ♻️  Invalidated received-connection-requests query
   [ConnectionsPage] ✅ Received requests loaded: N requests
   ```

5. **Manual refresh**: Have User B refresh the page
   - If request appears after refresh → WebSocket issue
   - If still missing → Backend/database issue

### Issue 3: "Query returns empty array but request is in database"
**Symptoms**: Test script shows request exists, but API returns `[]`

**Debug Steps**:
1. Check API endpoint logs:
   ```
   [Connection Routes] Fetching received requests for user [userB_id]
   [Connection Routes] ✅ Found 0 received requests
   ```

2. Check database query logs:
   ```
   [db.getConnectionRequestsByReceiverId] Querying for receiverId: [userB_id]
   [db.getConnectionRequestsByReceiverId] ✅ Found 0 requests
   ```

3. Verify `receiverId` matches:
   - User B's actual ID
   - The ID used in the API request
   - The ID in the database record

4. Check request status filtering

:
   - Query might filter by `status = 'pending'`
   - Verify request hasn't been accepted/declined already

### Issue 4: "Toast appears but request list doesn't update"
**Symptoms**: WebSocket delivers message, toast shows, but UI doesn't refresh

**Debug Steps**:
1. Check query invalidation log:
   ```
   [ConnectionsPage] ♻️  Invalidated received-connection-requests query
   ```

2. Verify subsequent query execution:
   ```
   [ConnectionsPage] ✅ Received requests loaded: N requests
   ```

3. Check React Query DevTools:
   - Is query marked as "stale"?
   - Did refetch occur?
   - What data is in the cache?

4. **Solution**: Force refetch:
   ```typescript
   queryClient.refetchQueries({ 
     queryKey: ['/api/users', user.id, 'received-connection-requests'] 
   });
   ```

## 📊 Expected Log Sequence (Complete Flow)

### User A's Browser Console:
```
[PortfolioCTA] Sending connection request to: 2
[PortfolioCTA] Request payload: { senderId: 1, receiverId: 2, reason: 'Mentorship', message: '...' }
[PortfolioCTA] ✅ Connection request sent successfully!
```

### Server Console:
```
[Connection Routes] Creating request: 1 -> 2
[Connection Routes] Request details: { senderId: 1, receiverId: 2, reason: 'Mentorship', ... }
[db.createConnectionRequest] Inserting connection request: { senderId: 1, receiverId: 2, ... }
[db.createConnectionRequest] ✅ Connection request created with ID: 42
[Connection Routes] ✅ Request created successfully with ID: 42
[Connection Routes] Full request: { id: 42, senderId: 1, receiverId: 2, status: 'pending', ... }
[Connection Routes] Creating notification for receiver 2
[Connection Routes] ✅ Notification created for receiver 2
[Connection Routes] 🔔 WebSocket notification sent to receiver 2
```

### User B's Browser Console:
```
[ConnectionsPage] 📩 WebSocket message received: { type: 'connection_request', requestId: 42, senderId: 1, senderName: 'Alice Smith', ... }
[ConnectionsPage] 🔔 New connection request received! { senderName: 'Alice Smith', ... }
[ConnectionsPage] ♻️  Invalidated received-connection-requests query
[Connection Routes] Fetching received requests for user 2
[db.getConnectionRequestsByReceiverId] Querying for receiverId: 2
[db.getConnectionRequestsByReceiverId] ✅ Found 1 requests
[Connection Routes] ✅ Found 1 received requests for user 2
[ConnectionsPage] ✅ Received requests loaded: 1 requests
[ConnectionsPage] First request: { id: 42, senderId: 1, senderName: 'Alice Smith', ... }
```

## ✅ Success Criteria

A successful test should meet ALL of these criteria:

### Backend:
- ✅ Server logs show request creation with correct sender/receiver IDs
- ✅ Database insert succeeds (logs show request ID)
- ✅ Notification created for receiver
- ✅ WebSocket broadcast attempt logged (either sent or "not connected")

### Frontend (User A):
- ✅ Connection request form submits successfully
- ✅ Success toast appears
- ✅ "Sent" tab counter increases by 1
- ✅ Request appears in "Sent" tab

### Frontend (User B - Real-time):
- ✅ WebSocket connection established and authenticated
- ✅ WebSocket message received (`connection_request` event)
- ✅ Toast notification appears with sender's name
- ✅ "Received" tab counter increases by 1
- ✅ Request appears in "Received" tab
- ✅ Request shows correct sender name, photo, reason, and message
- ✅ Accept/Decline buttons work

### Frontend (User B - Offline then Online):
- ✅ Request appears in list when User B navigates to `/connections` page
- ✅ All request details are correct
- ✅ Accept/Decline actions work

### Database:
- ✅ `connection_requests` table has new row with correct data
- ✅ `notifications` table has new notification for receiver
- ✅ Request status is `'pending'`
- ✅ Sender and receiver IDs match user accounts

## 🚀 Next Steps

After confirming the connection request flow works:

1. **Test Other WebSocket Events**:
   - Message delivery → Already implemented
   - Connection accepted notification → Add similar WebSocket broadcast
   - Connection declined notification → Add similar WebSocket broadcast

2. **Add Real-time Notification Badge**:
   - Show unread connection request count in header/navigation
   - Update count via WebSocket events

3. **Performance Optimization**:
   - Add debouncing to query invalidation
   - Implement optimistic updates
   - Cache connection request data

4. **Error Recovery**:
   - Auto-reconnect WebSocket on disconnect
   - Fallback to polling if WebSocket fails
   - Retry failed WebSocket sends

5. **Testing**:
   - Add automated E2E tests (Playwright/Cypress)
   - Test with multiple concurrent users
   - Load testing for WebSocket scalability

## 📝 Notes

- **WebSocket vs Polling**: Real-time WebSocket notifications provide instant updates without polling. If WebSocket fails, page refresh will still show requests.
- **Authentication**: WebSocket requires authentication via `auth` message with `userId`. This is separate from HTTP session cookies.
- **Connection State**: WebSocket connections are stored in server memory (`Map<userId, WebSocket>`). Connections are lost on server restart.
- **Scalability**: For horizontal scaling (multiple server instances), consider using Redis pub/sub for WebSocket message distribution.
