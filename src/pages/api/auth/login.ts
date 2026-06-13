// API: POST /api/auth/login
// Avatar-based login or PIN verification

import type { APIRoute } from 'astro';
import { getPersonById, verifyPin } from '@/lib/services/person';
import { createSession } from '@/lib/auth/session';
import { z } from 'zod';

const loginSchema = z.object({
  personId: z.string().min(1),
  pin: z.string().optional(), // required only for adults
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const person = getPersonById(data.personId);
    if (!person) {
      return new Response(JSON.stringify({ error: 'Person not found' }), { status: 404 });
    }

    // If person has a PIN, verify it
    if (person.pinHash) {
      if (!data.pin) {
        return new Response(JSON.stringify({ error: 'PIN required' }), { status: 400 });
      }

      const validPin = await verifyPin(data.personId, data.pin);
      if (!validPin) {
        return new Response(JSON.stringify({ error: 'Invalid PIN' }), { status: 401 });
      }
    }

    // Create session
    const session = createSession(data.personId);

    // Set HTTP-only cookie
    cookies.set('fk_session', JSON.stringify(session), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: '/',
    });

    return new Response(JSON.stringify(session), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error logging in:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
