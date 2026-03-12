import { createBrowserClient } from '@supabase/ssr';

/**
 * Initializes the Supabase client for the browser.
 * 
 * IMPORTANT: You must define the following environment variables in a `.env.local` file 
 * at the root of your project for this to work:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 
 * This client instance provides access to your Supabase project, enabling features like
 * anonymous Guest Mode authentication (via supabase.auth.signInAnonymously()) and 
 * data fetching for lessons and reflections.
 */
export function createClient() {
  // Ensure that we throw a helpful error in development if the variables are missing
  if (process.env.NODE_ENV !== 'production') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn('Missing env variable: NEXT_PUBLIC_SUPABASE_URL. Please add it to your .env.local file.');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Missing env variable: NEXT_PUBLIC_SUPABASE_ANON_KEY. Please add it to your .env.local file.');
    }
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
