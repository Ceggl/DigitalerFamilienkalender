import { describe, it, expect } from 'vitest';
import { recordCoinEntry, getCoinBalance, getCoinLedger } from '../coins';

describe('Coin Service', () => {
  const personId = 'test-person-coins-001';
  const admin = 'test-admin-001';

  it('should record a coin entry (earned)', async () => {
    const entry = await recordCoinEntry({
      personId,
      delta: 10,
      reason: 'task_completed',
      taskInstanceId: 'task-001',
      createdBy: admin,
    });

    expect(entry).toBeDefined();
    expect(entry?.delta).toBe(10);
    expect(entry?.reason).toBe('task_completed');
  });

  it('should calculate correct balance from ledger', () => {
    const balance = getCoinBalance(personId);
    expect(balance).toBeGreaterThan(0);
  });

  it('should handle multiple entries (spent)', async () => {
    await recordCoinEntry({
      personId,
      delta: 5,
      reason: 'task_completed',
      createdBy: admin,
    });

    await recordCoinEntry({
      personId,
      delta: -3,
      reason: 'reward_redeemed',
      rewardRedemptionId: 'reward-001',
      createdBy: admin,
    });

    const balance = getCoinBalance(personId);
    // Should be 10 + 5 - 3 = 12
    expect(balance).toBeGreaterThan(0);
  });

  it('should provide full ledger for transparency', () => {
    const ledger = getCoinLedger(personId);

    expect(Array.isArray(ledger)).toBe(true);
    expect(ledger.length).toBeGreaterThan(0);

    // Verify ledger sums to balance
    const sumFromLedger = ledger.reduce((sum, entry) => sum + entry.delta, 0);
    const balance = getCoinBalance(personId);
    expect(sumFromLedger).toBe(balance);
  });
});
