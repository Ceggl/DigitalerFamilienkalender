// CalDAV sync service – fetch & import calendar events

import { createAccount } from 'tsdav';
import { getExternalCalendarById } from './external-calendar';
import { retrieveSecret } from '@/lib/utils/secrets';
import { createEvent } from './calendar-event';
import { setSyncedAt } from './external-calendar';

/**
 * Sync a single external calendar.
 * Fetches events and creates them as CalendarEvent entries.
 */
export async function syncExternalCalendar(externalCalendarId: string): Promise<{
  success: boolean;
  eventsAdded: number;
  error?: string;
}> {
  try {
    const extCal = getExternalCalendarById(externalCalendarId);
    if (!extCal) {
      return { success: false, eventsAdded: 0, error: 'Calendar not found' };
    }

    const password = retrieveSecret(extCal.secretRef);

    // Create DAV client
    const client = await createAccount({
      account: {
        serverUrl: extCal.caldavUrl,
        username: extCal.username,
        password: password,
      },
    });

    // Get calendars
    const calendars = await client.fetchCalendars();
    if (!calendars || calendars.length === 0) {
      return { success: false, eventsAdded: 0, error: 'No calendars found' };
    }

    const calendar = calendars[0]; // Use first calendar
    let eventsAdded = 0;

    // Fetch events (last 6 months to now + 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const sixMonthsAhead = new Date();
    sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6);

    const events = await client.fetchCalendarObjects({
      calendar: calendar,
      timeRange: {
        start: sixMonthsAgo.toISOString(),
        end: sixMonthsAhead.toISOString(),
      },
    });

    // Import events
    for (const event of events || []) {
      // Parse VEVENT from ICS
      const icsEvent = parseVEvent(event.data || '');
      if (!icsEvent) continue;

      // Check if already exists
      const existing = db.query.calendarEvent.findFirst({
        where: (e, { eq: eqOp }) => eqOp(e.externalId, icsEvent.uid),
      });

      if (!existing) {
        await createEvent({
          householdId: extCal.householdId,
          title: icsEvent.summary,
          startsAt: icsEvent.dtstart,
          endsAt: icsEvent.dtend,
          allDay: icsEvent.allDay,
          location: icsEvent.location,
          icon: '📅',
          createdBy: 'system', // System user for external events
          externalId: icsEvent.uid,
          externalCalendarId: externalCalendarId,
          etag: event.etag,
          rrule: icsEvent.rrule,
        });
        eventsAdded++;
      } else if (existing.etag !== event.etag) {
        // Event changed – update it
        // (Phase 6: implement update logic)
      }
    }

    // Update sync timestamp
    setSyncedAt(externalCalendarId, new Date().toISOString());

    return { success: true, eventsAdded };
  } catch (error) {
    console.error('CalDAV sync error:', error);
    return {
      success: false,
      eventsAdded: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Simple VEVENT parser (basic ICS parsing).
 * In production, use a proper ICS library.
 */
function parseVEvent(icsData: string): {
  uid: string;
  summary: string;
  dtstart: string;
  dtend: string;
  allDay: boolean;
  location?: string;
  rrule?: string;
} | null {
  // TODO: Use a proper ICS parser library
  // For now, extract basic fields with regex
  const uidMatch = icsData.match(/UID:(.+)/);
  const summaryMatch = icsData.match(/SUMMARY:(.+)/);
  const dtstartMatch = icsData.match(/DTSTART[^:]*:(.+)/);
  const dtendMatch = icsData.match(/DTEND[^:]*:(.+)/);
  const locationMatch = icsData.match(/LOCATION:(.+)/);
  const rruleMatch = icsData.match(/RRULE:(.+)/);

  if (!uidMatch || !summaryMatch || !dtstartMatch) {
    return null;
  }

  return {
    uid: uidMatch[1].trim(),
    summary: summaryMatch[1].trim(),
    dtstart: dtstartMatch[1].trim(),
    dtend: dtendMatch?.[1]?.trim() || dtstartMatch[1].trim(),
    allDay: !dtstartMatch[1].includes('T'),
    location: locationMatch?.[1]?.trim(),
    rrule: rruleMatch?.[1]?.trim(),
  };
}

/**
 * Sync all calendars for a household.
 */
export async function syncAllCalendars(householdId: string): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  eventsAdded: number;
}> {
  const calendars = db.query.externalCalendar.findMany({
    where: (e, { eq }) => eq(e.householdId, householdId),
  });

  let succeeded = 0;
  let failed = 0;
  let eventsAdded = 0;

  for (const cal of calendars) {
    const result = await syncExternalCalendar(cal.id);
    if (result.success) {
      succeeded++;
      eventsAdded += result.eventsAdded;
    } else {
      failed++;
      console.error(`Failed to sync calendar ${cal.id}:`, result.error);
    }
  }

  return {
    total: calendars.length,
    succeeded,
    failed,
    eventsAdded,
  };
}
