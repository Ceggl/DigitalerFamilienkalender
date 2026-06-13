// Reward service – manage rewards and redemptions

import { db } from '@/lib/db/client';
import { reward, rewardRedemption } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'crypto';

export interface CreateRewardInput {
  householdId: string;
  title: string;
  icon: string;
  costCoins: number;
  requiresApproval?: boolean;
  dailyLimit?: number;
}

export async function createReward(input: CreateRewardInput) {
  const id = uuid().toString();

  db.insert(reward).values({
    id,
    householdId: input.householdId,
    title: input.title,
    icon: input.icon,
    costCoins: input.costCoins,
    requiresApproval: input.requiresApproval ? 1 : 0,
    dailyLimit: input.dailyLimit,
  });

  return getRewardById(id);
}

export function getRewardById(id: string) {
  return db.query.reward.findFirst({
    where: (r, { eq: eqOp }) => eqOp(r.id, id),
  });
}

export function getRewardsByHousehold(householdId: string) {
  return db.query.reward.findMany({
    where: (r, { eq: eqOp }) => eqOp(r.householdId, householdId),
  });
}

export async function updateReward(id: string, updates: Partial<CreateRewardInput>) {
  db.update(reward).set(updates).where(eq(reward.id, id));
  return getRewardById(id);
}

export function deleteReward(id: string) {
  db.delete(reward).where(eq(reward.id, id));
}

/**
 * Create a reward redemption request.
 */
export async function requestRedemption(rewardId: string, personId: string) {
  const id = uuid().toString();

  const r = getRewardById(rewardId);
  if (!r) throw new Error('Reward not found');

  db.insert(rewardRedemption).values({
    id,
    rewardId,
    personId,
    coinsSpent: r.costCoins,
    status: 'requested',
  });

  return getRedemptionById(id);
}

export function getRedemptionById(id: string) {
  return db.query.rewardRedemption.findFirst({
    where: (rr, { eq: eqOp }) => eqOp(rr.id, id),
    with: {
      reward: true,
      person: true,
    },
  });
}

/**
 * Get redemption requests for a person.
 */
export function getRedemptionsByPerson(personId: string) {
  return db.query.rewardRedemption.findMany({
    where: (rr, { eq: eqOp }) => eqOp(rr.personId, personId),
    with: {
      reward: true,
    },
  });
}

/**
 * Approve or deny a redemption request.
 */
export async function approveRedemption(id: string, approvedBy: string) {
  db.update(rewardRedemption).set({ status: 'approved', approvedBy }).where(eq(rewardRedemption.id, id));
  return getRedemptionById(id);
}

export async function denyRedemption(id: string) {
  db.update(rewardRedemption).set({ status: 'denied' }).where(eq(rewardRedemption.id, id));
  return getRedemptionById(id);
}

/**
 * Mark a redemption as fulfilled (given to child).
 */
export async function fulfillRedemption(id: string) {
  db.update(rewardRedemption).set({ status: 'fulfilled' }).where(eq(rewardRedemption.id, id));
  return getRedemptionById(id);
}
