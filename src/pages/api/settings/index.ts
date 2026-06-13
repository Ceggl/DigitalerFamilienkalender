// API: GET /api/settings (fetch) | POST (update)

import type { APIRoute } from 'astro';
import { getOrCreateDefaultHousehold } from '@/lib/services/household';
import { getHouseholdSettings, setSetting } from '@/lib/services/settings';
import { z } from 'zod';

const settingsSchema = z.object({
  coinsEnabled: z.boolean().optional(),
  requiresVerification: z.boolean().optional(),
  nonReaderModeDefault: z.boolean().optional(),
  ttsEnabled: z.boolean().optional(),
  language: z.enum(['de', 'en']).optional(),
  colorCodedAssignees: z.boolean().optional(),
});

export const GET: APIRoute = async () => {
  try {
    const household = await getOrCreateDefaultHousehold();
    if (!household) {
      return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
    }

    const settings = getHouseholdSettings(household.id);

    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const updates = settingsSchema.parse(body);

    const household = await getOrCreateDefaultHousehold();
    if (!household) {
      return new Response(JSON.stringify({ error: 'Household not found' }), { status: 500 });
    }

    // Update each setting
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setSetting(household.id, key, value);
      }
    });

    const updatedSettings = getHouseholdSettings(household.id);

    return new Response(JSON.stringify(updatedSettings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    console.error('Error updating settings:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
