'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-16 px-6 border-t border-white/[0.06] relative z-10 midnight-umber">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        <div>
          <p className="font-serif text-2xl text-white tracking-widest uppercase">Polished.</p>
          <p className="manuscript-signature text-[11px] text-white/20 uppercase mt-2 font-serif">
            MMXXVI
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <p className="text-[10px] tracking-widest text-white/20 uppercase">
            © 2026 Polished. All rights preserved.
          </p>
          <div className="flex gap-8">
            <Link href="/legal/terms" className="text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors">
              Terms of Utility
            </Link>
            <Link href="/legal/privacy" className="text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
