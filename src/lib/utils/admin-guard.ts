import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Server-side admin role check. Call at the top of any admin Server Action
 * or in admin page server components. Redirects non-admins to /hub.
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/hub?error=unauthorized');
  }

  return { userId: user.id };
}
