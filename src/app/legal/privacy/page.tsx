'use client';

import { TOKENS } from '@/lib/design-tokens';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const css = `
  .polished-root {
    font-family: var(--font-sans), sans-serif;
    background: #000000;
    color: #e8e8e8;
    min-height: 100vh;
    padding: 80px 24px;
  }
`;

export default function PrivacyPage() {
  return (
    <main className="polished-root max-w-3xl mx-auto">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors mb-12 group"
      >
        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
        Back
      </Link>

      <h1 className="font-serif text-5xl text-white mb-12 tracking-tight">Data Privacy.</h1>
      
      <div className="space-y-8 font-sans font-light text-white/60 leading-relaxed">
        <section>
          <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">1. Information Minimality</h2>
          <p>We only collect the data necessary to facilitate your learning journey — primarily your email and your vaulted reflections.</p>
        </section>

        <section>
          <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">2. The Vault Guarantee</h2>
          <p>Your reflections are secured behind industry-standard encryption. We do not sell your intellectual output to third-party data brokers.</p>
        </section>

        <section>
          <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">3. Right to Erasure</h2>
          <p>At any time, you may request the full deletion of your profile and all associated vaulted data. This process is permanent and immediate.</p>
        </section>

        <p className="pt-12 text-[10px] tracking-widest text-white/20 uppercase font-medium">Last Updated: March 2026</p>
      </div>
    </main>
  );
}
