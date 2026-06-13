// API: DELETE /api/external-calendars/[id]

import type { APIRoute } from 'astro';
import { deleteExternalCalendar } from '@/lib/services/external-calendar';

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
    }

    deleteExternalCalendar(id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting calendar:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
