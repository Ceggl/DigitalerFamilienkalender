// Settings service – household & person configuration

import { db } from '@/lib/db/client';
import { setting } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export interface HouseholdSettings {
  coinsEnabled: boolean;
  requiresVerification: boolean;
  nonReaderModeDefault: boolean;
  ttsEnabled: boolean;
  language: 'de' | 'en';
  colorCodedAssignees: boolean;
}

const DEFAULT_SETTINGS: HouseholdSettings = {
  coinsEnabled: true,
  requiresVerification: true,
  nonReaderModeDefault: false,
  ttsEnabled: true,
  language: 'de',
  colorCodedAssignees: true,
};

export function getHouseholdSettings(householdId: string): HouseholdSettings {
  const rows = db.query.setting.findMany({
    where: (s, { eq: eqOp }) => eqOp(s.householdId, householdId),
  });

  const settings: Record<string, unknown> = { ...DEFAULT_SETTINGS };

  rows.forEach((row) => {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  });

  return settings as HouseholdSettings;
}

export function setSetting(householdId: string, key: string, value: unknown) {
  const existing = db.query.setting.findFirst({
    where: (s, { eq: eqOp, and: andOp }) =>
      andOp(eqOp(s.householdId, householdId), eqOp(s.key, key)),
  });

  const jsonValue = JSON.stringify(value);

  if (existing) {
    db.update(setting)
      .set({ value: jsonValue })
      .where(and(eq(setting.householdId, householdId), eq(setting.key, key)));
  } else {
    db.insert(setting).values({
      householdId,
      key,
      value: jsonValue,
    });
  }

  return value;
}

export function getPersonSettings(personId: string) {
  // For Phase 3: per-person settings (non-reader mode, TTS, etc.)
  // These are stored in person table directly
  // Later: separate person_settings table if needed
  return {
    nonReaderMode: false, // TODO: read from person.is_non_reader
    ttsEnabled: false, // TODO: read from person.tts_enabled
  };
}
