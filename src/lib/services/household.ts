// Household service – creates and manages households
// In Phase 0 we assume a single household per deployment; Phase 7 enables multiple.

import { db } from '@/lib/db/client';
import { household } from '@/lib/db/schema';
import { v4 as uuid } from 'crypto';

export async function getOrCreateDefaultHousehold() {
  // For now, return the first household or create one
  const existing = db.query.household.findFirst();

  if (existing) {
    return existing;
  }

  const id = uuid().toString();
  db.insert(household).values({
    id,
    name: 'Familie',
    timezone: 'Europe/Berlin',
  });

  return db.query.household.findFirst({
    where: (h, { eq }) => eq(h.id, id),
  });
}

export function getHouseholdById(id: string) {
  return db.query.household.findFirst({
    where: (h, { eq }) => eq(h.id, id),
  });
}
