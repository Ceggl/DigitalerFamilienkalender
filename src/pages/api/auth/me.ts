// API: GET /api/auth/me
// Get current session

import type { APIRoute } from 'astro';
import { getSessionFromRequest } from '@/lib/auth/session';

export const GET: APIRoute = async ({ cookies }) => {
  const session = getSessionFromRequest(cookies);

  if (!session) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ authenticated: true, session }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
