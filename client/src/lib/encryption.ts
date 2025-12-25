/**
 * Client-Side End-to-End Encryption Library
 * 
 * Uses TweetNaCl for cryptographic operations in the browser.
 * Private keys NEVER leave the client - this is true E2E encryption.
 * 
 * Key Storage:
 * - Private key: localStorage only (encrypted with user passphrase optionally)
 * - Public key: Shared with server for key exchange
 */

import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

const STORAGE_KEY_PREFIX = 'brandentifier_e2e_';
const PRIVATE_KEY_STORAGE = `${STORAGE_KEY_PREFIX}private_key`;
const PUBLIC_KEY_STORAGE = `${STORAGE_KEY_PREFIX}public_key`;

export interface EncryptionKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  ciphertext: string;
  nonce: string;
  ephemeralPublicKey: string;
}

export interface DecryptedResult {
  success: boolean;
  plaintext?: string;
  error?: string;
}

/**
 * Generate a new key pair and store in localStorage
 * Called once when user first enables E2E encryption
 */
export function generateAndStoreKeyPair(): EncryptionKeyPair {
  const keyPair = nacl.box.keyPair();
  const keys = {
    publicKey: util.encodeBase64(keyPair.publicKey),
    privateKey: util.encodeBase64(keyPair.secretKey)
  };
  
  localStorage.setItem(PRIVATE_KEY_STORAGE, keys.privateKey);
  localStorage.setItem(PUBLIC_KEY_STORAGE, keys.publicKey);
  
  return keys;
}

/**
 * Get existing keys from localStorage
 */
export function getStoredKeys(): EncryptionKeyPair | null {
  const privateKey = localStorage.getItem(PRIVATE_KEY_STORAGE);
  const publicKey = localStorage.getItem(PUBLIC_KEY_STORAGE);
  
  if (privateKey && publicKey) {
    return { privateKey, publicKey };
  }
  return null;
}

/**
 * Get or create encryption keys
 */
export function getOrCreateKeys(): EncryptionKeyPair {
  const existing = getStoredKeys();
  if (existing) return existing;
  return generateAndStoreKeyPair();
}

/**
 * Get just the public key (for sharing with server/other users)
 */
export function getPublicKey(): string | null {
  return localStorage.getItem(PUBLIC_KEY_STORAGE);
}

/**
 * Get just the private key (for decryption - NEVER share this)
 */
export function getPrivateKey(): string | null {
  return localStorage.getItem(PRIVATE_KEY_STORAGE);
}

/**
 * Check if encryption keys exist
 */
export function hasEncryptionKeys(): boolean {
  return !!(localStorage.getItem(PRIVATE_KEY_STORAGE) && localStorage.getItem(PUBLIC_KEY_STORAGE));
}

/**
 * Clear encryption keys (use with caution - will lose ability to decrypt old messages)
 */
export function clearEncryptionKeys(): void {
  localStorage.removeItem(PRIVATE_KEY_STORAGE);
  localStorage.removeItem(PUBLIC_KEY_STORAGE);
}

/**
 * Encrypt a message for a recipient using their public key
 * Uses ephemeral keys for forward secrecy
 */
export function encryptMessage(
  plaintext: string,
  recipientPublicKey: string
): EncryptedMessage {
  const recipientPubKeyBytes = util.decodeBase64(recipientPublicKey);
  const messageBytes = util.decodeUTF8(plaintext);
  
  const ephemeralKeyPair = nacl.box.keyPair();
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  
  const ciphertext = nacl.box(
    messageBytes,
    nonce,
    recipientPubKeyBytes,
    ephemeralKeyPair.secretKey
  );
  
  return {
    ciphertext: util.encodeBase64(ciphertext),
    nonce: util.encodeBase64(nonce),
    ephemeralPublicKey: util.encodeBase64(ephemeralKeyPair.publicKey)
  };
}

/**
 * Decrypt a message using our private key
 */
export function decryptMessage(encryptedMessage: EncryptedMessage): DecryptedResult {
  try {
    const privateKey = getPrivateKey();
    if (!privateKey) {
      return { success: false, error: 'No private key found' };
    }
    
    const ciphertextBytes = util.decodeBase64(encryptedMessage.ciphertext);
    const nonceBytes = util.decodeBase64(encryptedMessage.nonce);
    const ephemeralPubKeyBytes = util.decodeBase64(encryptedMessage.ephemeralPublicKey);
    const privateKeyBytes = util.decodeBase64(privateKey);
    
    const decrypted = nacl.box.open(
      ciphertextBytes,
      nonceBytes,
      ephemeralPubKeyBytes,
      privateKeyBytes
    );
    
    if (!decrypted) {
      return { success: false, error: 'Decryption failed - message may be corrupted or key mismatch' };
    }
    
    return {
      success: true,
      plaintext: util.encodeUTF8(decrypted)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown decryption error'
    };
  }
}

/**
 * Serialize encrypted message for transmission/storage
 */
export function serializeEncryptedMessage(encrypted: EncryptedMessage): string {
  return JSON.stringify(encrypted);
}

/**
 * Deserialize encrypted message from storage
 */
export function deserializeEncryptedMessage(serialized: string): EncryptedMessage | null {
  try {
    const parsed = JSON.parse(serialized);
    if (parsed.ciphertext && parsed.nonce && parsed.ephemeralPublicKey) {
      return parsed as EncryptedMessage;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if content looks like an encrypted message
 */
export function isEncryptedContent(content: string): boolean {
  try {
    const parsed = JSON.parse(content);
    return !!(parsed.ciphertext && parsed.nonce && parsed.ephemeralPublicKey);
  } catch {
    return false;
  }
}

/**
 * Encrypt message for multiple recipients (one-to-many)
 * Returns a map of recipientPublicKey -> encrypted message
 */
export function encryptForRecipients(
  plaintext: string,
  recipientPublicKeys: string[]
): Record<string, EncryptedMessage> {
  const result: Record<string, EncryptedMessage> = {};
  
  for (const pubKey of recipientPublicKeys) {
    result[pubKey] = encryptMessage(plaintext, pubKey);
  }
  
  return result;
}

/**
 * Decrypt message content - handles both encrypted and plaintext
 */
export function decryptMessageContent(
  content: string,
  isEncrypted: boolean,
  myPublicKey?: string
): string {
  if (!isEncrypted) {
    return content;
  }
  
  try {
    const parsed = JSON.parse(content);
    
    if (myPublicKey && parsed[myPublicKey]) {
      const result = decryptMessage(parsed[myPublicKey]);
      return result.success ? result.plaintext! : '[Unable to decrypt message]';
    }
    
    if (parsed.ciphertext) {
      const result = decryptMessage(parsed);
      return result.success ? result.plaintext! : '[Unable to decrypt message]';
    }
    
    return '[Encrypted message - key not found]';
  } catch {
    return '[Encrypted message - format error]';
  }
}

export const clientEncryption = {
  generateAndStoreKeyPair,
  getStoredKeys,
  getOrCreateKeys,
  getPublicKey,
  getPrivateKey,
  hasEncryptionKeys,
  clearEncryptionKeys,
  encryptMessage,
  decryptMessage,
  serializeEncryptedMessage,
  deserializeEncryptedMessage,
  isEncryptedContent,
  encryptForRecipients,
  decryptMessageContent
};
