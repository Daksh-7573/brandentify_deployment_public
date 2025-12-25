/**
 * Encryption Key Management API Routes
 * 
 * Handles public key exchange and key management for E2E encryption.
 * Note: Private keys are NEVER handled by the server - they stay client-side only.
 */

import { Router, Request, Response } from 'express';
import { db } from './db';
import { 
  userEncryptionKeys, 
  conversationEncryptionKeys,
  insertUserEncryptionKeySchema 
} from '@shared/message-schema';
import { eq, and, inArray } from 'drizzle-orm';

const router = Router();

/**
 * Register or update user's public key
 * POST /api/encryption/keys
 */
router.post('/keys', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { publicKey } = req.body;
    if (!publicKey || typeof publicKey !== 'string') {
      return res.status(400).json({ error: 'Public key is required' });
    }
    
    const existing = await db
      .select()
      .from(userEncryptionKeys)
      .where(eq(userEncryptionKeys.userId, userId))
      .limit(1);
    
    if (existing.length > 0) {
      await db
        .update(userEncryptionKeys)
        .set({ 
          publicKey,
          keyVersion: existing[0].keyVersion + 1,
          updatedAt: new Date()
        })
        .where(eq(userEncryptionKeys.userId, userId));
      
      return res.json({ 
        success: true, 
        message: 'Public key updated',
        keyVersion: existing[0].keyVersion + 1
      });
    } else {
      await db
        .insert(userEncryptionKeys)
        .values({
          userId,
          publicKey,
          keyVersion: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      
      return res.json({ 
        success: true, 
        message: 'Public key registered',
        keyVersion: 1
      });
    }
  } catch (error) {
    console.error('[Encryption] Error registering public key:', error);
    return res.status(500).json({ error: 'Failed to register public key' });
  }
});

/**
 * Get current user's public key info
 * GET /api/encryption/keys/me
 */
router.get('/keys/me', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const [keyInfo] = await db
      .select({
        publicKey: userEncryptionKeys.publicKey,
        keyVersion: userEncryptionKeys.keyVersion,
        createdAt: userEncryptionKeys.createdAt
      })
      .from(userEncryptionKeys)
      .where(eq(userEncryptionKeys.userId, userId))
      .limit(1);
    
    if (!keyInfo) {
      return res.json({ hasKey: false });
    }
    
    return res.json({ 
      hasKey: true,
      publicKey: keyInfo.publicKey,
      keyVersion: keyInfo.keyVersion,
      createdAt: keyInfo.createdAt
    });
  } catch (error) {
    console.error('[Encryption] Error getting key info:', error);
    return res.status(500).json({ error: 'Failed to get key info' });
  }
});

/**
 * Get public keys for specific users (for encrypting messages to them)
 * POST /api/encryption/keys/users
 */
router.post('/keys/users', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array required' });
    }
    
    const keys = await db
      .select({
        userId: userEncryptionKeys.userId,
        publicKey: userEncryptionKeys.publicKey,
        keyVersion: userEncryptionKeys.keyVersion
      })
      .from(userEncryptionKeys)
      .where(inArray(userEncryptionKeys.userId, userIds));
    
    const keyMap: Record<number, { publicKey: string; keyVersion: number }> = {};
    for (const key of keys) {
      keyMap[key.userId] = {
        publicKey: key.publicKey,
        keyVersion: key.keyVersion
      };
    }
    
    return res.json({ keys: keyMap });
  } catch (error) {
    console.error('[Encryption] Error getting user keys:', error);
    return res.status(500).json({ error: 'Failed to get user keys' });
  }
});

/**
 * Check if all participants in a conversation have encryption keys
 * POST /api/encryption/conversation/check
 */
router.post('/conversation/check', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { participantIds } = req.body;
    if (!Array.isArray(participantIds)) {
      return res.status(400).json({ error: 'Participant IDs array required' });
    }
    
    const keys = await db
      .select({ userId: userEncryptionKeys.userId })
      .from(userEncryptionKeys)
      .where(inArray(userEncryptionKeys.userId, participantIds));
    
    const usersWithKeys = new Set(keys.map(k => k.userId));
    const allHaveKeys = participantIds.every(id => usersWithKeys.has(id));
    const missingUsers = participantIds.filter(id => !usersWithKeys.has(id));
    
    return res.json({
      canEncrypt: allHaveKeys,
      usersWithKeys: keys.map(k => k.userId),
      usersMissingKeys: missingUsers
    });
  } catch (error) {
    console.error('[Encryption] Error checking conversation:', error);
    return res.status(500).json({ error: 'Failed to check conversation' });
  }
});

/**
 * Delete user's encryption keys (key rotation or reset)
 * DELETE /api/encryption/keys
 */
router.delete('/keys', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    await db
      .delete(userEncryptionKeys)
      .where(eq(userEncryptionKeys.userId, userId));
    
    return res.json({ success: true, message: 'Encryption keys deleted' });
  } catch (error) {
    console.error('[Encryption] Error deleting keys:', error);
    return res.status(500).json({ error: 'Failed to delete keys' });
  }
});

export default router;
