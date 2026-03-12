'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Read the guest ID passed from the conversion wall in LessonClient
  const originGuestId = searchParams.get('origin_guest_id');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setIsLoading(true);

    const { data: { session: existingSession } } = await supabase.auth.getSession();
    
    let errorToHandle = null;

    if (existingSession?.user.is_anonymous) {
      // Convert anonymous user to permanent
      const { error: updateError } = await supabase.auth.updateUser({
        email,
        password,
      });
      errorToHandle = updateError;
    } else {
      // Standard signup
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      errorToHandle = signUpError;
    }

    if (errorToHandle) {
      setError(errorToHandle.message);
      setIsLoading(false);
      return;
    }

    // --- Guest Data Migration ---
    // If the user came from the conversion wall with a local guest ID,
    // call the RPC to atomically transfer their progress and reflections.
    if (originGuestId) {
      const { data: { session: newSession } } = await supabase.auth.getSession();
      if (newSession) {
        const { error: rpcError } = await supabase.rpc('migrate_guest_data', {
          new_user_id: newSession.user.id,
          guest_id: originGuestId,
        });
        if (rpcError) {
          // Non-fatal: log but don't block navigation. Data may already be linked
          // (standard anon users) or will be retrieved from server on next login.
          console.warn('Guest data migration warning:', rpcError.message);
        }
      }
      // Clear local guest state regardless of RPC result
      localStorage.removeItem('guestId');
      localStorage.removeItem('completed_lessons');
    }

    router.push('/hub');
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm mt-8 mb-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-white mb-2">Join Polished</h1>
          <p className="text-zinc-500 text-sm">Start your intellectual journey today.</p>
        </div>

        <div className="space-y-3 mb-6">
          <button 
            type="button"
            onClick={() => handleOAuthLogin('google')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium transition-colors border border-zinc-800 hover:border-zinc-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>
        </div>

        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs uppercase tracking-wider">Or email</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="sr-only" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" 
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-zinc-700 transition-all font-sans placeholder:text-zinc-600" 
            />
          </div>

          <div className="relative">
            <label className="sr-only" htmlFor="password">Password</label>
            <input 
              id="password"
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password" 
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-4 pr-12 py-4 outline-none focus:ring-2 focus:ring-zinc-700 transition-all font-sans placeholder:text-zinc-600" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div>
            <label className="sr-only" htmlFor="confirmPassword">Confirm Password</label>
            <input 
              id="confirmPassword"
              type={showPassword ? "text" : "password"} 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password" 
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-zinc-700 transition-all font-sans placeholder:text-zinc-600" 
            />
          </div>

          <div className="pt-2 pb-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded border-2 border-zinc-700 peer-checked:bg-white peer-checked:border-white transition-all"></div>
                <svg className="absolute w-3 h-3 text-black opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors leading-snug">
                I agree to the <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
              </span>
            </label>
          </div>

          {error && (
            <p className="text-red-400 text-sm font-medium mt-1">{error}</p>
          )}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center py-4 bg-white text-black font-bold rounded-2xl border-b-4 border-zinc-300 active:border-b-0 hover:-translate-y-[1px] active:translate-y-[3px] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <div className="text-zinc-500 text-sm">
            Already have an account? <Link href="/login" className="text-white hover:underline underline-offset-4 font-medium">Log in</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
