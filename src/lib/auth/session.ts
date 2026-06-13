// Session management – login state per device
// Uses HTTP-only cookies for security (Astro's native support)

import { getPersonById, verifyPin } from '@/lib/services/person';

export interface Session {
  personId: string;
  role: 'adult' | 'caregiver' | 'child';
  displayName: string;
  avatarKind: 'photo' | 'emoji' | 'illustration';
  avatarValue: string;
}

const SESSION_COOKIE_NAME = 'fk_session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Create a session for a person.
 * In Astro, this is typically called from an API endpoint
 * and the session ID is stored in an HTTP-only cookie.
 */
export function createSession(personId: string): Session {
  const person = getPersonById(personId);
  if (!person) {
    throw new Error('Person not found');
  }

  return {
    personId: person.id,
    role: person.role as 'adult' | 'caregiver' | 'child',
    displayName: person.displayName,
    avatarKind: person.avatarKind as 'photo' | 'emoji' | 'illustration',
    avatarValue: person.avatarValue,
  };
}

/**
 * Extract session from Astro request headers.
 * Astro provides Cookies via request.cookies.
 */
export function getSessionFromRequest(cookies: any): Session | null {
  const sessionJson = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionJson) return null;

  try {
    return JSON.parse(sessionJson) as Session;
  } catch {
    return null;
  }
}

/**
 * Check if a person has permission to perform an action.
 */
export function hasPermission(
  session: Session | null,
  action: 'view_own' | 'edit_own' | 'view_all' | 'edit_all' | 'admin'
): boolean {
  if (!session) return false;

  // Admins (adults) can do everything
  if (session.role === 'adult' || session.role === 'caregiver') {
    return true;
  }

  // Children can only view/edit their own data
  if (session.role === 'child') {
    return action === 'view_own' || action === 'edit_own';
  }

  return false;
}
