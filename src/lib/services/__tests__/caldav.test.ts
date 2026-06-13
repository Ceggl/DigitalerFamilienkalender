import { describe, it, expect } from 'vitest';
import { encryptSecret, decryptSecret } from '@/lib/utils/secrets';

describe('CalDAV & Secrets', () => {
  it('should encrypt and decrypt secrets', () => {
    const password = 'super-secret-password-123!';
    const encrypted = encryptSecret(password);

    // Encrypted should be different from plain
    expect(encrypted).not.toBe(password);
    expect(encrypted).toContain(':'); // Should have iv:encrypted format

    // Should decrypt back
    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(password);
  });

  it('should produce different ciphertexts for same plaintext', () => {
    const password = 'same-password';
    const encrypted1 = encryptSecret(password);
    const encrypted2 = encryptSecret(password);

    // Different IVs should produce different ciphertexts
    expect(encrypted1).not.toBe(encrypted2);

    // But both should decrypt to same value
    const decrypted1 = decryptSecret(encrypted1);
    const decrypted2 = decryptSecret(encrypted2);
    expect(decrypted1).toBe(password);
    expect(decrypted2).toBe(password);
  });
});
