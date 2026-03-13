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

export default function TermsPage() {
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

      <h1 className="font-serif text-5xl text-white mb-12 tracking-tight">Terms of Utility.</h1>
      
      <div className="space-y-8 font-sans font-light text-white/60 leading-relaxed">
        <section>
          <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">1. The Polish Protocol</h2>
          <p>By accessing Polished, you agree to engage with the content in a way that prioritizes intellectual growth and conversational utility.</p>
        </section>

        <section>
          <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">2. Intellectual Assets</h2>
          <p>Any reflections vaulted within the platform remain the intellectual property of the author, but are contributed to the collective environment to foster debate and discourse.</p>
        </section>

        <section>
          <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">3. Premium Conduct</h2>
          <p>Users are expected to maintain an executive standard of communication. Hate speech, spam, or intentional misinformation is grounds for immediate account suspension.</p>
        </section>

        <p className="pt-12 text-[10px] tracking-widest text-white/20 uppercase font-medium">Last Updated: March 2026</p>
      </div>
    </main>
  );
}
