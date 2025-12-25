/**
 * End-to-End Encryption Service
 * Uses TweetNaCl (NaCl - Networking and Cryptography library) for secure messaging
 * 
 * Key Features:
 * - Asymmetric encryption (public/private key pairs)
 * - Message encryption with ephemeral keys for forward secrecy
 * - Base64 encoding for safe storage/transmission
 */

import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

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
 * Generate a new encryption key pair for a user
 * @returns Base64 encoded public and private keys
 */
export function generateKeyPair(): EncryptionKeyPair {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: util.encodeBase64(keyPair.publicKey),
    privateKey: util.encodeBase64(keyPair.secretKey)
  };
}

/**
 * Encrypt a message for a recipient
 * Uses authenticated encryption with ephemeral keys for forward secrecy
 * 
 * @param plaintext The message to encrypt
 * @param recipientPublicKey Base64 encoded recipient's public key
 * @returns Encrypted message with nonce and ephemeral public key
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
 * Decrypt a message using recipient's private key
 * 
 * @param encryptedMessage The encrypted message object
 * @param recipientPrivateKey Base64 encoded recipient's private key
 * @returns Decrypted plaintext or error
 */
export function decryptMessage(
  encryptedMessage: EncryptedMessage,
  recipientPrivateKey: string
): DecryptedResult {
  try {
    const ciphertextBytes = util.decodeBase64(encryptedMessage.ciphertext);
    const nonceBytes = util.decodeBase64(encryptedMessage.nonce);
    const ephemeralPubKeyBytes = util.decodeBase64(encryptedMessage.ephemeralPublicKey);
    const recipientSecretKeyBytes = util.decodeBase64(recipientPrivateKey);
    
    const decrypted = nacl.box.open(
      ciphertextBytes,
      nonceBytes,
      ephemeralPubKeyBytes,
      recipientSecretKeyBytes
    );
    
    if (!decrypted) {
      return { success: false, error: 'Decryption failed - invalid key or corrupted message' };
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
 * Encrypt message for multiple recipients (group chat)
 * Creates separate encrypted copies for each recipient
 * 
 * @param plaintext The message to encrypt
 * @param recipientPublicKeys Array of Base64 encoded recipient public keys
 * @returns Map of recipient public key to encrypted message
 */
export function encryptForMultipleRecipients(
  plaintext: string,
  recipientPublicKeys: string[]
): Map<string, EncryptedMessage> {
  const encryptedMessages = new Map<string, EncryptedMessage>();
  
  for (const publicKey of recipientPublicKeys) {
    encryptedMessages.set(publicKey, encryptMessage(plaintext, publicKey));
  }
  
  return encryptedMessages;
}

/**
 * Serialize encrypted message for database storage
 * Combines all components into a single JSON string
 */
export function serializeEncryptedMessage(encrypted: EncryptedMessage): string {
  return JSON.stringify(encrypted);
}

/**
 * Deserialize encrypted message from database
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
 * Check if a message content looks like an encrypted message
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
 * Generate a symmetric key for group conversations
 * All members share this key, encrypted with their individual public keys
 */
export function generateSymmetricKey(): string {
  const key = nacl.randomBytes(nacl.secretbox.keyLength);
  return util.encodeBase64(key);
}

/**
 * Encrypt with symmetric key (for group messages after key exchange)
 */
export function encryptWithSymmetricKey(plaintext: string, symmetricKey: string): { ciphertext: string; nonce: string } {
  const keyBytes = util.decodeBase64(symmetricKey);
  const messageBytes = util.decodeUTF8(plaintext);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  
  const ciphertext = nacl.secretbox(messageBytes, nonce, keyBytes);
  
  return {
    ciphertext: util.encodeBase64(ciphertext),
    nonce: util.encodeBase64(nonce)
  };
}

/**
 * Decrypt with symmetric key
 */
export function decryptWithSymmetricKey(
  ciphertext: string,
  nonce: string,
  symmetricKey: string
): DecryptedResult {
  try {
    const keyBytes = util.decodeBase64(symmetricKey);
    const ciphertextBytes = util.decodeBase64(ciphertext);
    const nonceBytes = util.decodeBase64(nonce);
    
    const decrypted = nacl.secretbox.open(ciphertextBytes, nonceBytes, keyBytes);
    
    if (!decrypted) {
      return { success: false, error: 'Symmetric decryption failed' };
    }
    
    return {
      success: true,
      plaintext: util.encodeUTF8(decrypted)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export const encryptionService = {
  generateKeyPair,
  encryptMessage,
  decryptMessage,
  encryptForMultipleRecipients,
  serializeEncryptedMessage,
  deserializeEncryptedMessage,
  isEncryptedContent,
  generateSymmetricKey,
  encryptWithSymmetricKey,
  decryptWithSymmetricKey
};
