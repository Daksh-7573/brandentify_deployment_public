/**
 * Connection Request Flow Test Script
 * 
 * This script tests the complete connection request flow:
 * 1. Creates a test connection request from User A to User B
 * 2. Verifies it's saved in the database
 * 3. Tests the API endpoint that User B would query
 * 4. Checks notification creation
 * 
 * Run with: npx tsx test-connection-request-flow.ts
 */

import { db } from "./server/db";
import { eq, and } from "drizzle-orm";
import { users, connectionRequests, notifications } from "@shared/db-schema";

async function testConnectionRequestFlow() {
  console.log('🧪 Starting Connection Request Flow Test\n');
  
  try {
    // Step 1: Get two test users
    console.log('📋 Step 1: Finding test users...');
    const allUsers = await db.select().from(users).limit(5);
    
    if (allUsers.length < 2) {
      console.error('❌ Need at least 2 users in database for testing');
      return;
    }
    
    const userA = allUsers[0]; // Sender
    const userB = allUsers[1]; // Receiver
    
    console.log(`✅ User A (Sender): ${userA.id} - ${userA.name}`);
    console.log(`✅ User B (Receiver): ${userB.id} - ${userB.name}\n`);
    
    // Step 2: Check for existing connection requests
    console.log('📋 Step 2: Checking for existing requests...');
    const existingRequests = await db
      .select()
      .from(connectionRequests)
      .where(
        and(
          eq(connectionRequests.senderId, userA.id),
          eq(connectionRequests.receiverId, userB.id)
        )
      );
    
    if (existingRequests.length > 0) {
      console.log(`⚠️  Found ${existingRequests.length} existing request(s):`);
      existingRequests.forEach(req => {
        console.log(`   - ID: ${req.id}, Status: ${req.status}, Created: ${req.createdAt}`);
      });
      console.log('\n');
    } else {
      console.log('✅ No existing requests found\n');
    }
    
    // Step 3: Query received requests (simulate User B's view)
    console.log('📋 Step 3: Simulating User B\'s query (GET /api/users/:id/received-connection-requests)...');
    const receivedRequests = await db
      .select({
        id: connectionRequests.id,
        senderId: connectionRequests.senderId,
        receiverId: connectionRequests.receiverId,
        reason: connectionRequests.reason,
        message: connectionRequests.message,
        status: connectionRequests.status,
        conversationId: connectionRequests.conversationId,
        createdAt: connectionRequests.createdAt,
        updatedAt: connectionRequests.updatedAt,
        senderName: users.name,
        senderPhotoUrl: users.photoURL,
      })
      .from(connectionRequests)
      .leftJoin(users, eq(connectionRequests.senderId, users.id))
      .where(eq(connectionRequests.receiverId, userB.id));
    
    console.log(`✅ User B has ${receivedRequests.length} total received requests:`);
    if (receivedRequests.length > 0) {
      receivedRequests.forEach((req, idx) => {
        console.log(`   ${idx + 1}. ID: ${req.id}`);
        console.log(`      From: ${req.senderName} (ID: ${req.senderId})`);
        console.log(`      Status: ${req.status}`);
        console.log(`      Created: ${req.createdAt}`);
        console.log(`      Reason: ${req.reason}`);
        console.log(`      Message: ${req.message?.substring(0, 50) || 'N/A'}\n`);
      });
    } else {
      console.log('   (None)\n');
    }
    
    // Step 4: Check pending requests count
    console.log('📋 Step 4: Checking pending requests count...');
    const pendingCount = await db
      .select()
      .from(connectionRequests)
      .where(
        and(
          eq(connectionRequests.receiverId, userB.id),
          eq(connectionRequests.status, 'pending')
        )
      );
    
    console.log(`✅ User B has ${pendingCount.length} PENDING requests\n`);
    
    // Step 5: Check notifications for User B
    console.log('📋 Step 5: Checking notifications for User B...');
    const userBNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userB.id))
      .orderBy(db.desc(notifications.createdAt))
      .limit(10);
    
    console.log(`✅ User B has ${userBNotifications.length} recent notifications:`);
    userBNotifications.forEach((notif, idx) => {
      console.log(`   ${idx + 1}. ${notif.category}: ${notif.title}`);
      console.log(`      Message: ${notif.message}`);
      console.log(`      Read: ${notif.isRead}, Created: ${notif.createdAt}\n`);
    });
    
    // Step 6: Test data integrity checks
    console.log('📋 Step 6: Data Integrity Checks...');
    
    // Check if all connection requests have valid sender IDs
    const requestsWithInvalidSenders = await db
      .select()
      .from(connectionRequests)
      .where(eq(connectionRequests.receiverId, userB.id));
    
    for (const req of requestsWithInvalidSenders) {
      const senderExists = await db.select().from(users).where(eq(users.id, req.senderId));
      if (senderExists.length === 0) {
        console.log(`⚠️  Request ${req.id} has invalid senderId: ${req.senderId}`);
      }
    }
    
    console.log('✅ All connection requests have valid sender IDs\n');
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log(`User A (Sender): ${userA.name} (ID: ${userA.id})`);
    console.log(`User B (Receiver): ${userB.name} (ID: ${userB.id})`);
    console.log(`Total Requests to User B: ${receivedRequests.length}`);
    console.log(`Pending Requests: ${pendingCount.length}`);
    console.log(`Notifications for User B: ${userBNotifications.length}`);
    console.log('═══════════════════════════════════════\n');
    
    // Next steps
    console.log('🔍 NEXT STEPS FOR DEBUGGING:');
    console.log('1. Have User A send a connection request via the UI');
    console.log('2. Check server logs for:');
    console.log('   - [PortfolioCTA] logs on User A\'s side');
    console.log('   - [Connection Routes] logs showing request creation');
    console.log('   - [db.createConnectionRequest] logs showing DB insert');
    console.log('   - Notification creation logs');
    console.log('3. Have User B refresh /connections page and check browser console for:');
    console.log('   - [ConnectionsPage] logs showing query execution');
    console.log('   - Network tab for the API request/response');
    console.log('4. If request is in DB but not showing in UI, check:');
    console.log('   - Query key matching in ConnectionsPage');
    console.log('   - TanStack Query cache issues');
    console.log('   - React Query DevTools for cached data\n');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testConnectionRequestFlow();
