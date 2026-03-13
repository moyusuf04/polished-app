'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-12 px-6 border-t border-white/5 relative z-10 bg-black">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        <div>
          <p className="font-serif text-2xl text-white tracking-widest uppercase">Polished.</p>
          <p className="text-[10px] tracking-widest text-white/30 uppercase mt-2">© 2026 Polished. All rights preserved.</p>
        </div>
        
        <div className="flex gap-8">
          <Link href="/legal/terms" className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors">
            Terms of Utility
          </Link>
          <Link href="/legal/privacy" className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
