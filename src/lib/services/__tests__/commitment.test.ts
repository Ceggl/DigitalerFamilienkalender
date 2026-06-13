import { describe, it, expect, beforeAll } from 'vitest';
import { createCommitment, getCommitmentChain, verifyChain, isAgreedBy } from '../commitment';

describe('Commitment Service (Audit Trail)', () => {
  const taskInstanceId = 'test-instance-001';
  const personId = 'test-person-001';
  const witnessPerson = 'test-adult-001';

  it('should create a commitment entry (discussed)', async () => {
    const commitment = await createCommitment({
      taskInstanceId,
      personId,
      type: 'discussed',
      witnessedBy: witnessPerson,
      note: 'Discussed at breakfast',
    });

    expect(commitment).toBeDefined();
    expect(commitment?.type).toBe('discussed');
    expect(commitment?.hash).toBeDefined();
    expect(commitment?.prevHash).toBeNull();
  });

  it('should create a chain of commitments', async () => {
    const discussed = await createCommitment({
      taskInstanceId,
      personId,
      type: 'discussed',
      witnessedBy: witnessPerson,
    });

    const agreed = await createCommitment({
      taskInstanceId,
      personId,
      type: 'agreed',
    });

    expect(agreed?.prevHash).toBe(discussed?.hash);
    expect(agreed?.hash).not.toBe(discussed?.hash);
  });

  it('should verify an intact commitment chain', () => {
    const chain = getCommitmentChain(taskInstanceId);
    const verification = verifyChain(taskInstanceId);

    expect(chain.length).toBeGreaterThan(0);
    expect(verification.isValid).toBe(true);
    expect(verification.firstTamperAt).toBeUndefined();
  });

  it('should detect if a commitment was agreed to', () => {
    const agreed = isAgreedBy(taskInstanceId, personId);
    expect(agreed).toBe(true);
  });

  it('should handle commitment decline', async () => {
    const taskId2 = 'test-instance-002';
    const person2 = 'test-person-002';

    await createCommitment({
      taskInstanceId: taskId2,
      personId: person2,
      type: 'discussed',
    });

    await createCommitment({
      taskInstanceId: taskId2,
      personId: person2,
      type: 'declined',
      note: 'Too busy today',
    });

    const isAgreed = isAgreedBy(taskId2, person2);
    expect(isAgreed).toBe(false);
  });
});
