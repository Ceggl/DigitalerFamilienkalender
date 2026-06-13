// API: GET /api/realtime/events
// Server-Sent Events stream for real-time updates

import type { APIRoute } from 'astro';
import { getSessionFromRequest } from '@/lib/auth/session';
import { subscribe, RealtimeEvent } from '@/lib/realtime/events';
import { getOrCreateDefaultHousehold } from '@/lib/services/household';

export const GET: APIRoute = async ({ request, cookies }) => {
  // Check authentication
  const session = getSessionFromRequest(cookies);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const household = await getOrCreateDefaultHousehold();
  if (!household) {
    return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
  }

  // Set up SSE response
  const responseBody = new ReadableStream({
    start(controller) {
      // Send initial connected message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

      // Subscribe to events
      const unsubscribe = subscribe(household.id, (event: RealtimeEvent) => {
        const message = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(message);
      });

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(responseBody, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
