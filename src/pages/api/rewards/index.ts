// API: GET/POST /api/rewards

import type { APIRoute } from 'astro';
import { getOrCreateDefaultHousehold } from '@/lib/services/household';
import { getRewardsByHousehold, createReward } from '@/lib/services/reward';
import { z } from 'zod';

const createRewardSchema = z.object({
  title: z.string().min(1),
  icon: z.string().min(1),
  costCoins: z.number().int().min(1),
  requiresApproval: z.boolean().optional(),
  dailyLimit: z.number().int().positive().optional(),
});

export const GET: APIRoute = async () => {
  try {
    const household = await getOrCreateDefaultHousehold();
    if (!household) {
      return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
    }

    const rewards = getRewardsByHousehold(household.id);

    return new Response(JSON.stringify(rewards), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = createRewardSchema.parse(body);

    const household = await getOrCreateDefaultHousehold();
    if (!household) {
      return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
    }

    const newReward = await createReward({
      ...data,
      householdId: household.id,
    });

    return new Response(JSON.stringify(newReward), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error creating reward:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
