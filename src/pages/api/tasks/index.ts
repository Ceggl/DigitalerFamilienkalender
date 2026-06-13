// API: GET/POST /api/tasks

import type { APIRoute } from 'astro';
import { getOrCreateDefaultHousehold } from '@/lib/services/household';
import { getTasksByHousehold, createTask } from '@/lib/services/task';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1),
  icon: z.string().min(1),
  description: z.string().optional(),
  rrule: z.string().optional(),
  coins: z.number().int().min(0).default(0),
  requiresCommitment: z.boolean().default(true),
  requiresVerification: z.boolean().default(false),
  defaultAssignees: z.array(z.string()).optional(),
  createdBy: z.string().min(1),
});

export const GET: APIRoute = async () => {
  try {
    const household = await getOrCreateDefaultHousehold();
    if (!household) {
      return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
    }

    const tasks = getTasksByHousehold(household.id);

    return new Response(JSON.stringify(tasks), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = createTaskSchema.parse(body);

    const household = await getOrCreateDefaultHousehold();
    if (!household) {
      return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
    }

    const newTask = await createTask({
      ...data,
      householdId: household.id,
    });

    return new Response(JSON.stringify(newTask), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error creating task:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
