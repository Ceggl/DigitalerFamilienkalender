// API: POST /api/external-calendars/push
// Push local changes to remote calendar

import type { APIRoute } from 'astro';
import { pushEventToRemote, deleteEventFromRemote } from '@/lib/services/caldav-write';
import { z } from 'zod';

const pushSchema = z.object({
  eventId: z.string().min(1),
  externalCalendarId: z.string().min(1),
  action: z.enum(['create', 'update', 'delete']).default('update'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = pushSchema.parse(body);

    let result;

    if (data.action === 'delete') {
      result = await deleteEventFromRemote(data.eventId, data.externalCalendarId);
    } else {
      result = await pushEventToRemote(data.eventId, data.externalCalendarId);
    }

    const status = result.success ? 200 : 400;

    return new Response(JSON.stringify(result), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error pushing event:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
