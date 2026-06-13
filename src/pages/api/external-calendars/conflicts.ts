// API: GET /api/external-calendars/conflicts
// Detect & resolve sync conflicts

import type { APIRoute } from 'astro';
import { detectConflicts, resolveConflict } from '@/lib/services/caldav-write';
import { z } from 'zod';

const querySchema = z.object({
  externalCalendarId: z.string().min(1),
});

const resolveSchema = z.object({
  eventId: z.string().min(1),
  externalCalendarId: z.string().min(1),
  strategy: z.enum(['local_wins', 'remote_wins']),
});

export const GET: APIRoute = async ({ url }) => {
  try {
    const query = querySchema.parse({
      externalCalendarId: url.searchParams.get('externalCalendarId'),
    });

    const conflicts = await detectConflicts(query.externalCalendarId);

    return new Response(JSON.stringify({ conflicts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error detecting conflicts:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = resolveSchema.parse(body);

    const result = await resolveConflict(data.eventId, data.externalCalendarId, data.strategy);

    const status = result.success ? 200 : 400;

    return new Response(JSON.stringify(result), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error resolving conflict:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
