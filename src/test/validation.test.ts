import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const reflectionSchema = z.string().min(1, 'Type your take to continue.').max(200, 'Keep it concise: Max 200 characters.');

describe('Reflection Validation', () => {
  it('should accept valid reflection text', () => {
    const result = reflectionSchema.safeParse('This is a great lesson on modern art.');
    expect(result.success).toBe(true);
  });

  it('should reject empty reflection', () => {
    const result = reflectionSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Type your take to continue.');
    }
  });

  it('should reject reflection over 200 characters', () => {
    const longText = 'a'.repeat(201);
    const result = reflectionSchema.safeParse(longText);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Keep it concise: Max 200 characters.');
    }
  });
});
