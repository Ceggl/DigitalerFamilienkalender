// API: POST /api/reward-redemptions (request redemption)

import type { APIRoute } from 'astro';
import { requestRedemption, getRedemptionsByPerson } from '@/lib/services/reward';
import { getCoinBalance } from '@/lib/services/coins';
import { z } from 'zod';

const requestRedemptionSchema = z.object({
  rewardId: z.string().min(1),
  personId: z.string().min(1),
});

const querySchema = z.object({
  personId: z.string().optional(),
});

export const GET: APIRoute = async ({ url }) => {
  try {
    const query = querySchema.parse({
      personId: url.searchParams.get('personId') ?? undefined,
    });

    if (!query.personId) {
      return new Response(JSON.stringify({ error: 'personId required' }), { status: 400 });
    }

    const redemptions = getRedemptionsByPerson(query.personId);

    return new Response(JSON.stringify(redemptions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = requestRedemptionSchema.parse(body);

    // Check if person has enough coins
    const balance = getCoinBalance(data.personId);
    // Note: cost check happens on reward fetch in real implementation
    // For now, we trust the request

    const redemption = await requestRedemption(data.rewardId, data.personId);

    return new Response(JSON.stringify(redemption), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error requesting redemption:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
