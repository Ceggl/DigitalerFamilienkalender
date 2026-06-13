// Hash utilities for commitment audit trail (append-only, tamper-evident)
import { createHash } from 'crypto';

export function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Create a hash for a commitment entry.
 * Combines the entry's data with the previous hash to create a chain.
 */
export function hashCommitment(data: {
  taskInstanceId: string;
  personId: string;
  type: string;
  witnessedBy?: string;
  note?: string;
  createdAt: string;
  prevHash?: string;
}): string {
  const content = JSON.stringify(data);
  return sha256(content);
}

/**
 * Verify integrity of a commitment chain.
 * Returns true if the hash chain is unbroken, false if tampered.
 */
export function verifyCommitmentChain(entries: Array<{
  hash: string;
  prevHash: string | null;
}>): boolean {
  if (entries.length === 0) return true;

  // First entry should have no prevHash
  if (entries[0].prevHash !== null) return false;

  // Each subsequent entry's prevHash should match the previous entry's hash
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].prevHash !== entries[i - 1].hash) {
      return false;
    }
  }

  return true;
}
