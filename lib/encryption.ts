'use server';

import crypto from 'crypto';
import { config } from '@/lib/config';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getKeyBuffer(): Buffer {
  return crypto
    .createHash('sha256')
    .update(config.encryption.key)
    .digest();
}

// Async required by Next.js 'use server' directive
export async function encryptKey(plaintext: string): Promise<string> {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKeyBuffer(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

// Async required by Next.js 'use server' directive
export async function decryptKey(encrypted: string): Promise<string> {
  const [ivHex, encryptedHex] = encrypted.split(':');
  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted value');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedBuffer = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKeyBuffer(), iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
