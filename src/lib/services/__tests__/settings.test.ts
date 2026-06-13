import { describe, it, expect } from 'vitest';
import { getHouseholdSettings, setSetting } from '../settings';

describe('Settings Service', () => {
  const householdId = 'test-household-settings';

  it('should return default settings for new household', () => {
    const settings = getHouseholdSettings(householdId);

    expect(settings.coinsEnabled).toBe(true);
    expect(settings.ttsEnabled).toBe(true);
    expect(settings.language).toBe('de');
    expect(settings.colorCodedAssignees).toBe(true);
  });

  it('should update a setting', () => {
    setSetting(householdId, 'coinsEnabled', false);
    const settings = getHouseholdSettings(householdId);

    expect(settings.coinsEnabled).toBe(false);
  });

  it('should persist multiple settings', () => {
    setSetting(householdId, 'nonReaderModeDefault', true);
    setSetting(householdId, 'language', 'en');

    const settings = getHouseholdSettings(householdId);

    expect(settings.nonReaderModeDefault).toBe(true);
    expect(settings.language).toBe('en');
  });
});
