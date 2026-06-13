import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createPerson, getPersonById, getPersonsByHousehold } from '../person';

// Mock household for testing
const testHouseholdId = 'test-household-001';

describe('Person Service', () => {
  let createdPersonId: string;

  it('should create a person', async () => {
    const person = await createPerson({
      householdId: testHouseholdId,
      displayName: 'Test Kind',
      avatarKind: 'emoji',
      avatarValue: '👧',
      color: 'bg-person-pink',
      role: 'child',
      isNonReader: false,
    });

    expect(person).toBeDefined();
    expect(person?.displayName).toBe('Test Kind');
    expect(person?.role).toBe('child');
    createdPersonId = person!.id;
  });

  it('should retrieve a person by id', () => {
    const person = getPersonById(createdPersonId);

    expect(person).toBeDefined();
    expect(person?.id).toBe(createdPersonId);
    expect(person?.displayName).toBe('Test Kind');
  });

  it('should retrieve people by household', () => {
    const people = getPersonsByHousehold(testHouseholdId);

    expect(Array.isArray(people)).toBe(true);
    expect(people.length).toBeGreaterThan(0);
  });

  it('should create a person with PIN (adult)', async () => {
    const person = await createPerson({
      householdId: testHouseholdId,
      displayName: 'Test Erwachsene',
      avatarKind: 'emoji',
      avatarValue: '👩',
      color: 'bg-person-blue',
      role: 'adult',
      pin: '1234',
    });

    expect(person).toBeDefined();
    expect(person?.role).toBe('adult');
    expect(person?.pinHash).toBeDefined();
    expect(person?.pinHash).not.toBe('1234'); // should be hashed
  });
});
