// API: GET/POST /api/external-calendars

import type { APIRoute } from 'astro';
import { getOrCreateDefaultHousehold } from '@/lib/services/household';
import {
  getExternalCalendarsByHousehold,
  createExternalCalendar,
} from '@/lib/services/external-calendar';
import { z } from 'zod';

const createExternalCalendarSchema = z.object({
  label: z.string().min(1),
  provider: z.enum(['google', 'icloud', 'nextcloud', 'generic']),
  caldavUrl: z.string().url(),
  username: z.string().min(1),
  password: z.string().min(1),
  color: z.string().optional(),
});

export const GET: APIRoute = async () => {
  try {
    const household = await getOrCreateDefaultHousehold();
    if (!household) {
      return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
    }

    const calendars = getExternalCalendarsByHousehold(household.id);

    // DO NOT return secretRef to client – filter it out
    const safe = calendars.map((cal) => ({
      id: cal.id,
      label: cal.label,
      provider: cal.provider,
      color: cal.color,
      lastSyncedAt: cal.lastSyncedAt,
      syncDirection: cal.syncDirection,
    }));

    return new Response(JSON.stringify(safe), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching calendars:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = createExternalCalendarSchema.parse(body);

    const household = await getOrCreateDefaultHousehold();
    if (!household) {
      return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
    }

    const newCalendar = await createExternalCalendar({
      ...data,
      householdId: household.id,
    });

    // Safe response (no secretRef)
    const safe = {
      id: newCalendar?.id,
      label: newCalendar?.label,
      provider: newCalendar?.provider,
      color: newCalendar?.color,
      lastSyncedAt: newCalendar?.lastSyncedAt,
    };

    return new Response(JSON.stringify(safe), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error creating calendar:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
