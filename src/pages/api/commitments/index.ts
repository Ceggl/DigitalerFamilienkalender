// API: GET /api/commitments | POST for new commitment

import type { APIRoute } from 'astro';
import { createCommitment, getCommitmentChain, verifyChain } from '@/lib/services/commitment';
import { z } from 'zod';

const createCommitmentSchema = z.object({
  taskInstanceId: z.string().min(1),
  personId: z.string().min(1),
  type: z.enum(['discussed', 'agreed', 'done', 'verified', 'declined']),
  witnessedBy: z.string().optional(),
  note: z.string().optional(),
});

const querySchema = z.object({
  taskInstanceId: z.string().optional(),
  verify: z.string().optional(), // "true" to verify the chain
});

export const GET: APIRoute = async ({ url }) => {
  try {
    const query = querySchema.parse({
      taskInstanceId: url.searchParams.get('taskInstanceId') ?? undefined,
      verify: url.searchParams.get('verify') ?? undefined,
    });

    if (!query.taskInstanceId) {
      return new Response(JSON.stringify({ error: 'taskInstanceId required' }), {
        status: 400,
      });
    }

    const chain = getCommitmentChain(query.taskInstanceId);

    if (query.verify === 'true') {
      const verification = verifyChain(query.taskInstanceId);
      return new Response(
        JSON.stringify({
          chain,
          verification,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(chain), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error fetching commitments:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = createCommitmentSchema.parse(body);

    const commitment = await createCommitment(data);

    return new Response(JSON.stringify(commitment), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error creating commitment:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
