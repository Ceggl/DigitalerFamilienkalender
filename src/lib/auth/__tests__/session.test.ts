import { describe, it, expect } from 'vitest';
import { createSession, hasPermission } from '../session';
import { getPersonById } from '@/lib/services/person';

describe('Session Management', () => {
  // Create test persons in beforeAll, then use here
  // For Phase 4 tests, we'd mock the database

  it('should create a session for a person', () => {
    // TODO: Create test person first
    // const session = createSession(testPersonId);
    // expect(session.personId).toBeDefined();
    // expect(session.role).toBe('child');
  });

  it('should check adult permissions', () => {
    const adultSession = {
      personId: 'adult-001',
      role: 'adult' as const,
      displayName: 'Mom',
      avatarKind: 'emoji' as const,
      avatarValue: '👩',
    };

    expect(hasPermission(adultSession, 'admin')).toBe(true);
    expect(hasPermission(adultSession, 'view_all')).toBe(true);
    expect(hasPermission(adultSession, 'edit_all')).toBe(true);
  });

  it('should restrict child permissions', () => {
    const childSession = {
      personId: 'child-001',
      role: 'child' as const,
      displayName: 'Emma',
      avatarKind: 'emoji' as const,
      avatarValue: '👧',
    };

    expect(hasPermission(childSession, 'view_own')).toBe(true);
    expect(hasPermission(childSession, 'edit_own')).toBe(true);
    expect(hasPermission(childSession, 'view_all')).toBe(false);
    expect(hasPermission(childSession, 'admin')).toBe(false);
  });

  it('should deny permission for unauthenticated', () => {
    expect(hasPermission(null, 'view_own')).toBe(false);
    expect(hasPermission(null, 'admin')).toBe(false);
  });
});
