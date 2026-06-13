// Secrets storage utility
// Encrypt/decrypt sensitive data (CalDAV passwords, tokens)
// Uses crypto module for encryption

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// In production, this should come from environment variables
const SECRET_KEY = process.env.SECRETS_KEY || 'default-insecure-key-change-this';

// Ensure key is 32 bytes for AES-256
const keyBuffer = Buffer.from(SECRET_KEY.padEnd(32, '0').substring(0, 32));

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', keyBuffer, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return: iv + encrypted (separated by colon)
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptSecret(encryptedData: string): string {
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');

  const decipher = createDecipheriv('aes-256-cbc', keyBuffer, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Store a secret (password, token) and return a reference.
 * In a real system, this would store to a secure vault;
 * for now, it returns the encrypted blob as a reference.
 */
export function storeSecret(secret: string): string {
  return encryptSecret(secret);
}

export function retrieveSecret(secretRef: string): string {
  return decryptSecret(secretRef);
}
