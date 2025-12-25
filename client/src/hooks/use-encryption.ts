/**
 * React Hook for E2E Encryption
 * Manages encryption keys and provides encrypt/decrypt functions
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { clientEncryption } from '@/lib/encryption';

export interface RecipientKey {
  userId: number;
  publicKey: string;
  keyVersion: number;
}

export interface EncryptionState {
  hasKeys: boolean;
  publicKey: string | null;
  isReady: boolean;
}

export function useEncryption(userId: number | null) {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) return;
    
    const keys = clientEncryption.getOrCreateKeys();
    setPublicKey(keys.publicKey);
    setIsInitialized(true);
    
    registerKeyWithServer(keys.publicKey);
  }, [userId]);
  
  const registerKeyWithServer = async (publicKey: string) => {
    try {
      await apiRequest('POST', '/api/encryption/keys', { publicKey });
      console.log('[E2E] Public key registered with server');
    } catch (error) {
      console.error('[E2E] Failed to register public key:', error);
    }
  };
  
  const { data: myKeyInfo } = useQuery({
    queryKey: ['/api/encryption/keys/me'],
    enabled: !!userId,
  });
  
  const getRecipientKeysMutation = useMutation({
    mutationFn: async (userIds: number[]) => {
      const response = await apiRequest('POST', '/api/encryption/keys/users', { userIds });
      const data = await response.json();
      return data.keys as Record<number, { publicKey: string; keyVersion: number }>;
    },
  });
  
  const encryptForRecipients = useCallback(async (
    plaintext: string, 
    recipientUserIds: number[]
  ): Promise<{ encrypted: string; encryptedForUsers: string } | null> => {
    try {
      const keys = await getRecipientKeysMutation.mutateAsync(recipientUserIds);
      
      const missingKeys = recipientUserIds.filter(id => !keys[id]);
      if (missingKeys.length > 0) {
        console.log('[E2E] Some recipients missing keys, sending unencrypted:', missingKeys);
        return null;
      }
      
      const encryptedMessages: Record<string, any> = {};
      for (const userId of recipientUserIds) {
        const recipientKey = keys[userId];
        if (recipientKey) {
          encryptedMessages[recipientKey.publicKey] = clientEncryption.encryptMessage(plaintext, recipientKey.publicKey);
        }
      }
      
      if (publicKey) {
        encryptedMessages[publicKey] = clientEncryption.encryptMessage(plaintext, publicKey);
      }
      
      return {
        encrypted: JSON.stringify(encryptedMessages),
        encryptedForUsers: recipientUserIds.join(',')
      };
    } catch (error) {
      console.error('[E2E] Encryption failed:', error);
      return null;
    }
  }, [publicKey, getRecipientKeysMutation]);
  
  const decryptMessage = useCallback((
    content: string,
    isEncrypted: boolean
  ): string => {
    if (!isEncrypted) {
      return content;
    }
    
    if (!publicKey) {
      return '[Encrypted - no key available]';
    }
    
    return clientEncryption.decryptMessageContent(content, isEncrypted, publicKey);
  }, [publicKey]);
  
  const checkCanEncrypt = useCallback(async (
    participantIds: number[]
  ): Promise<{ canEncrypt: boolean; missingUsers: number[] }> => {
    try {
      const response = await apiRequest('POST', '/api/encryption/conversation/check', { 
        participantIds 
      });
      const data = await response.json();
      return {
        canEncrypt: data.canEncrypt,
        missingUsers: data.usersMissingKeys || []
      };
    } catch (error) {
      console.error('[E2E] Check encryption failed:', error);
      return { canEncrypt: false, missingUsers: participantIds };
    }
  }, []);
  
  return {
    isReady: isInitialized && !!publicKey,
    hasKeys: clientEncryption.hasEncryptionKeys(),
    publicKey,
    myKeyInfo,
    encryptForRecipients,
    decryptMessage,
    checkCanEncrypt,
    regenerateKeys: () => {
      const newKeys = clientEncryption.generateAndStoreKeyPair();
      setPublicKey(newKeys.publicKey);
      registerKeyWithServer(newKeys.publicKey);
    }
  };
}
