// Coin service – ledger-based reward system
// Never store a "balance" directly; always derive from ledger for auditability

import { db } from '@/lib/db/client';
import { coinLedgerEntry } from '@/lib/db/schema';
import { v4 as uuid } from 'crypto';

export interface RecordCoinInput {
  personId: string;
  delta: number; // positive for earned, negative for spent
  reason: 'task_completed' | 'reward_redeemed' | 'manual_adjustment';
  taskInstanceId?: string;
  rewardRedemptionId?: string;
  createdBy: string; // admin/parent doing the entry
}

/**
 * Record a coin transaction.
 * APPEND-ONLY: This is a ledger, not a mutable balance.
 */
export async function recordCoinEntry(input: RecordCoinInput) {
  const id = uuid().toString();

  db.insert(coinLedgerEntry).values({
    id,
    personId: input.personId,
    delta: input.delta,
    reason: input.reason,
    taskInstanceId: input.taskInstanceId,
    rewardRedemptionId: input.rewardRedemptionId,
    createdBy: input.createdBy,
  });

  return getCoinEntryById(id);
}

export function getCoinEntryById(id: string) {
  return db.query.coinLedgerEntry.findFirst({
    where: (c, { eq }) => eq(c.id, id),
    with: {
      taskInstance: true,
    },
  });
}

/**
 * Get the current coin balance for a person.
 * Sums all ledger entries.
 */
export function getCoinBalance(personId: string): number {
  const entries = db.query.coinLedgerEntry.findMany({
    where: (c, { eq }) => eq(c.personId, personId),
  });

  return entries.reduce((sum, entry) => sum + entry.delta, 0);
}

/**
 * Get full coin ledger for a person (for audit/transparency).
 */
export function getCoinLedger(personId: string) {
  return db.query.coinLedgerEntry.findMany({
    where: (c, { eq }) => eq(c.personId, personId),
    with: {
      taskInstance: true,
    },
  });
}

/**
 * Get all coin entries for a household (for admin view).
 */
export function getCoinEntriesByHousehold(householdId: string) {
  // TODO: requires join with person → household
  // For now, client can call getCoinLedger per person
}
