'use server';

/**
 * Server Action deduplication guard.
 * Prevents double-click / rapid-fire submissions within a 500ms window.
 * Keyed by action name + a caller-provided unique key (e.g. form ID or entity ID).
 */

const recentActions = new Map<string, number>();

// Prune stale entries periodically
const WINDOW_MS = 500;
const PRUNE_THRESHOLD = 100;

function pruneStale() {
  if (recentActions.size > PRUNE_THRESHOLD) {
    const now = Date.now();
    for (const [key, ts] of recentActions.entries()) {
      if (now - ts > WINDOW_MS * 2) {
        recentActions.delete(key);
      }
    }
  }
}

export async function checkDedupe(actionKey: string): Promise<{ allowed: boolean; error?: string }> {
  pruneStale();

  const now = Date.now();
  const lastCall = recentActions.get(actionKey);

  if (lastCall && now - lastCall < WINDOW_MS) {
    return { allowed: false, error: 'Duplicate submission detected. Please wait a moment.' };
  }

  recentActions.set(actionKey, now);
  return { allowed: true };
}
