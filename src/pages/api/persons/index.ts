// API endpoint: GET /api/persons (list) | POST (create)

import type { APIRoute } from 'astro';
import { getOrCreateDefaultHousehold } from '@/lib/services/household';
import { getPersonsByHousehold, createPerson } from '@/lib/services/person';
import { z } from 'zod';

const createPersonSchema = z.object({
  displayName: z.string().min(1),
  avatarKind: z.enum(['photo', 'emoji', 'illustration']),
  avatarValue: z.string().min(1),
  color: z.string().min(1),
  role: z.enum(['adult', 'caregiver', 'child']),
  pin: z.string().optional(),
  isNonReader: z.boolean().optional(),
  ttsEnabled: z.boolean().optional(),
});

export const GET: APIRoute = async () => {
  try {
    const household = await getOrCreateDefaultHousehold();
    if (!household) {
      return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
    }

    const people = getPersonsByHousehold(household.id);

    return new Response(JSON.stringify(people), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching persons:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = createPersonSchema.parse(body);

    const household = await getOrCreateDefaultHousehold();
    if (!household) {
      return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
    }

    const newPerson = await createPerson({
      ...data,
      householdId: household.id,
    });

    return new Response(JSON.stringify(newPerson), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error creating person:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
