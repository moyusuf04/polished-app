'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

export async function updateUserProfile(
  target_id: string,
  display_name: string,
  bio: string
): Promise<UpdateProfileResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Ownership check
    if (!user || user.id !== target_id) {
      return { success: false, error: 'Unauthorised' };
    }

    // 2. Input validation
    const trimmedName = display_name.trim();
    if (trimmedName.length < 1) {
      return { success: false, error: 'Display name cannot be empty.' };
    }
    if (trimmedName.length > 40) {
      return { success: false, error: 'Display name must be 40 characters or fewer.' };
    }

    if (bio.length > 160) {
        return { success: false, error: 'Bio must be 160 characters or fewer.' };
    }

    // 3. Database update
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: trimmedName,
        bio: bio.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', target_id);

    if (error) {
      console.error('Failed to update profile:', error);
      return { success: false, error: 'Database update failed.' };
    }

    // 4. Revalidate
    revalidatePath('/account');
    return { success: true };
    
  } catch (err) {
    console.error('Unexpected error in updateUserProfile:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
