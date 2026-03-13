'use client';

import { TOKENS } from '@/lib/design-tokens';
import ProfileCurator from './ProfileCurator';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
  display_name: string;
  bio: string;
  avatar_url: string;
}

interface AccountHeaderProps {
  insightsProvided?: number;
  initialProfile: ProfileData;
  onProfileUpdate?: (profile: ProfileData) => void;
  onError?: (message: string) => void;
}

export default function AccountHeader({
  insightsProvided = 0,
  initialProfile,
  onProfileUpdate,
  onError,
}: AccountHeaderProps) {
  return (
    <section className="pt-24 pb-16 px-6 relative z-10 border-b" style={{ borderColor: TOKENS.hairline }}>
      <div className="max-w-5xl mx-auto">

        <div className="mb-12">
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors mb-12 group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Back to Hub
          </Link>

          <div className="flex justify-between items-end">
            <ProfileCurator
              initialProfile={initialProfile}
              onProfileUpdate={onProfileUpdate}
              onError={onError}
            />

            <div className="hidden md:block text-right">
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">The Vault</p>
              <div className="flex items-baseline justify-end gap-2">
                <span className="font-serif text-5xl text-white leading-none">{insightsProvided}</span>
                <span className="font-sans font-light text-sm text-white/50">Insights<br />Archived</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Metric */}
        <div className="md:hidden mt-8 pt-8 border-t" style={{ borderColor: TOKENS.hairline }}>
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">The Vault</p>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-4xl text-white leading-none">{insightsProvided}</span>
            <span className="font-sans font-light text-xs text-white/50">Insights Archived</span>
          </div>
        </div>

      </div>
    </section>
  );
}
