// API: POST /api/external-calendars/sync
// Trigger calendar sync

import type { APIRoute } from 'astro';
import { getOrCreateDefaultHousehold } from '@/lib/services/household';
import { syncExternalCalendar, syncAllCalendars } from '@/lib/services/caldav-sync';
import { z } from 'zod';

const syncSchema = z.object({
  externalCalendarId: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = syncSchema.parse(body);

    const household = await getOrCreateDefaultHousehold();
    if (!household) {
      return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
    }

    let result;
    if (data.externalCalendarId) {
      // Sync single calendar
      result = await syncExternalCalendar(data.externalCalendarId);
    } else {
      // Sync all calendars
      result = await syncAllCalendars(household.id);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error syncing calendars:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
