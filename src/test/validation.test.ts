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

  describe('Skill Tree Circular Dependency Detection (check_no_cycle)', () => {
    const checkNoCycle = (
      lessonId: string, 
      prereqId: string, 
      existingEdges: { source: string; target: string }[]
    ) => {
      if (lessonId === prereqId) return false;
      
      const visited = new Set<string>();
      const dfs = (current: string): boolean => {
        if (current === lessonId) return false; // Cycle detected
        if (visited.has(current)) return true; // Already checked pathway
        visited.add(current);
        
        const prereqs = existingEdges.filter(e => e.target === current).map(e => e.source);
        for (const p of prereqs) {
          if (!dfs(p)) return false;
        }
        return true;
      };
      
      // Simulate adding the prerequisite
      return dfs(prereqId);
    };

    it('should detect a direct self-referential cycle', () => {
      expect(checkNoCycle('A', 'A', [])).toBe(false);
    });

    it('should detect a simple A -> B -> A cycle', () => {
      // Existing: A depends on B
      const existing = [{ source: 'B', target: 'A' }]; 
      // Trying to add: B depends on A (lessonId=B, prereq=A)
      expect(checkNoCycle('B', 'A', existing)).toBe(false);
    });

    it('should detect a deep A -> B -> C -> A cycle', () => {
      const existing = [
        { source: 'B', target: 'A' },
        { source: 'C', target: 'B' }
      ];
      // Trying to add: C depends on A
      expect(checkNoCycle('C', 'A', existing)).toBe(false);
    });

    it('should allow valid non-cyclic trees', () => {
      const existing = [
        { source: 'B', target: 'A' },
        { source: 'C', target: 'B' }
      ];
      // Trying to add: A depends on D
      expect(checkNoCycle('A', 'D', existing)).toBe(true);
    });
  });
});
