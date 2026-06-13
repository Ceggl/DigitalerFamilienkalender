// API endpoint: GET /api/events (list by date range) | POST (create)

import type { APIRoute } from 'astro';
import { getOrCreateDefaultHousehold } from '@/lib/services/household';
import { getEventsByDateRange, createEvent } from '@/lib/services/calendar-event';
import { z } from 'zod';

const createEventSchema = z.object({
  title: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  allDay: z.boolean().optional(),
  icon: z.string().optional(),
  location: z.string().optional(),
  color: z.string().optional(),
  createdBy: z.string().min(1),
  rrule: z.string().optional(),
});

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const GET: APIRoute = async ({ url }) => {
  try {
    const query = querySchema.parse({
      startDate: url.searchParams.get('startDate') ?? undefined,
      endDate: url.searchParams.get('endDate') ?? undefined,
    });

    const household = await getOrCreateDefaultHousehold();
    if (!household) {
      return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
    }

    // Default to current month if not specified
    const startDate = query.startDate ? new Date(query.startDate) : new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = query.endDate ? new Date(query.endDate) : new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    endDate.setHours(23, 59, 59, 999);

    const events = getEventsByDateRange(household.id, startDate, endDate);

    return new Response(JSON.stringify(events), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error fetching events:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = createEventSchema.parse(body);

    const household = await getOrCreateDefaultHousehold();
    if (!household) {
      return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
    }

    const newEvent = await createEvent({
      ...data,
      householdId: household.id,
    });

    return new Response(JSON.stringify(newEvent), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error creating event:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
