import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber } from '@/lib/context/auth-context';

describe('Admin Authentication & Phone Normalization', () => {
  it('normalizes 10-digit Indian phone numbers to E.164 format', () => {
    expect(normalizePhoneNumber('9788394119')).toBe('+919788394119');
    expect(normalizePhoneNumber('+91 97883 94119')).toBe('+919788394119');
    expect(normalizePhoneNumber('09788394119')).toBe('+919788394119');
  });

  it('verifies exact admin credentials matching required spec', () => {
    const adminIdentifier = '9788394119';
    const adminPassword = 'Shri@123';

    const checkCredentials = (id: string, pass: string) => {
      const cleanDigits = id.replace(/\D/g, '');
      const last10 = cleanDigits.slice(-10);
      return last10 === '9788394119' && pass === 'Shri@123';
    };

    expect(checkCredentials(adminIdentifier, adminPassword)).toBe(true);
    expect(checkCredentials('+91 97883 94119', 'Shri@123')).toBe(true);
    expect(checkCredentials('09788394119', 'Shri@123')).toBe(true);
    expect(checkCredentials('9788394119', 'WrongPass')).toBe(false);
    expect(checkCredentials('9876543210', 'Shri@123')).toBe(false);
  });
});
