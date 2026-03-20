'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface ProfileUpdateResult {
  success: boolean;
  error?: string;
}

interface ProfileUpdateData {
  display_name?: string;
  bio?: string;
}

/**
 * Updates the authenticated user's profile.
 * Validates auth.uid() === userId before writing.
 * Returns typed result — never throws.
 */
export async function updateUserProfile(
  userId: string,
  data: ProfileUpdateData
): Promise<ProfileUpdateResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return { success: false, error: 'Unauthorized: session mismatch.' };
    }

    // Server-side validation
    if (data.display_name !== undefined) {
      const trimmed = data.display_name.trim();
      if (trimmed.length === 0) {
        return { success: false, error: 'Display name cannot be empty.' };
      }
      if (trimmed.length > 40) {
        return { success: false, error: 'Display name must be 40 characters or fewer.' };
      }
      data.display_name = trimmed;
    }

    if (data.bio !== undefined) {
      if (data.bio.length > 160) {
        return { success: false, error: 'Bio must be 160 characters or fewer.' };
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/account');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

/**
 * Toggles the is_spotlighted flag on a reflection.
 * RLS ensures the user can only update their own reflections.
 */
export async function toggleSpotlight(
  reflectionId: string,
  isSpotlighted: boolean
): Promise<ProfileUpdateResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'You must be signed in.' };
    }

    const { error } = await supabase
      .from('reflections')
      .update({ is_spotlighted: isSpotlighted })
      .eq('id', reflectionId)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/account');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

/**
 * Removes a saved lesson from the user's vault.
 * RLS enforces that users can only delete their own saves.
 */
export async function removeSavedLesson(
  saveId: string
): Promise<ProfileUpdateResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'You must be signed in.' };
    }

    const { error } = await supabase
      .from('saved_lessons')
      .delete()
      .eq('id', saveId)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/account');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}
