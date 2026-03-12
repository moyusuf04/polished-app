'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('success');
      setMessage('Follow the link sent to your email to reset your password.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-white mb-2">Reset Password</h1>
          <p className="text-zinc-500 text-sm">We'll send you a link to get back in.</p>
        </div>

        {status === 'success' ? (
          <div className="bg-emerald-950/50 border border-emerald-900 rounded-2xl p-6 text-center">
            <h3 className="text-emerald-500 font-bold mb-2">Email Sent</h3>
            <p className="text-emerald-200/70 text-sm mb-6 pb-2 leading-relaxed">
              {message}
            </p>
            <Link 
              href="/login"
              className="inline-block w-full py-3 bg-zinc-900 text-white font-medium rounded-xl border border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              Back to log in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
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

            {status === 'error' && (
              <p className="text-red-400 text-sm font-medium mt-2">{message}</p>
            )}

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full flex justify-center py-4 bg-white text-black font-bold rounded-2xl border-b-4 border-zinc-300 active:border-b-0 hover:-translate-y-[1px] active:translate-y-[2px] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {status === 'loading' ? <Loader2 className="w-6 h-6 animate-spin" /> : "Send Link"}
              </button>
            </div>
            
            <div className="pt-4 text-center">
               <Link href="/login" className="text-zinc-500 hover:text-white text-sm transition-colors font-medium">
                 Cancel and return
               </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
