'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
    } else {
      router.push('/hub');
    }
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
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-white mb-2">Welcome Back</h1>
          <p className="text-zinc-500 text-sm">Log in to track your intellectual journey.</p>
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
            Continue with Google
          </button>
        </div>

        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs uppercase tracking-wider">Or email</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
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
              placeholder="Password" 
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

          {error && (
            <p className="text-red-400 text-sm font-medium mt-2">{error}</p>
          )}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center py-4 bg-white text-black font-bold rounded-2xl border-b-4 border-zinc-300 active:border-b-0 hover:-translate-y-[1px] active:translate-y-[3px] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Log In"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center space-y-4">
          <Link href="/reset-password" className="block text-zinc-500 hover:text-white text-sm transition-colors">
            Forgotten Password?
          </Link>
          <div className="text-zinc-500 text-sm">
            Don't have an account? <Link href="/signup" className="text-white hover:underline underline-offset-4 font-medium">Sign up</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
