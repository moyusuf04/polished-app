import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  // Also support the next parameter which allows redirecting to a specific page
  // after the auth callback resolves
  const next = searchParams.get('next') ?? '/hub';

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session token
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("Auth callback error:", error);
  }

  // If there's an error or no code, redirect to login page with an error state
  // You could also redirect to an error page instead
  return NextResponse.redirect(`${origin}/login?error=Could not verify session`);
}
