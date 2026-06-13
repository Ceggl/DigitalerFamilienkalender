// External calendar service – CalDAV integration

import { db } from '@/lib/db/client';
import { externalCalendar, calendarEvent } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'crypto';
import { storeSecret, retrieveSecret } from '@/lib/utils/secrets';

export interface CreateExternalCalendarInput {
  householdId: string;
  label: string;
  provider: 'google' | 'icloud' | 'nextcloud' | 'generic';
  caldavUrl: string;
  username: string;
  password: string; // will be encrypted
  color?: string;
}

export async function createExternalCalendar(input: CreateExternalCalendarInput) {
  const id = uuid().toString();
  const secretRef = storeSecret(input.password);

  db.insert(externalCalendar).values({
    id,
    householdId: input.householdId,
    label: input.label,
    provider: input.provider,
    caldavUrl: input.caldavUrl,
    username: input.username,
    secretRef,
    color: input.color || 'bg-blue-100',
  });

  return getExternalCalendarById(id);
}

export function getExternalCalendarById(id: string) {
  const cal = db.query.externalCalendar.findFirst({
    where: (e, { eq: eqOp }) => eqOp(e.id, id),
  });

  // Decrypt password for return (be careful – never expose to client)
  if (cal) {
    return {
      ...cal,
      _password: retrieveSecret(cal.secretRef), // DO NOT send to client!
    };
  }

  return null;
}

export function getExternalCalendarsByHousehold(householdId: string) {
  return db.query.externalCalendar.findMany({
    where: (e, { eq: eqOp }) => eqOp(e.householdId, householdId),
  });
}

export async function updateExternalCalendar(
  id: string,
  updates: Partial<Omit<CreateExternalCalendarInput, 'householdId' | 'password'>> & {
    password?: string;
  }
) {
  let updateData: any = { ...updates };

  if (updates.password) {
    updateData.secretRef = storeSecret(updates.password);
    delete updateData.password;
  }

  db.update(externalCalendar).set(updateData).where(eq(externalCalendar.id, id));

  return getExternalCalendarById(id);
}

export function deleteExternalCalendar(id: string) {
  // Also delete all synced events from this calendar
  const eventsToDelete = db.query.calendarEvent.findMany({
    where: (e, { eq: eqOp }) => eqOp(e.externalCalendarId, id),
  });

  eventsToDelete.forEach((event) => {
    db.delete(calendarEvent).where(eq(calendarEvent.id, event.id));
  });

  db.delete(externalCalendar).where(eq(externalCalendar.id, id));
}

/**
 * Update sync status for a calendar.
 */
export function setSyncedAt(id: string, timestamp: string) {
  db.update(externalCalendar)
    .set({ lastSyncedAt: timestamp })
    .where(eq(externalCalendar.id, id));
}
