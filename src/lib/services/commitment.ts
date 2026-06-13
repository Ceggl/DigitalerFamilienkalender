// Commitment service – append-only audit trail for task agreements
// This is the CORE of the family calendar: binding, verifiable task agreements

import { db } from '@/lib/db/client';
import { commitment } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'crypto';
import { hashCommitment, verifyCommitmentChain, sha256 } from '@/lib/utils/hash';

export type CommitmentType = 'discussed' | 'agreed' | 'done' | 'verified' | 'declined';

export interface CreateCommitmentInput {
  taskInstanceId: string;
  personId: string; // who is making the commitment
  type: CommitmentType;
  witnessedBy?: string; // adult present
  note?: string;
}

/**
 * Create a new commitment entry.
 * APPEND-ONLY: Never updated, only added to.
 * Hash-chained for tamper-detection.
 */
export async function createCommitment(input: CreateCommitmentInput) {
  const id = uuid().toString();
  const createdAt = new Date().toISOString();

  // Get the previous commitment for this task instance to build the chain
  const previousCommitments = db.query.commitment.findMany({
    where: (c, { eq: eqOp }) => eqOp(c.taskInstanceId, input.taskInstanceId),
  });

  const prevCommitment = previousCommitments?.[previousCommitments.length - 1];
  const prevHash = prevCommitment?.hash ?? null;

  // Hash this commitment (includes prevHash for chain)
  const hash = hashCommitment({
    taskInstanceId: input.taskInstanceId,
    personId: input.personId,
    type: input.type,
    witnessedBy: input.witnessedBy,
    note: input.note,
    createdAt,
    prevHash: prevHash ?? undefined,
  });

  db.insert(commitment).values({
    id,
    taskInstanceId: input.taskInstanceId,
    personId: input.personId,
    type: input.type,
    witnessedBy: input.witnessedBy,
    note: input.note,
    hash,
    prevHash,
    createdAt,
  });

  return getCommitmentById(id);
}

export function getCommitmentById(id: string) {
  return db.query.commitment.findFirst({
    where: (c, { eq: eqOp }) => eqOp(c.id, id),
    with: {
      taskInstance: true,
      person: true,
      witness: true,
    },
  });
}

/**
 * Get all commitments for a task instance, in order.
 * Use this to trace the full history and verify the chain.
 */
export function getCommitmentChain(taskInstanceId: string) {
  return db.query.commitment.findMany({
    where: (c, { eq: eqOp }) => eqOp(c.taskInstanceId, taskInstanceId),
    with: {
      person: true,
      witness: true,
    },
  });
}

/**
 * Verify that a commitment chain has not been tampered with.
 * Returns { isValid: boolean, firstTamperAt?: number }
 */
export function verifyChain(taskInstanceId: string): {
  isValid: boolean;
  firstTamperAt?: number;
} {
  const chain = getCommitmentChain(taskInstanceId);

  if (chain.length === 0) return { isValid: true };
  if (chain.length === 1) {
    // First entry should have no prevHash
    return { isValid: chain[0].prevHash === null };
  }

  // Verify hash chain integrity
  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];
    const expectedPrevHash = i === 0 ? null : chain[i - 1].hash;

    if (entry.prevHash !== expectedPrevHash) {
      return {
        isValid: false,
        firstTamperAt: i,
      };
    }

    // Re-hash to verify the hash itself matches
    const recalculatedHash = hashCommitment({
      taskInstanceId: entry.taskInstanceId,
      personId: entry.personId,
      type: entry.type as CommitmentType,
      witnessedBy: entry.witnessedBy ?? undefined,
      note: entry.note ?? undefined,
      createdAt: entry.createdAt,
      prevHash: expectedPrevHash ?? undefined,
    });

    if (entry.hash !== recalculatedHash) {
      return {
        isValid: false,
        firstTamperAt: i,
      };
    }
  }

  return { isValid: true };
}

/**
 * Get the latest commitment for a task instance.
 * Useful to understand current status.
 */
export function getLatestCommitment(taskInstanceId: string) {
  const chain = getCommitmentChain(taskInstanceId);
  return chain[chain.length - 1] ?? null;
}

/**
 * Check if a task has been "agreed" to by a person.
 * Returns true if the latest "agreed" commitment is from this person and hasn't been declined.
 */
export function isAgreedBy(taskInstanceId: string, personId: string): boolean {
  const chain = getCommitmentChain(taskInstanceId);
  if (chain.length === 0) return false;

  // Look for an "agreed" or "done" commitment from this person
  const agreedEntry = chain.findLast((c) => c.personId === personId && c.type === 'agreed');
  const declinedEntry = chain.findLast((c) => c.personId === personId && c.type === 'declined');

  if (!agreedEntry) return false;
  if (declinedEntry && declinedEntry.createdAt > agreedEntry.createdAt) {
    return false; // declined after agreeing
  }

  return true;
}
