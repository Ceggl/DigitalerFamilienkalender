// API: GET /api/coins (balance/ledger) | POST (record entry)

import type { APIRoute } from 'astro';
import { recordCoinEntry, getCoinBalance, getCoinLedger } from '@/lib/services/coins';
import { z } from 'zod';

const recordCoinSchema = z.object({
  personId: z.string().min(1),
  delta: z.number().int(),
  reason: z.enum(['task_completed', 'reward_redeemed', 'manual_adjustment']),
  taskInstanceId: z.string().optional(),
  rewardRedemptionId: z.string().optional(),
  createdBy: z.string().min(1),
});

const querySchema = z.object({
  personId: z.string().optional(),
  balance: z.string().optional(),
});

export const GET: APIRoute = async ({ url }) => {
  try {
    const query = querySchema.parse({
      personId: url.searchParams.get('personId') ?? undefined,
      balance: url.searchParams.get('balance') ?? undefined,
    });

    if (!query.personId) {
      return new Response(JSON.stringify({ error: 'personId required' }), { status: 400 });
    }

    if (query.balance === 'true') {
      const balance = getCoinBalance(query.personId);
      return new Response(JSON.stringify({ personId: query.personId, balance }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ledger = getCoinLedger(query.personId);

    return new Response(JSON.stringify(ledger), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error fetching coins:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = recordCoinSchema.parse(body);

    const entry = await recordCoinEntry(data);

    return new Response(JSON.stringify(entry), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error recording coin entry:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
